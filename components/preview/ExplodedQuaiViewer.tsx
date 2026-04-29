"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getModuleXLength, type ModuleRef } from "@/lib/configurateur";
import {
  buildProceduralModule,
  createConcreteMaterial,
  type ColorisId,
} from "./ModuleViewer";

interface ExplodedQuaiViewerProps {
  className?: string;
  coloris?: ColorisId;
  /** Applique un miroir X au quai (scale.x = -1). Défaut: false */
  mirrorX?: boolean;
  /** Côté caméra : "chaussee" voit l'arrière des modules, "trottoir" voit le chanfrein avant. Défaut: "chaussee" */
  cameraSide?: "chaussee" | "trottoir";
}

type ExplodedItem = {
  ref: ModuleRef;
  /** Rang (1 = arrière, 2 = chaussée) — détermine flipZ et z position */
  rang: 1 | 2;
  /** Lift vertical pour l'effet "exploded" */
  liftY: number;
  /** Rotation Y optionnelle (pour fins de quai et jonctions) */
  rotateY?: number;
};

const ROW_DEPTH = 1.5;

// Double quai îlot 10m — composition validée le 2026-04-29 (template par défaut du configurateur).
// Rang 1 (arrière) : D-004a + D-005 + D-007a + D-005 + D-003a
// Rang 2 (chaussée) : D-004 + D-002 + D-007 + D-002 + D-003
// LiftY progressifs (étagés) pour montrer le montage pièce par pièce.
const ITEMS: ExplodedItem[] = [
  // Rang 2 (chaussée, devant) — léger étagement pour effet "exploded"
  { ref: "D-004", rang: 2, liftY: 0    },
  { ref: "D-002", rang: 2, liftY: 0.20 },
  { ref: "D-007", rang: 2, liftY: 0.40 },
  { ref: "D-002", rang: 2, liftY: 0.60 },
  { ref: "D-003", rang: 2, liftY: 0.80 },
  // Rang 1 (arrière) — étagé plus haut
  { ref: "D-004a", rang: 1, liftY: 1.10, rotateY: -Math.PI / 2 },
  { ref: "D-005",  rang: 1, liftY: 1.45 },
  { ref: "D-007a", rang: 1, liftY: 1.80, rotateY: -Math.PI / 2 },
  { ref: "D-005",  rang: 1, liftY: 2.15 },
  { ref: "D-003a", rang: 1, liftY: 2.50, rotateY: +Math.PI / 2 },
];

export function ExplodedQuaiViewer({
  className,
  coloris = "granit-gris",
  mirrorX = false,
  cameraSide = "chaussee",
}: ExplodedQuaiViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(4, 8, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -16;
    key.shadow.camera.right = 16;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -4;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, 5, -3);
    scene.add(fill);

    // Sol fantôme pour les ombres
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 16),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    scene.add(ground);

    const concreteMat = createConcreteMaterial(coloris);

    const dashLineMat = new THREE.LineDashedMaterial({
      color: 0x9ca3af,
      dashSize: 0.08,
      gapSize: 0.06,
      linewidth: 1,
    });

    // Pivot central pour rotation auto + miroir X optionnel
    const pivot = new THREE.Group();
    if (mirrorX) pivot.scale.x = -1;
    scene.add(pivot);

    const items: { holder: THREE.Group; baseY: number; targetX: number }[] = [];

    // Calcule x cumulatif par rang (avec helper pour D-007/D-007a)
    const xByRang: Record<1 | 2, number> = { 1: 0, 2: 0 };
    const placements = ITEMS.map((item) => {
      const xMm = xByRang[item.rang];
      xByRang[item.rang] += getModuleXLength(item.ref);
      return { ...item, xMm };
    });

    // Longueur totale du quai et centre X global pour centrer la scène
    const totalLengthMm = Math.max(xByRang[1], xByRang[2]);
    const centerXm = totalLengthMm / 2 / 1000;

    placements.forEach((item) => {
      const g = buildProceduralModule(item.ref, concreteMat, coloris, item.rotateY ?? 0);
      // Convention : flip Z UNIQUEMENT pour rang 2 (chaussée). Rang 1 = naturel (biseau face arrière extérieur).
      if (item.rang === 2) g.scale.z = -1;
      if (item.rotateY !== undefined) g.rotation.y = item.rotateY;
      g.updateMatrixWorld(true);

      // bbox slab après transformations
      let slab: THREE.Object3D = g.children[0];
      if (slab.type === "Group") slab = (slab as THREE.Group).children[0];
      const box = new THREE.Box3().setFromObject(slab);

      const xLenM = getModuleXLength(item.ref) / 1000;
      const xCenterM = item.xMm / 1000 + xLenM / 2 - centerXm;
      const zM = item.rang === 1 ? +ROW_DEPTH / 2 : -ROW_DEPTH / 2;

      const holder = new THREE.Group();
      holder.position.x = xCenterM;
      holder.position.y = -box.min.y + item.liftY;
      holder.position.z = zM;
      holder.add(g);
      pivot.add(holder);

      // Ligne pointillée verticale qui montre où le module redescendrait
      if (item.liftY > 0.01) {
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(xCenterM, -box.min.y, zM),
          new THREE.Vector3(xCenterM, holder.position.y, zM),
        ]);
        const line = new THREE.Line(lineGeom, dashLineMat);
        line.computeLineDistances();
        scene.add(line);
      }

      items.push({ holder, baseY: -box.min.y, targetX: xCenterM });
    });

    // Camera fit — cadré sur la longueur totale du quai (zoom serré)
    const sceneCenter = new THREE.Vector3(0, 1.3, 0);
    const fitRadius = Math.max(totalLengthMm / 1000, 6) * 0.50;
    const fovRad = camera.fov * (Math.PI / 180);
    const dist = (fitRadius / Math.tan(fovRad / 2)) * 1.05;
    const dirZ = cameraSide === "chaussee" ? -1 : 1;
    const dir = new THREE.Vector3(0.5, 0.55, dirZ).normalize();
    camera.position.copy(sceneCenter).add(dir.multiplyScalar(dist));
    camera.lookAt(sceneCenter);
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.copy(sceneCenter);
    controls.update();

    let isInteracting = false;
    controls.addEventListener("start", () => (isInteracting = true));
    controls.addEventListener("end", () => (isInteracting = false));

    let raf = 0;
    const animate = () => {
      if (!isInteracting) pivot.rotation.y += 0.0025;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh & THREE.LineSegments;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            (mesh.material as THREE.Material).dispose();
          }
        }
      });
    };
  }, [coloris, mirrorX, cameraSide]);

  return (
    <div
      className={
        className ?? "relative w-full h-full bg-gradient-to-br from-sky-50 via-white to-gray-50"
      }
    >
      <div ref={containerRef} className="absolute inset-0" />
      {/* Logo URBAQUAI top-left */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-urbaquai.png"
          alt="URBAQUAI"
          className="h-7 lg:h-8 w-auto drop-shadow-sm"
        />
      </div>
    </div>
  );
}
