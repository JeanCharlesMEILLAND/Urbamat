"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { type ModuleRef } from "@/lib/configurateur";
import { buildProceduralModule, createConcreteMaterial } from "./ModuleViewer";

const ROW_DEPTH = 1.5;

type ModulePlacement = {
  ref: ModuleRef;
  mirror?: boolean;
  rotateY?: number;
  flipZ?: boolean;
};

// Row 1 (trottoir) — D-009 nouvelle spec (rampe 18→10cm) puis pairs
const ROW1: ModulePlacement[] = [
  { ref: "D-009", mirror: true },
  { ref: "D-004a", rotateY: -Math.PI / 2 },
  { ref: "D-005" },
  { ref: "D-005" },
  { ref: "D-007a", rotateY: Math.PI / 2 },
  { ref: "D-005" },
  { ref: "D-005" },
  { ref: "D-003a", rotateY: Math.PI / 2 },
];

// Row 2 (chaussée) — démarre au niveau de D-004a (index 1 de ROW1)
const ROW2_START_INDEX = 1;
const ROW2: ModulePlacement[] = [
  { ref: "D-004", flipZ: true },
  { ref: "D-002", flipZ: true },
  { ref: "D-002", flipZ: true },
  { ref: "D-007", rotateY: Math.PI },
  { ref: "D-002", flipZ: true },
  { ref: "D-002", flipZ: true },
  { ref: "D-003", flipZ: true },
];

