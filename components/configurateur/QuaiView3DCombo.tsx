"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Maximize2, Minimize2, Camera, Tag, EyeOff } from "lucide-react";
import {
  getModuleXLength,
  type PlacedModule,
  type ModuleRef,
  type ModuleRow,
  type NbRangees,
} from "@/lib/configurateur";
import {
  buildProceduralModule,
  createConcreteMaterial,
  getConcreteColor,
  type ColorisId,
} from "@/components/preview/ModuleViewer";

interface QuaiView3DComboProps {
  modulesByRow: Record<ModuleRow, PlacedModule[]>;
  nbRangees: NbRangees;
  coloris: string;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  className?: string;
}

/** Couleur de luminance perçue (0-255) pour un hex couleur. */
function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

const ROW_DEPTH = 1.5;
const CANIVEAU_WIDTH = 0.25;
const TROT_H = 0.16;

// Rotations Y par défaut — calquées sur la convention de l'animation home / supercombo :
// - D-004a (fin gauche) : -π/2 → biseau côté -X extérieur gauche
// - D-003a (fin droite) : +π/2 → biseau côté +X extérieur droit
// - D-007a (jonction sans swapDims) : -π/2 pour mettre 1500 sur Z et 1000 sur X
// - D-007 (jonction avec swapDims natif) : pas de rotation, biseau déjà côté chaussée comme D-002
const DEFAULT_ROTATE_Y: Partial<Record<ModuleRef, number>> = {
  "D-004a": -Math.PI / 2,
  "D-003a": +Math.PI / 2,
  "D-007a": -Math.PI / 2,
};

