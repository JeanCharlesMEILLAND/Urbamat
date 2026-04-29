"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ObjViewerProps {
  url: string;
  autoRotate?: boolean;
}

export function ObjViewer({ url, autoRotate = false }: ObjViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setError(null);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    // Transparent background — let the underlying container colour show through

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100000);
    camera.position.set(3, 2, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting setup tuned for matte concrete: bright key + soft fill + rim
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-5, 4, -3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xfff8e0, 0.3);
    rim.position.set(0, -2, -5);
    scene.add(rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    const pivot = new THREE.Group();
    scene.add(pivot);

    // Subtle circular shadow-catcher under the object
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 64),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    ground.receiveShadow = true;
    scene.add(ground);

    let cancelled = false;
    const loader = new OBJLoader();
    loader.load(
      url,
      (obj) => {
        if (cancelled) return;
        // Concrete-like material: warm grey, matte, no metallic sheen
        const material = new THREE.MeshStandardMaterial({
          color: "#C8C2B5",
          roughness: 0.92,
          metalness: 0.02,
          flatShading: true,
        });

        // Compute global bbox in local space (no transforms applied)
        const globalBox = new THREE.Box3();
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.computeBoundingBox();
            const childBox = mesh.geometry.boundingBox!.clone();
            globalBox.union(childBox);
          }
        });
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        globalBox.getSize(size);
        globalBox.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetSize = 2;
        const scale = targetSize / maxDim;

        // Bake center + scale into each mesh geometry, add concrete + edge overlay
        const edgeMat = new THREE.LineBasicMaterial({ color: "#3D2A4F", transparent: true, opacity: 0.55 });
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.translate(-center.x, -center.y, -center.z);
            mesh.geometry.scale(scale, scale, scale);
            mesh.geometry.computeVertexNormals();
            mesh.material = material;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // Add edge overlay so concrete shapes pop visually
            const edges = new THREE.EdgesGeometry(mesh.geometry, 20);
            const lines = new THREE.LineSegments(edges, edgeMat);
            mesh.add(lines);
          }
        });

        pivot.add(obj);

        // Camera fit: bounding sphere of the rescaled object
        const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), targetSize * 0.7);
        const fov = camera.fov * (Math.PI / 180);
        const distance = (sphere.radius / Math.tan(fov / 2)) * 1.05;
        const dir = new THREE.Vector3(1, 0.7, 1).normalize();
        camera.position.copy(dir.multiplyScalar(distance));
        camera.lookAt(0, 0, 0);
        camera.near = Math.max(0.001, distance / 1000);
        camera.far = distance * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.maxDistance = distance * 5;
        controls.minDistance = distance / 20;
        controls.update();

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("OBJ load error:", err);
        if (!cancelled) {
          setError("Impossible de charger le modèle");
          setLoading(false);
        }
      }
    );

    let raf = 0;
    const animate = () => {
      if (autoRotate) pivot.rotation.y += 0.004;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      pivot.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            (mesh.material as THREE.Material)?.dispose();
          }
        }
      });
    };
  }, [url, autoRotate]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 pointer-events-none">
          Chargement…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-red-600 pointer-events-none">
          {error}
        </div>
      )}
    </div>
  );
}