export function ComboViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.01, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(3, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, 5, -3);
    scene.add(fill);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 12),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    scene.add(ground);

    const concreteMat = createConcreteMaterial("granit-gris");

    // Build a module group with all transforms applied, return {group, bboxX min/max, bboxY min}
    const buildPlacement = (p: ModulePlacement) => {
      const g = buildProceduralModule(p.ref, concreteMat, "granit-gris", p.rotateY ?? 0);
      if (p.mirror) g.scale.x = -1;
      if (p.flipZ) g.scale.z = -1;
      if (p.rotateY) g.rotation.y = p.rotateY;
      g.updateMatrixWorld(true);
      // Bbox du slab uniquement — exclut plaque métal, inserts, patins, edges.
      // D-004/D-008a sont enveloppés dans un Group(mirrorOnX/Z) → on déballe.
      let slab: THREE.Object3D = g.children[0];
      if (slab.type === "Group") slab = (slab as THREE.Group).children[0];
      const box = new THREE.Box3().setFromObject(slab);
      let minX = box.min.x;
      let maxX = box.max.x;
      // Rampe : on rentre le bord du biseau (25mm) pour que le module suivant
      // se colle au pied du biseau plutôt qu'au coin top-edge qui le dépasse.
      if (p.ref === "D-009" || p.ref === "D-009s") {
        const chamferW = 0.025;
        const isInverted = p.ref === "D-009s";
        const highOnPlusX = isInverted ? !p.mirror : !!p.mirror;
        if (highOnPlusX) maxX -= chamferW;
        else minX += chamferW;
      }
      return { group: g, minX, maxX, minY: box.min.y };
    };

    // Quai miroir global (orientation route France)
    const platformGroup = new THREE.Group();
    platformGroup.scale.x = -1;
    scene.add(platformGroup);

    const CANIVEAU_WIDTH = 0.25;
    const TROT_H = 0.16; // 160mm (standard FR)
    const backPlateMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8dc,
      roughness: 0.25,
      metalness: 1.0,
    });

    // Place a placement at a given world startX (left edge) and zCenter, return endX (right edge)
    const placeAt = (
      built: ReturnType<typeof buildPlacement>,
      startX: number,
      zCenter: number,
      ref?: ModuleRef
    ): number => {
      const length = built.maxX - built.minX;
      const holder = new THREE.Group();
      holder.position.x = startX - built.minX;
      holder.position.z = zCenter;
      holder.position.y = -built.minY;
      holder.add(built.group);

      // Plaque arrière "raccord T2" (PDF) : 510mm incliné sur caniveau + 1500mm plat sur trottoir
      const isRampe = ref === "D-009" || ref === "D-009s";
      if (zCenter > 0 && !isRampe) {
        const plateWidth = built.maxX - built.minX;
        const plateXCenter = (built.minX + built.maxX) / 2;
        const dropY = 0.18 - TROT_H;
        const flatRun = 0.06; // 60mm sur trottoir
        const plateThickness = 0.005;
        const inclineLength = Math.sqrt(dropY * dropY + CANIVEAU_WIDTH * CANIVEAU_WIDTH);
        const slopeAngle = Math.atan2(dropY, CANIVEAU_WIDTH);
        const yInner = 0.09;
        const yOuter = yInner - dropY;
        const zInner = ROW_DEPTH / 2;
        const zCurb = zInner + CANIVEAU_WIDTH;
        const zEnd = zCurb + flatRun;
        const liftY = 0.001; // évite z-fighting

        const incline = new THREE.Mesh(
          new THREE.BoxGeometry(plateWidth, plateThickness, inclineLength),
          backPlateMat
        );
        incline.rotation.x = slopeAngle;
        incline.position.set(plateXCenter, (yInner + yOuter) / 2 + liftY, (zInner + zCurb) / 2);
        incline.castShadow = true;
        holder.add(incline);

        const flat = new THREE.Mesh(
          new THREE.BoxGeometry(plateWidth, plateThickness, flatRun),
          backPlateMat
        );
        flat.position.set(plateXCenter, yOuter + plateThickness / 2 + liftY, (zCurb + zEnd) / 2);
        flat.castShadow = true;
        holder.add(flat);
      }

      platformGroup.add(holder);
      return startX + length;
    };

    // Pre-build everything to get exact bboxes
    const row1Built = ROW1.map(buildPlacement);
    const row2Built = ROW2.map(buildPlacement);

    // Compute row 1 X positions (start edges) using actual bbox lengths
    const row1Lengths = row1Built.map((b) => b.maxX - b.minX);
    const row1Total = row1Lengths.reduce((s, l) => s + l, 0);
    const row1StartX = -row1Total / 2;
    const row1Starts: number[] = [];
    {
      let x = row1StartX;
      row1Lengths.forEach((l) => {
        row1Starts.push(x);
        x += l;
      });
    }

    // Place row 1 (trottoir, derrière) at zCenter = +ROW_DEPTH/2
    row1Built.forEach((b, i) => {
      placeAt(b, row1Starts[i], +ROW_DEPTH / 2, ROW1[i].ref);
    });

    // Place row 2 (chaussée, devant) at zCenter = -ROW_DEPTH/2
    row2Built.forEach((b, i) => {
      const pairedRow1Index = ROW2_START_INDEX + i;
      const startX = row1Starts[pairedRow1Index];
      placeAt(b, startX, -ROW_DEPTH / 2, ROW2[i].ref);
    });

    // Camera fit
    const sceneBox = new THREE.Box3().setFromObject(scene);
    const sceneSize = new THREE.Vector3();
    const sceneCenter = new THREE.Vector3();
    sceneBox.getSize(sceneSize);
    sceneBox.getCenter(sceneCenter);
    sceneCenter.y = 0;
    const fitRadius = Math.max(sceneSize.x, sceneSize.z * 2.5) * 0.55;
    const fovRad = camera.fov * (Math.PI / 180);
    const dist = (fitRadius / Math.tan(fovRad / 2)) * 1.0;
    // Vue 3/4 légèrement plongeante, côté chaussée (cohérent avec configurateur + vue éclatée produit)
    const dir = new THREE.Vector3(0.15, 0.55, -1).normalize();
    camera.position.copy(sceneCenter).add(dir.multiplyScalar(dist));
    camera.lookAt(sceneCenter);
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.copy(sceneCenter);
    controls.update();

    let raf = 0;
    const animate = () => {
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
    };
  }, []);

  return <div ref={containerRef} className="relative w-full h-full" />;
}