export function QuaiView3DCombo({
  modulesByRow,
  nbRangees,
  coloris,
  showLabels = false,
  onToggleLabels,
  className,
}: QuaiView3DComboProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state (pour gérer Escape)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleScreenshot = () => {
    const r = rendererRef.current;
    if (!r) return;
    const dataUrl = r.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `quai-3d-${Date.now()}.png`;
    a.click();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // ─── Scene setup ──────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    rendererRef.current = renderer;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(3, 8, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 50;
    key.shadow.camera.left = -16;
    key.shadow.camera.right = 16;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, 5, -3);
    scene.add(fill);

    // Sol fantôme pour les ombres
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 14),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    scene.add(ground);

    const concreteMat = createConcreteMaterial(coloris as ColorisId);

    const backPlateMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8dc,
      roughness: 0.25,
      metalness: 1.0,
    });

    // ─── Quai miroir sur X (vue cohérente avec la conduite à droite) ──
    const platformGroup = new THREE.Group();
    platformGroup.scale.x = -1;
    scene.add(platformGroup);

    // ─── Build each row ───────────────────────────────
    const allHolders: THREE.Group[] = [];
    const MM = 1 / 1000;

    // Y du dessus du slab pour module 180mm en holder local
    const SLAB_TOP_LOCAL = 0.09;

    const buildModule = (placed: PlacedModule, isRow1: boolean) => {
      const rot = DEFAULT_ROTATE_Y[placed.ref] ?? 0;
      const g = buildProceduralModule(placed.ref, concreteMat, coloris as ColorisId, rot);
      // Flip Z conditionnel : rang 1 = bord arrière du quai (biseau face +Z extérieur),
      // rangs 2+ = bord chaussée (biseau face -Z extérieur). Cohérent avec QuaiAssemblyAnimation.
      if (!isRow1) g.scale.z = -1;
      if (rot !== 0) g.rotation.y = rot;
      g.updateMatrixWorld(true);

      let slab: THREE.Object3D = g.children[0];
      if (slab.type === "Group") slab = (slab as THREE.Group).children[0];
      const box = new THREE.Box3().setFromObject(slab);

      const moduleX = placed.x * MM;
      // Longueur effective le long de X (post-rotation pour les modules 1500×1000)
      const moduleLen = getModuleXLength(placed.ref) * MM;
      const xCenterInRow = moduleX + moduleLen / 2;
      const holderZ = isRow1
        ? +ROW_DEPTH / 2
        : -ROW_DEPTH / 2 - (placed.rang - 2) * ROW_DEPTH;

      const holder = new THREE.Group();
      holder.position.x = xCenterInRow;
      holder.position.y = -box.min.y;
      holder.position.z = holderZ;
      holder.add(g);

      return { holder, xCenterInRow, holderZ, moduleLen };
    };

    // Crée la plaque arrière (caniveau + 60mm trottoir) directement dans la scene,
    // en world coords (hors platformGroup) pour qu'elle ne soit PAS mirrorée par le flip X.
    // Plaque arrière : segment incliné UNIQUEMENT (enjambe le caniveau de
    // 250mm entre l'arrière du quai et la bordure trottoir). Pas de partie
    // plate sur le trottoir.
    const addBackPlate = (xCenter: number, plateWidth: number, holderZ: number, offsetX: number = 0) => {
      const slabTopY = 0.18;
      const trottoirTopY = TROT_H;
      const dropY = slabTopY - trottoirTopY;
      const plateThickness = 0.005;
      const liftY = 0.001;
      const inclineLength = Math.sqrt(
        dropY * dropY + CANIVEAU_WIDTH * CANIVEAU_WIDTH
      );
      const slopeAngle = Math.atan2(dropY, CANIVEAU_WIDTH);
      const zInner = ROW_DEPTH / 2;
      const zCurb = zInner + CANIVEAU_WIDTH;

      const incline = new THREE.Mesh(
        new THREE.BoxGeometry(plateWidth, plateThickness, inclineLength),
        backPlateMat
      );
      incline.rotation.x = slopeAngle;
      // platformGroup est miroiré (scale.x = -1) avec position.x = +L/2,
      // donc un module à xCenterInRow apparaît en world x = +L/2 - xCenterInRow.
      // Les plaques sont ajoutées hors platformGroup (pas mirrorées) donc on
      // applique la même formule manuellement.
      incline.position.set(
        offsetX - xCenter,
        (slabTopY + trottoirTopY) / 2 + liftY,
        holderZ + (zInner + zCurb) / 2
      );
      incline.castShadow = true;
      incline.receiveShadow = true;
      scene.add(incline);
    };

    // Calcul de la longueur totale du quai (max sur toutes les rangées)
    // pour centrer le tout autour de world x=0.
    let totalLengthM = 0;
    for (let row = 1 as ModuleRow; row <= nbRangees; row = (row + 1) as ModuleRow) {
      const rowLen = modulesByRow[row].reduce(
        (sum, m) => sum + (m.ref === "VIDE" ? 0 : getModuleXLength(m.ref) * MM),
        0
      );
      if (rowLen > totalLengthM) totalLengthM = rowLen;
    }
    // Centrage avec miroir : platformGroup.scale.x = -1 inverse l'axe local.
    // Pour qu'un module placé en local x ∈ [0, L] tombe en world x ∈ [-L/2, +L/2],
    // on positionne platformGroup en +L/2 ⇒ world.x = +L/2 - xLocal.
    platformGroup.position.x = totalLengthM / 2;
    const plateOffsetX = totalLengthM / 2;

    // ─── Helper labels (sprite-based, contraste auto selon le coloris) ──
    // Le label a un fond solide opposé à la luminance du béton + texte contrasté,
    // donc reste visible peu importe la couleur du bloc derrière.
    const concreteLum = hexLuminance(getConcreteColor(coloris as ColorisId));
    const labelBgIsLight = concreteLum < 128; // bloc foncé → label clair (et inverse)
    const labelBg = labelBgIsLight ? "#f5f1e6" : "#1a1612";
    const labelFg = labelBgIsLight ? "#1a1612" : "#f5f1e6";
    const labelBorder = labelBgIsLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";

    const createLabel = (text: string, x: number, y: number, z: number) => {
      const c = document.createElement("canvas");
      c.width = 192;
      c.height = 48;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = labelBg;
      ctx.beginPath();
      ctx.roundRect(0, 0, 192, 48, 8);
      ctx.fill();
      ctx.strokeStyle = labelBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(1, 1, 190, 46, 8);
      ctx.stroke();
      ctx.fillStyle = labelFg;
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 96, 24);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(x, y, z);
      sprite.scale.set(0.6, 0.15, 1);
      sprite.renderOrder = 999;
      scene.add(sprite);
    };

    // Place row 1 (modules dans platformGroup, plates en dehors)
    for (const m of modulesByRow[1]) {
      if (m.ref === "VIDE") continue;
      const { holder, xCenterInRow, holderZ, moduleLen } = buildModule(m, true);
      platformGroup.add(holder);
      allHolders.push(holder);
      const isRampe = m.ref === "D-009" || m.ref === "D-009s";
      if (!isRampe) {
        addBackPlate(xCenterInRow, moduleLen, holderZ, plateOffsetX);
      }
      if (showLabels) {
        // platformGroup est miroiré sur X → world.x = +L/2 - xCenterInRow
        const worldX = plateOffsetX - xCenterInRow;
        createLabel(m.ref, worldX, 0.45, holderZ);
      }
    }
    // Other rows
    for (let row = 2 as ModuleRow; row <= nbRangees; row = (row + 1) as ModuleRow) {
      for (const m of modulesByRow[row]) {
        if (m.ref === "VIDE") continue;
        const { holder, xCenterInRow, holderZ } = buildModule(m, false);
        platformGroup.add(holder);
        allHolders.push(holder);
        if (showLabels) {
          const worldX = plateOffsetX - xCenterInRow;
          createLabel(m.ref, worldX, 0.45, holderZ);
        }
      }
    }

    // ─── Camera fit ───────────────────────────────────
    // Calcul direct : modules centrés en X=0 grâce au mirror+offset de platformGroup,
    // Z central = milieu des rangées (rang 1 à +ROW_DEPTH/2, descend de ROW_DEPTH par rang).
    const centerZ = ROW_DEPTH / 2 * (2 - nbRangees);
    const sceneCenter = new THREE.Vector3(0, 0.3, centerZ);
    const sceneSize = new THREE.Vector3(
      Math.max(totalLengthM, 4),
      1.5,
      ROW_DEPTH * nbRangees + CANIVEAU_WIDTH * 2 // marge pour les plaques arrière
    );
    // Cadrage plus serré sur les modules → plus immersif
    const fitRadius = Math.max(sceneSize.x, sceneSize.z * 2.2) * 0.42;
    const fovRad = camera.fov * (Math.PI / 180);
    const dist = (fitRadius / Math.tan(fovRad / 2)) * 0.85;
    // Camera côté chaussée (-Z) pour voir le chanfrein, mais on mirroir
    // le quai sur X (platformGroup) pour que le 1er module ajouté (x=0)
    // apparaisse à GAUCHE et le dernier à droite, dans le sens de lecture.
    const dir = new THREE.Vector3(0.5, 0.6, -1).normalize();
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
  }, [modulesByRow, nbRangees, coloris, showLabels]);

  return (
    <div
      ref={wrapperRef}
      className={
        className ??
        "relative w-full h-[450px] bg-gradient-to-b from-sky-50 to-gray-100 rounded-lg overflow-hidden"
      }
    >
      <div ref={containerRef} className="absolute inset-0" />
      {/* Logo overlay top-left — visible aussi en plein écran */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-urbaquai.png"
          alt="URBAQUAI"
          className="h-7 lg:h-8 w-auto drop-shadow-sm"
        />
      </div>
      {/* Toolbar overlay top-right — visible aussi en plein écran */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {onToggleLabels && (
          <button
            type="button"
            onClick={onToggleLabels}
            title={showLabels ? "Masquer les labels" : "Afficher les labels"}
            className={`p-2 rounded-md border shadow-sm transition-colors ${
              showLabels
                ? "bg-primary text-white border-primary"
                : "bg-white/90 hover:bg-white border-gray-300 text-gray-700"
            }`}
          >
            {showLabels ? <Tag className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={handleScreenshot}
          title="Télécharger une image PNG"
          className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow-sm text-gray-700 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran"}
          className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow-sm text-gray-700 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
