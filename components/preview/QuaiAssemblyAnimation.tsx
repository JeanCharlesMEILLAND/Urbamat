"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { type ModuleRef } from "@/lib/configurateur";
import { buildProceduralModule, createConcreteMaterial, type ColorisId } from "./ModuleViewer";

interface QuaiAssemblyAnimationProps {
  coloris?: ColorisId;
  loop?: boolean;
  className?: string;
}

const ROW_DEPTH = 1.5;

type ModulePlacement = {
  ref: ModuleRef;
  mirror?: boolean;
  rotateY?: number;
  flipZ?: boolean;
};

// Row 1 (trottoir)
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

// Row 2 (chaussée) — démarre à index 1 de ROW1 (D-004a)
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

export function QuaiAssemblyAnimation({
  coloris = "granit-gris",
  loop = false,
  className,
}: QuaiAssemblyAnimationProps) {
  type CamPhase = "assembly" | "arrival" | "hold" | "departure";
  const containerRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<() => void>(() => {});
  const screenshotRef = useRef<() => void>(() => {});
  const recordRef = useRef<() => void>(() => {});
  const editToggleRef = useRef<(mode: "translate" | "rotate" | null) => void>(() => {});
  const saveCamRef = useRef<(phase: CamPhase) => void>(() => {});
  const resetCamRef = useRef<() => void>(() => {});
  const togglePauseRef = useRef<() => void>(() => {});
  const seekRef = useRef<(t01: number) => void>(() => {});
  // Presets caméra : source de vérité = BDD (table CamPreset) pour que tous les
  // visiteurs voient la même séquence cinématique. localStorage sert juste de
  // cache rapide pour éviter un flash au remount.
  type CamKeyframeData = {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
  const STORAGE_KEY = "urbaquai_concept_cam_presets_v1"; // cache local
  const loadFromCache = (): Record<CamPhase, CamKeyframeData | null> => {
    if (typeof window === "undefined") {
      return { assembly: null, arrival: null, hold: null, departure: null };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { assembly: null, arrival: null, hold: null, departure: null };
      const parsed = JSON.parse(raw) as Record<CamPhase, CamKeyframeData | null>;
      return {
        assembly: parsed.assembly ?? null,
        arrival: parsed.arrival ?? null,
        hold: parsed.hold ?? null,
        departure: parsed.departure ?? null,
      };
    } catch {
      return { assembly: null, arrival: null, hold: null, departure: null };
    }
  };
  // Démarre avec le cache local pour éviter un flash sans caméra animée. Sera
  // remplacé par les données serveur dès qu'elles arrivent.
  const camPresetsRef = useRef<Record<CamPhase, CamKeyframeData | null>>(loadFromCache());
  const [presetsLoaded, setPresetsLoaded] = useState(false);

  // Charge les presets depuis le serveur au mount. Auto-migre le localStorage
  // vers la BDD si la BDD est vide et le cache local contient des données
  // (cas du dev qui avait déjà sauvegardé sa séquence avant la migration BDD).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/cam-presets", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(async (data: Record<CamPhase, CamKeyframeData | null> | null) => {
        if (cancelled || !data) {
          setPresetsLoaded(true);
          return;
        }
        const cache = camPresetsRef.current;
        const dbHasAnything = Object.values(data).some((v) => v !== null);
        const cacheHasAnything = Object.values(cache).some((v) => v !== null);

        if (dbHasAnything) {
          // BDD prioritaire : tous les visiteurs voient la même séquence.
          camPresetsRef.current = data;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        } else if (cacheHasAnything) {
          // BDD vide + cache rempli → on tente la migration. Si l'admin n'est
          // pas connecté, le PUT renverra 401 et on garde juste le cache local.
          try {
            const res = await fetch("/api/cam-presets", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ batch: cache }),
            });
            if (res.ok) {
              console.log("[cam-presets] migrated localStorage → BDD");
            }
          } catch {
            /* offline ou pas admin — pas grave, on garde le cache */
          }
        }
        setPresetsLoaded(true);
      })
      .catch(() => setPresetsLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seekT01, setSeekT01] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [editMode, setEditMode] = useState<"translate" | "rotate" | null>(null);
  const [busPos, setBusPos] = useState<{ x: number; z: number; ry: number } | null>(null);
  const [savedPhases, setSavedPhases] = useState<Record<CamPhase, boolean>>({
    assembly: false,
    arrival: false,
    hold: false,
    departure: false,
  });
  const [phaseMarkers, setPhaseMarkers] = useState({ s2: 0.36, s3: 0.51, s4: 0.82, s5: 0.97 });
  // Phase courante (calculée depuis seekT01 + phaseMarkers) — utile pour le hint marketing
  const isInHoldPhase = seekT01 >= phaseMarkers.s3 && seekT01 < phaseMarkers.s4;

  useEffect(() => {
    // Attend que les presets caméra soient chargés depuis la BDD avant
    // d'initialiser la scène Three.js, sinon la séquence cinématique
    // démarrerait avec des valeurs vides puis sauterait au moment du fetch.
    if (!presetsLoaded) return;

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
    key.position.set(3, 10, -2); // overhead + côté caméra (chaussée -Z)
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 50;
    key.shadow.camera.left = -16;
    key.shadow.camera.right = 16;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, 5, 5);
    scene.add(fill);

    // ─── Décor (aligné sur le configurateur QuaiView3D) ─────
    // Convention configurateur :
    //   QUAI_BACK  = -ROW_DEPTH (arrière du quai, côté trottoir)
    //   CANIVEAU   = 250mm entre l'arrière du quai et la bordure trottoir
    //   CURB_Z     = QUAI_BACK - CANIVEAU
    //   TROT_H     = 140mm (trottoir surélevé)
    //   ROUTE      = depuis CURB_Z + 80mm (base bordure côté route),
    //                passe sous le quai, et continue env.voie au-delà
    const DIORAMA_LEN = 26;
    const TROT_H = 0.16;             // trottoir 160mm (standard FR)
    const CANIVEAU_WIDTH = 0.25;     // 250mm caniveau
    const TROT_WIDTH = 4.0;          // largeur du trottoir
    const VOIE = 5.5;                // largeur de la voie de circulation après quai

    const QUAI_BACK = ROW_DEPTH;                    // arrière du quai (côté trottoir, +Z)
    const QUAI_FRONT = -ROW_DEPTH;                  // avant du quai (côté chaussée, -Z)
    const CURB_Z = QUAI_BACK + CANIVEAU_WIDTH;      // bordure trottoir, 250mm derrière le quai
    const ROUTE_START_Z = CURB_Z + 0.08;            // route part du pied de la bordure
    const ROUTE_END_Z = QUAI_FRONT - VOIE;          // -Z, route continue après le quai
    const ROUTE_TOTAL = ROUTE_START_Z - ROUTE_END_Z;
    const ROUTE_CENTER_Z = (ROUTE_START_Z + ROUTE_END_Z) / 2;

    // Chaussée — Box (avec épaisseur d'asphalte) qui passe SOUS le quai
    // et continue jusqu'au pied de la bordure trottoir
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.95,
      metalness: 0.0,
    });
    const ROAD_THICKNESS = 0.05;
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(DIORAMA_LEN, ROAD_THICKNESS, ROUTE_TOTAL),
      roadMat
    );
    road.position.set(0, -0.005 - ROAD_THICKNESS / 2, ROUTE_CENTER_Z);
    road.receiveShadow = true;
    scene.add(road);

    // Marquage central pointillé (au milieu de la voie côté chaussée, devant le quai)
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    const dashCenterZ = QUAI_FRONT - VOIE / 2;
    const totalDashes = Math.floor((DIORAMA_LEN - 2) / 2);
    for (let i = 0; i < totalDashes; i++) {
      const d = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 0.10),
        lineMat
      );
      d.rotation.x = -Math.PI / 2;
      d.position.set(i * 2 - (totalDashes - 1), 0.002, dashCenterZ);
      scene.add(d);
    }

    // Trottoir 140mm (derrière le caniveau)
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0xcbc7bb,
      roughness: 0.85,
      metalness: 0.0,
    });
    const trot = new THREE.Mesh(
      new THREE.BoxGeometry(DIORAMA_LEN, TROT_H, TROT_WIDTH),
      sidewalkMat
    );
    trot.position.set(0, TROT_H / 2, CURB_Z + TROT_WIDTH / 2);
    trot.receiveShadow = true;
    scene.add(trot);

    // Bordure (face avant du trottoir, côté quai) — même hauteur que le trottoir
    const bordureMat = new THREE.MeshStandardMaterial({
      color: 0xa0a0a0,
      roughness: 0.7,
    });
    const bordure = new THREE.Mesh(
      new THREE.BoxGeometry(DIORAMA_LEN, TROT_H, 0.08),
      bordureMat
    );
    bordure.position.set(0, TROT_H / 2, CURB_Z - 0.04);
    scene.add(bordure);

    // Base terre (socle diorama, descend franchement sous la route pour éviter
    // tout z-fighting avec le plane chaussée quand on zoome)
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x6b4226,
      roughness: 0.95,
    });
    const earthZmin = ROUTE_END_Z;
    const earthZmax = CURB_Z + TROT_WIDTH;
    const earthDepth = earthZmax - earthZmin;
    const earthHeight = 0.45;
    const earthTopY = -0.06; // 55mm sous la route → pas de z-fighting
    const earth = new THREE.Mesh(
      new THREE.BoxGeometry(DIORAMA_LEN, earthHeight, earthDepth),
      earthMat
    );
    earth.position.set(0, earthTopY - earthHeight / 2, (earthZmin + earthZmax) / 2);
    scene.add(earth);

    // Arbres stylisés (feuillage icosaèdre + tronc cylindrique)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7a4f2a, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x5fa83b,
      roughness: 0.7,
      flatShading: true,
    });
    const makeTree = (x: number, z: number, scale = 1) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, 1.4 * scale, 12),
        trunkMat
      );
      trunk.position.y = 0.7 * scale;
      trunk.castShadow = true;
      tree.add(trunk);
      const foliage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.85 * scale, 1),
        foliageMat
      );
      foliage.position.y = 1.95 * scale;
      foliage.castShadow = true;
      tree.add(foliage);
      tree.position.set(x, TROT_H, z);
      scene.add(tree);
    };

    // 2 arbres seulement (devant les immeubles, près de la bordure)
    const treeZ = CURB_Z + 1.0;
    makeTree(-3.0, treeZ, 0.95);
    makeTree(4.5, treeZ, 1.0);

    // ─── Immeubles / commerces de fond urbain ──────────────
    // Face avant orientée vers -Z (vers la caméra qui regarde depuis la chaussée).
    const buildingFrontZ = CURB_Z + TROT_WIDTH - 2.0;
    type BldgKind = "shop-yellow" | "shop-red" | "apartment";
    const makeBuilding = (
      x: number,
      width: number,
      height: number,
      kind: BldgKind
    ) => {
      const depth = 2.0;
      const bldg = new THREE.Group();
      const bodyColor =
        kind === "apartment" ? 0xece2d0 : kind === "shop-yellow" ? 0xf3e5c8 : 0xe9cdb6;
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.85 });
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        bodyMat
      );
      body.position.y = height / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      bldg.add(body);

      // Corniche supérieure (bandeau qui dépasse légèrement = casse le côté cubique)
      const corniche = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.2, 0.18, depth + 0.2),
        new THREE.MeshStandardMaterial({ color: 0xc4b9a3, roughness: 0.85 })
      );
      corniche.position.y = height + 0.09;
      corniche.castShadow = true;
      bldg.add(corniche);

      // Toit en pente (prisme triangulaire)
      const roofH = kind === "apartment" ? 1.4 : 0.9;
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-(width + 0.3) / 2, 0);
      roofShape.lineTo((width + 0.3) / 2, 0);
      roofShape.lineTo(0, roofH);
      roofShape.closePath();
      const roofGeom = new THREE.ExtrudeGeometry(roofShape, {
        depth: depth + 0.3,
        bevelEnabled: false,
      });
      roofGeom.translate(0, 0, -(depth + 0.3) / 2);
      const roof = new THREE.Mesh(
        roofGeom,
        new THREE.MeshStandardMaterial({
          color: kind === "apartment" ? 0x6b5b4a : 0x8a6a52,
          roughness: 0.85,
          flatShading: true,
        })
      );
      roof.position.y = height + 0.18;
      roof.castShadow = true;
      bldg.add(roof);

      // Cheminée pour l'immeuble
      if (kind === "apartment") {
        const chimney = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.9, 0.35),
          new THREE.MeshStandardMaterial({ color: 0xb09080, roughness: 0.9 })
        );
        chimney.position.set(width * 0.3, height + 0.18 + roofH * 0.6, 0);
        chimney.castShadow = true;
        bldg.add(chimney);
      }

      const frontZ = -depth / 2 - 0.01;
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x4a6a8a,
        roughness: 0.3,
        metalness: 0.4,
      });
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        roughness: 0.6,
      });

      // Helper : fenêtre avec encadrement blanc + appui
      const makeWindow = (cx: number, cy: number, w: number, h: number) => {
        // Cadre blanc (légèrement plus grand)
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.04),
          frameMat
        );
        frame.position.set(cx, cy, frontZ);
        bldg.add(frame);
        // Vitre
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, 0.045),
          winMat
        );
        win.position.set(cx, cy, frontZ - 0.005);
        bldg.add(win);
        // Appui de fenêtre
        const sill = new THREE.Mesh(
          new THREE.BoxGeometry(w + 0.16, 0.05, 0.12),
          frameMat
        );
        sill.position.set(cx, cy - h / 2 - 0.02, frontZ - 0.04);
        bldg.add(sill);
      };

      if (kind === "apartment") {
        // Immeuble : grille de fenêtres + balcons en saillie sur l'étage du milieu
        const cols = 3;
        const rows = Math.max(2, Math.floor((height - 1) / 1.5));
        const winW = 0.75;
        const winH = 1.0;
        const colSpacing = width / (cols + 0.5);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = (c - (cols - 1) / 2) * colSpacing;
            const cy = 0.95 + r * 1.5;
            makeWindow(cx, cy, winW, winH);
          }
        }
        // Balcon central étage 2 (saillie horizontale)
        if (rows >= 2) {
          const balconyY = 0.95 + 1.5 - winH / 2 - 0.15;
          const balcony = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.7, 0.08, 0.4),
            new THREE.MeshStandardMaterial({ color: 0xb5a895, roughness: 0.85 })
          );
          balcony.position.set(0, balconyY, frontZ - 0.2);
          balcony.castShadow = true;
          bldg.add(balcony);
          // Garde-corps
          const railing = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.7, 0.5, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 })
          );
          railing.position.set(0, balconyY + 0.25, frontZ - 0.4);
          bldg.add(railing);
        }
        // Porte d'entrée
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 2.0, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.7 })
        );
        door.position.set(0, 1.0, frontZ);
        bldg.add(door);
      } else {
        // Commerce : auvent en pente + vitrine + porte + 1 étage avec fenêtres
        const awningColor = kind === "shop-yellow" ? 0xe6b840 : 0xb73a30;
        // Auvent incliné (utilise un Shape extrudé)
        const awningShape = new THREE.Shape();
        awningShape.moveTo(0, 0);
        awningShape.lineTo(0.5, -0.15);
        awningShape.lineTo(0.5, -0.25);
        awningShape.lineTo(0, -0.05);
        awningShape.closePath();
        const awningGeom = new THREE.ExtrudeGeometry(awningShape, {
          depth: width * 0.92,
          bevelEnabled: false,
        });
        awningGeom.translate(0, 0, -(width * 0.92) / 2);
        awningGeom.rotateY(Math.PI / 2);
        const awning = new THREE.Mesh(
          awningGeom,
          new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.7, flatShading: true })
        );
        awning.position.set(0, 2.5, frontZ);
        awning.castShadow = true;
        bldg.add(awning);

        // Bandeau enseigne
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.92, 0.4, 0.06),
          new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.6 })
        );
        sign.position.set(0, 2.2, frontZ);
        bldg.add(sign);

        // Vitrine + porte (rez-de-chaussée)
        const vitrine = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.55, 1.5, 0.04),
          winMat
        );
        vitrine.position.set(-width * 0.18, 1.0, frontZ);
        bldg.add(vitrine);
        // Cadre vitrine
        const vitrineFrame = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.55 + 0.1, 1.5 + 0.1, 0.035),
          frameMat
        );
        vitrineFrame.position.set(-width * 0.18, 1.0, frontZ + 0.005);
        bldg.add(vitrineFrame);

        const door = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 1.95, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 })
        );
        door.position.set(width * 0.32, 0.975, frontZ);
        bldg.add(door);

        // Étage du dessus
        if (height > 3.5) {
          for (const dx of [-width * 0.28, 0, width * 0.28]) {
            makeWindow(dx, 3.4, 0.65, 0.85);
          }
        }
      }

      bldg.position.set(x, TROT_H, buildingFrontZ + depth / 2);
      scene.add(bldg);
    };

    // 3 façades : boulangerie, immeuble central, boucherie
    makeBuilding(-7.5, 4.2, 4.6, "shop-yellow");   // boulangerie
    makeBuilding(-1.5, 4.8, 8.0, "apartment");      // immeuble
    makeBuilding(7.0, 4.2, 4.6, "shop-red");        // boucherie

    // ─── Bus low-poly (extrait d'un pack Sketchfab) ───────────
    // Pivot wrapper : porte la position monde du bus. Hide jusqu'à l'arrivée.
    const busPivot = new THREE.Group();
    busPivot.visible = false;
    // Position Z fixe sur la chaussée, à 50mm du chanfrein de row 2
    // Row 2 -Z edge (chamfered side after flipZ) at world z = -ROW_DEPTH = -1.5
    // Bus body half-width ~1.25m → bus center at z = -1.5 - 1.25 - 0.05 = -2.8
    busPivot.position.z = -2.8;
    scene.add(busPivot);

    let busLoaded = false;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/models/bus/citi_bus.glb",
      (gltf) => {
        const bus = gltf.scene;

        // 1. bbox originale + détection de l'axe de longueur (X ou Z)
        const origBox = new THREE.Box3().setFromObject(bus);
        const origSize = new THREE.Vector3();
        origBox.getSize(origSize);
        const xIsLength = origSize.x > origSize.z;
        const lengthDim = xIsLength ? origSize.x : origSize.z;

        // 2. Échelle vers 12m de long
        const scale = 12 / lengthDim;
        bus.scale.setScalar(scale);

        // 3. Recentre X et Z sur l'origine du bus, lift Y pour poser au sol
        const scaledBox = new THREE.Box3().setFromObject(bus);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);
        bus.position.x -= scaledCenter.x;
        bus.position.z -= scaledCenter.z;
        bus.position.y -= scaledBox.min.y;

        // 4. Si la longueur est sur Z, on rotate Y de 90° pour aligner sur l'axe route (X)
        if (!xIsLength) {
          bus.rotation.y = Math.PI / 2;
        }

        bus.traverse((obj) => {
          const m = obj as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });

        busPivot.add(bus);
        busLoaded = true;
      },
      undefined,
      (err) => {
        console.error("[QuaiAssemblyAnimation] Erreur chargement bus:", err);
      }
    );

    const concreteMat = createConcreteMaterial(coloris);

    // Quai miroir global (orientation route France)
    const platformGroup = new THREE.Group();
    platformGroup.scale.x = -1;
    scene.add(platformGroup);

    const buildPlacement = (p: ModulePlacement) => {
      const g = buildProceduralModule(p.ref, concreteMat, coloris, p.rotateY ?? 0);
      if (p.mirror) g.scale.x = -1;
      if (p.flipZ) g.scale.z = -1;
      if (p.rotateY) g.rotation.y = p.rotateY;
      g.updateMatrixWorld(true);
      // Bbox du slab uniquement — exclut plaque métal, inserts, patins d'ancrage,
      // edges qui dépassent et fausseraient le placement.
      // D-004/D-008a sont enveloppés dans un Group(mirrorOnX/Z) → on déballe.
      let slab: THREE.Object3D = g.children[0];
      if (slab.type === "Group") slab = (slab as THREE.Group).children[0];
      const box = new THREE.Box3().setFromObject(slab);
      let minX = box.min.x;
      let maxX = box.max.x;
      // Pour les rampes : le coin top-haut dépasse de chamferW au-delà du bord bas
      // (biseau inversé). On utilise le bord bas comme "vraie" extrémité pour que
      // le module suivant vienne se coller au pied du biseau, et le top du biseau
      // recouvre proprement la face verticale du voisin.
      if (p.ref === "D-009" || p.ref === "D-009s") {
        const chamferW = 0.025;
        const isInverted = p.ref === "D-009s";
        const highOnPlusX = isInverted ? !p.mirror : !!p.mirror;
        if (highOnPlusX) maxX -= chamferW;
        else minX += chamferW;
      }
      return { group: g, minX, maxX, minY: box.min.y };
    };

    type AnimModule = { holder: THREE.Group; targetY: number; delay: number };
    const animModules: AnimModule[] = [];

    const moduleDuration = 600;
    const moduleStagger = 280;
    const dropFromY = 5;

    const backPlateMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8dc,
      roughness: 0.25,
      metalness: 1.0,
    });

    const placeAt = (
      built: ReturnType<typeof buildPlacement>,
      startX: number,
      zCenter: number,
      orderIndex: number,
      ref?: ModuleRef
    ) => {
      const targetY = -built.minY;
      const holder = new THREE.Group();
      holder.position.x = startX - built.minX;
      holder.position.z = zCenter;
      holder.position.y = dropFromY;
      holder.add(built.group);

      // Plaque métal arrière : enjambe le caniveau (250mm) ET repose sur le
      // trottoir (260mm de plus, total 510mm comme la plaque rampe). Deux segments :
      //   1. Inclinée sur le caniveau, du dessus quai (180mm) au trottoir (140mm)
      //   2. Plat posé sur le dessus du trottoir
      const isRampe = ref === "D-009" || ref === "D-009s";
      if (zCenter > 0 && !isRampe) {
        // Plaque visible : caniveau incliné + 60mm sur trottoir (pas d'overlap module)
        const plateWidth = built.maxX - built.minX;
        const plateXCenter = (built.minX + built.maxX) / 2;
        const dropY = 0.18 - TROT_H;
        const runZ = CANIVEAU_WIDTH;
        const onTrottoirRun = 0.06;
        const plateThickness = 0.005;
        const liftY = 0.001;
        const inclineLength = Math.sqrt(dropY * dropY + runZ * runZ);
        const slopeAngle = Math.atan2(dropY, runZ);
        const yInner = 0.09;
        const yOuter = yInner - dropY;
        const zInner = ROW_DEPTH / 2;
        const zCurb = zInner + runZ;
        const zEnd = zCurb + onTrottoirRun;

        const incline = new THREE.Mesh(
          new THREE.BoxGeometry(plateWidth, plateThickness, inclineLength),
          backPlateMat
        );
        incline.rotation.x = slopeAngle;
        incline.position.set(plateXCenter, (yInner + yOuter) / 2 + liftY, (zInner + zCurb) / 2);
        incline.castShadow = true;
        incline.receiveShadow = true;
        holder.add(incline);

        const flat = new THREE.Mesh(
          new THREE.BoxGeometry(plateWidth, plateThickness, onTrottoirRun),
          backPlateMat
        );
        flat.position.set(plateXCenter, yOuter + plateThickness / 2 + liftY, (zCurb + zEnd) / 2);
        flat.castShadow = true;
        flat.receiveShadow = true;
        holder.add(flat);
      }

      platformGroup.add(holder);
      animModules.push({
        holder,
        targetY,
        delay: orderIndex * moduleStagger,
      });
    };

    // Pré-build pour bbox réelles
    const row1Built = ROW1.map(buildPlacement);
    const row2Built = ROW2.map(buildPlacement);

    // Positions X de row 1
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

    // Ordre d'apparition : un module à la fois, gauche→droite, row1 puis row2 par colonne
    let order = 0;
    for (let i = 0; i < ROW2_START_INDEX; i++) {
      placeAt(row1Built[i], row1Starts[i], +ROW_DEPTH / 2, order++, ROW1[i].ref);
    }
    for (let i = 0; i < ROW2.length; i++) {
      const r1Index = ROW2_START_INDEX + i;
      placeAt(row1Built[r1Index], row1Starts[r1Index], +ROW_DEPTH / 2, order++, ROW1[r1Index].ref);
      placeAt(row2Built[i], row1Starts[r1Index], -ROW_DEPTH / 2, order++, ROW2[i].ref);
    }

    // ─── Camera fit (diorama : route + quai + trottoir + arbres + immeubles) ──
    const dioramaZmin = ROUTE_END_Z;
    const dioramaZmax = CURB_Z + TROT_WIDTH;
    const SCENE_HEIGHT = 9; // pour inclure le plus haut immeuble (~8.5m)
    const sceneCenter = new THREE.Vector3(
      0,
      SCENE_HEIGHT / 2.2,
      (dioramaZmin + dioramaZmax) / 2
    );
    const sceneSize = new THREE.Vector3(
      DIORAMA_LEN,
      SCENE_HEIGHT,
      dioramaZmax - dioramaZmin
    );

    const fitRadius = Math.max(sceneSize.x, sceneSize.y * 1.5, sceneSize.z * 1.6) * 0.55;
    const fovRad = camera.fov * (Math.PI / 180);
    const dist = (fitRadius / Math.tan(fovRad / 2)) * 1.15;
    // Vue depuis la chaussée vers le quai+trottoir+immeubles (fond urbain).
    const dir = new THREE.Vector3(0.4, 0.65, -1).normalize();
    camera.position.copy(sceneCenter).add(dir.multiplyScalar(dist));
    camera.lookAt(sceneCenter);
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.copy(sceneCenter);
    controls.update();

    // ─── TransformControls : drag-and-drop le bus ─────────────
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setSize(0.8);
    transformControls.showY = false; // bus reste au sol
    // Pendant le drag du gizmo, désactive OrbitControls
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });
    transformControls.addEventListener("change", () => {
      if (transformControls.object) {
        const p = transformControls.object.position;
        const r = transformControls.object.rotation;
        setBusPos({ x: p.x, z: p.z, ry: r.y });
      }
    });
    const tcHelper = transformControls.getHelper();
    tcHelper.visible = false;
    transformControls.enabled = false;
    scene.add(tcHelper);

    let busEdited = false; // une fois édité, garder le bus visible à busTargetX
    editToggleRef.current = (mode) => {
      if (mode === null) {
        // Sortie d'édition : sauvegarde la position courante comme nouvelle cible
        busTargetX = busPivot.position.x;
        busTargetZ = busPivot.position.z;
        busTargetRY = busPivot.rotation.y;
        busOffscreenX = busTargetX - 25;
        busEdited = true;
        tcHelper.visible = false;
        transformControls.enabled = false;
        transformControls.detach();
        console.log("[bus saved]", { x: busTargetX, z: busTargetZ, ry: busTargetRY });
      } else {
        if (busLoaded && busPivot.parent) {
          busPivot.visible = true;
          // Place à la cible courante (initiale ou la dernière sauvegardée)
          busPivot.position.x = busTargetX;
          busPivot.position.z = busTargetZ;
          busPivot.rotation.y = busTargetRY;
          transformControls.attach(busPivot);
          transformControls.setMode(mode);
          tcHelper.visible = true;
          transformControls.enabled = true;
          setBusPos({ x: busPivot.position.x, z: busPivot.position.z, ry: busPivot.rotation.y });
        }
      }
    };

    // Chute pesante (béton) : accélération naturelle, pas de rebond
    const easeInQuad = (t: number) => t * t;

    const totalAssemblyMs = animModules.length * moduleStagger + moduleDuration;
    const busArriveStart = totalAssemblyMs + 200;
    const busArriveEnd = busArriveStart + 2200;     // arrivée sur 2.2s
    const busHoldEnd = busArriveEnd + 4500;          // arrêt 4.5s
    const busDepartEnd = busHoldEnd + 2200;          // départ sur 2.2s
    const cycleMs = busDepartEnd + 500;

    // Cible bus : valeurs validées en drag-and-drop.
    let busTargetX = -4.55;
    let busTargetZ = -7.13;
    let busTargetRY = 0;
    let busOffscreenX = busTargetX - 25;       // entrée par la droite (-X)
    let busDepartureX = busTargetX + 25;        // sortie par la gauche (+X)

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInCubic = (t: number) => t * t * t;

    // ─── Caméra cinématique : 4 keyframes (un par phase) ─────────
    // Storage : objet ref persisté à travers les re-renders et StrictMode double-mount
    const camPresets = camPresetsRef.current;

    // Helpers pour reconvertir Vec3 plain → THREE.Vector3 et inversement
    const toVec3 = (v: { x: number; y: number; z: number }) =>
      new THREE.Vector3(v.x, v.y, v.z);
    const fromVec3 = (v: THREE.Vector3) => ({ x: v.x, y: v.y, z: v.z });

    // Initialise savedPhases en réflechissant l'état réel du ref (utile au remount)
    setSavedPhases({
      assembly: camPresets.assembly !== null,
      arrival: camPresets.arrival !== null,
      hold: camPresets.hold !== null,
      departure: camPresets.departure !== null,
    });

    const persistCamPresets = () => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(camPresets));
        }
      } catch {}
    };

    saveCamRef.current = (phase) => {
      const keyframe = {
        position: fromVec3(camera.position),
        target: fromVec3(controls.target),
      };
      camPresets[phase] = keyframe;
      persistCamPresets();
      setSavedPhases((prev) => ({ ...prev, [phase]: true }));
      // Push aussi en BDD pour que tous les visiteurs aient la même séquence.
      // Si l'admin n'est pas connecté, le PUT sera 401 et seul le cache local
      // sera mis à jour — c'est OK pour les sessions de tuning.
      fetch("/api/cam-presets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase, keyframe }),
      })
        .then((r) => {
          if (r.ok) {
            console.log("[camera saved → DB]", phase);
          } else if (r.status === 401) {
            console.warn("[camera saved → local only — connecte-toi à /admin pour pousser en BDD]");
          }
        })
        .catch(() => {
          /* offline — cache local seulement */
        });
      console.log("[camera saved]", phase, keyframe);
    };
    resetCamRef.current = () => {
      camPresets.assembly = null;
      camPresets.arrival = null;
      camPresets.hold = null;
      camPresets.departure = null;
      persistCamPresets();
      setSavedPhases({ assembly: false, arrival: false, hold: false, departure: false });
      // Vide aussi la BDD (admin requis)
      fetch("/api/cam-presets", { method: "DELETE" }).catch(() => {});
    };

    // Lerp utilitaires
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpVec = (a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3) => {
      out.set(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
      return out;
    };
    const tmpPos = new THREE.Vector3();
    const tmpTgt = new THREE.Vector3();

    // Détermine la cible caméra à un instant cycleT donné, en interpolant
    // entre keyframes. Retourne null si aucun preset n'est défini.
    const tmpAPos = new THREE.Vector3();
    const tmpATgt = new THREE.Vector3();
    const tmpBPos = new THREE.Vector3();
    const tmpBTgt = new THREE.Vector3();
    const getCameraAt = (
      cycleT: number
    ): { position: THREE.Vector3; target: THREE.Vector3 } | null => {
      const a = camPresets.assembly;
      const b = camPresets.arrival;
      const c = camPresets.hold;
      const d = camPresets.departure;
      if (!a && !b && !c && !d) return null;
      const fallback = a || b || c || d!;
      const kfA = a || fallback;
      const kfB = b || fallback;
      const kfC = c || fallback;
      const kfD = d || fallback;
      if (cycleT <= 0) return { position: toVec3(kfA.position), target: toVec3(kfA.target) };
      if (cycleT < busArriveStart) {
        const t = cycleT / busArriveStart;
        return {
          position: lerpVec(toVec3(kfA.position), toVec3(kfB.position), t, tmpPos),
          target: lerpVec(toVec3(kfA.target), toVec3(kfB.target), t, tmpTgt),
        };
      }
      if (cycleT < busArriveEnd) {
        const t = (cycleT - busArriveStart) / (busArriveEnd - busArriveStart);
        return {
          position: lerpVec(toVec3(kfB.position), toVec3(kfC.position), t, tmpPos),
          target: lerpVec(toVec3(kfB.target), toVec3(kfC.target), t, tmpTgt),
        };
      }
      if (cycleT < busHoldEnd) {
        tmpAPos.copy(toVec3(kfC.position));
        tmpATgt.copy(toVec3(kfC.target));
        return { position: tmpAPos, target: tmpATgt };
      }
      if (cycleT < busDepartEnd) {
        const t = (cycleT - busHoldEnd) / (busDepartEnd - busHoldEnd);
        return {
          position: lerpVec(toVec3(kfC.position), toVec3(kfD.position), t, tmpPos),
          target: lerpVec(toVec3(kfC.target), toVec3(kfD.target), t, tmpTgt),
        };
      }
      tmpBPos.copy(toVec3(kfD.position));
      tmpBTgt.copy(toVec3(kfD.target));
      return { position: tmpBPos, target: tmpBTgt };
    };

    // ─── État initial : "fin du cycle" (modules placés, bus parti) ──
    // → l'utilisateur arrive sur la page, voit le quai fini avec la caméra
    //   à l'angle "départ" (preset 4). Click Play → relance depuis le début.
    platformGroup.visible = true;
    animModules.forEach((m) => {
      m.holder.position.y = m.targetY;
    });
    busPivot.visible = false;
    busPivot.position.x = busDepartureX;
    // Applique le preset caméra "départ" si sauvegardé (sinon vue par défaut)
    const initDep = camPresets.departure;
    if (initDep) {
      camera.position.set(initDep.position.x, initDep.position.y, initDep.position.z);
      controls.target.set(initDep.target.x, initDep.target.y, initDep.target.z);
    }
    controls.update();

    let raf = 0;
    let startTime: number | null = null;
    let isPausedLocal = false;
    let manualCycleT: number | null = null;

    // Met à jour les marqueurs de phase du slider (calculés depuis les timings)
    setPhaseMarkers({
      s2: busArriveStart / cycleMs,
      s3: busArriveEnd / cycleMs,
      s4: busHoldEnd / cycleMs,
      s5: busDepartEnd / cycleMs,
    });

    playRef.current = () => {
      platformGroup.visible = true;
      startTime = performance.now();
      isPausedLocal = false;
      manualCycleT = null;
      setIsPaused(false);
      setHasStarted(true);
    };

    togglePauseRef.current = () => {
      if (isPausedLocal) {
        // Reprise : décale startTime pour continuer depuis manualCycleT
        if (manualCycleT !== null && startTime !== null) {
          startTime = performance.now() - manualCycleT;
        }
        manualCycleT = null;
        isPausedLocal = false;
        setIsPaused(false);
      } else {
        // Pause : capture cycleT courant
        const cur =
          startTime !== null ? performance.now() - startTime : 0;
        manualCycleT = Math.max(0, Math.min(cur, cycleMs));
        isPausedLocal = true;
        setIsPaused(true);
      }
    };

    seekRef.current = (t01) => {
      const newCycleT = t01 * cycleMs;
      if (startTime === null) {
        platformGroup.visible = true;
        startTime = performance.now() - newCycleT;
        setHasStarted(true);
      }
      manualCycleT = newCycleT;
      isPausedLocal = true;
      setIsPaused(true);
      // Téléporte la caméra au preset interpolé pour ce cycleT (s'il existe)
      const camTarget = getCameraAt(newCycleT);
      if (camTarget) {
        camera.position.copy(camTarget.position);
        controls.target.copy(camTarget.target);
        camera.lookAt(camTarget.target);
      }
    };

    // Screenshot HD : rend la scène en 3840×2160 et déclenche le download PNG
    screenshotRef.current = () => {
      const oldSize = renderer.getSize(new THREE.Vector2());
      const oldRatio = renderer.getPixelRatio();
      const HD_W = 3840;
      const HD_H = 2160;
      renderer.setPixelRatio(1);
      renderer.setSize(HD_W, HD_H, false);
      camera.aspect = HD_W / HD_H;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const dataURL = renderer.domElement.toDataURL("image/png");
      // restore
      renderer.setPixelRatio(oldRatio);
      renderer.setSize(oldSize.x, oldSize.y, false);
      camera.aspect = oldSize.x / oldSize.y;
      camera.updateProjectionMatrix();
      const link = document.createElement("a");
      link.download = `urbaquai-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    };

    // Record MP4/WebM : capture le canvas pendant un cycle d'animation complet
    let mediaRecorder: MediaRecorder | null = null;
    let recordedChunks: Blob[] = [];
    let stopTimeoutId: ReturnType<typeof setTimeout> | null = null;
    recordRef.current = () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        return;
      }
      // canvas.captureStream(fps) — Chrome/Safari/Firefox récents
      const canvas = renderer.domElement as HTMLCanvasElement & {
        captureStream?: (fps: number) => MediaStream;
      };
      if (!canvas.captureStream) {
        alert("Capture vidéo non supportée par ce navigateur.");
        return;
      }
      const stream = canvas.captureStream(60);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12_000_000 });
      recordedChunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `urbaquai-${Date.now()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        if (stopTimeoutId) clearTimeout(stopTimeoutId);
      };
      mediaRecorder.start();
      setIsRecording(true);
      // Lance l'animation si pas encore démarrée
      if (startTime === null) {
        platformGroup.visible = true;
        startTime = performance.now();
        setHasStarted(true);
      } else {
        // Replay : remet le startTime à zéro
        startTime = performance.now();
      }
      // Stop auto à la fin du cycle (+0.5s de marge)
      stopTimeoutId = setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, cycleMs + 500);
    };

    let lastSliderSync = 0;
    let lastCycleT = -1;
    const animate = () => {
      if (startTime !== null) {
        const now = performance.now() - startTime;
        const cycleT =
          isPausedLocal && manualCycleT !== null
            ? manualCycleT
            : loop
            ? now % cycleMs
            : Math.min(now, cycleMs);
        // Détecte la fin du cycle → reset du bouton Play
        if (!loop && lastCycleT < cycleMs && cycleT >= cycleMs) {
          startTime = null;
          setHasStarted(false);
        }
        lastCycleT = cycleT;
        // Sync slider state ~5fps pendant la lecture (sans flooder React)
        if (!isPausedLocal && performance.now() - lastSliderSync > 200) {
          lastSliderSync = performance.now();
          setSeekT01(cycleT / cycleMs);
        }
        animModules.forEach((m) => {
          const localT = cycleT - m.delay;
          if (localT < 0) {
            m.holder.position.y = dropFromY;
          } else if (localT >= moduleDuration) {
            m.holder.position.y = m.targetY;
          } else {
            const t = localT / moduleDuration;
            const eased = easeInQuad(t);
            m.holder.position.y = dropFromY - (dropFromY - m.targetY) * eased;
          }
        });

        // Bus : skip si en mode édition (l'utilisateur place manuellement)
        if (busLoaded && !transformControls.enabled) {
          busPivot.position.z = busTargetZ;
          busPivot.rotation.y = busTargetRY;
          if (cycleT < busArriveStart) {
            // Avant arrivée : caché
            busPivot.visible = false;
            busPivot.position.x = busOffscreenX;
          } else if (cycleT < busArriveEnd) {
            // Arrivée (décélère)
            busPivot.visible = true;
            const t = (cycleT - busArriveStart) / (busArriveEnd - busArriveStart);
            busPivot.position.x = busOffscreenX + (busTargetX - busOffscreenX) * easeOutCubic(t);
          } else if (cycleT < busHoldEnd) {
            // Arrêt 4.5s à la cible
            busPivot.visible = true;
            busPivot.position.x = busTargetX;
          } else if (cycleT < busDepartEnd) {
            // Départ (accélère)
            busPivot.visible = true;
            const t = (cycleT - busHoldEnd) / (busDepartEnd - busHoldEnd);
            busPivot.position.x = busTargetX + (busDepartureX - busTargetX) * easeInCubic(t);
          } else {
            // Après départ : hors champ, caché
            busPivot.visible = false;
            busPivot.position.x = busDepartureX;
          }
        }
      } else if (busLoaded && !transformControls.enabled) {
        // Avant Play et hors édition : bus caché
        busPivot.visible = false;
      }

      // Caméra : libre quand pause OU pas démarré, sinon override par les keyframes
      if (startTime !== null && !isPausedLocal) {
        const elapsed = performance.now() - startTime;
        const cycleT = loop ? elapsed % cycleMs : Math.min(elapsed, cycleMs);
        if (cycleT < busDepartEnd) {
          const camTarget = getCameraAt(cycleT);
          if (camTarget) {
            controls.enabled = false;
            camera.position.copy(camTarget.position);
            controls.target.copy(camTarget.target);
            camera.lookAt(camTarget.target);
          } else {
            controls.enabled = true;
          }
        } else {
          controls.enabled = true;
        }
      } else {
        controls.enabled = true;
      }

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
      transformControls.dispose();
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
  }, [coloris, loop, presetsLoaded]);

  const handlePlay = () => {
    setHasStarted(true);
    playRef.current();
  };
  const handleScreenshot = () => screenshotRef.current();
  const handleRecord = () => recordRef.current();
  const toggleEdit = (mode: "translate" | "rotate") => {
    const next = editMode === mode ? null : mode;
    setEditMode(next);
    editToggleRef.current(next);
  };
  const handleSaveCam = (phase: CamPhase) => saveCamRef.current(phase);
  const handleResetCams = () => resetCamRef.current();
  const handleTogglePause = () => togglePauseRef.current();
  const handleSeek = (t01: number) => {
    setSeekT01(t01);
    seekRef.current(t01);
  };
  // Mettre à `true` pour réafficher tous les contrôles de setup (caméra + slider + bus drag).
  // Laissé à false pour la prod (seul le bouton Play central reste).
  const SHOW_DEBUG_CONTROLS = false;
  const camLabels: Record<CamPhase, string> = {
    assembly: "Modules",
    arrival: "Arrivée",
    hold: "Arrêt",
    departure: "Départ",
  };

  return (
    <div className={className ?? "relative w-full h-full"}>
      <div ref={containerRef} className="absolute inset-0" />

      {/* Boutons caméra cinématique : 4 keyframes + reset */}
      {SHOW_DEBUG_CONTROLS && (
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        {(Object.keys(camLabels) as CamPhase[]).map((phase, i) => (
          <button
            key={phase}
            type="button"
            onClick={() => handleSaveCam(phase)}
            title={`Sauvegarder caméra — ${camLabels[phase]}`}
            className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md ring-1 ring-black/5 hover:scale-105 transition-all text-xs font-bold ${
              savedPhases[phase]
                ? "bg-accent text-white"
                : "bg-white/95 text-neutral-dark hover:bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={handleResetCams}
          title="Reset caméras"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/95 shadow-md ring-1 ring-black/5 hover:bg-white hover:scale-105 transition-all text-neutral-dark"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1015.5-6.36L21 3M21 3v6h-6" />
          </svg>
        </button>
      </div>
      )}

      {/* Boutons édition bus (drag-and-drop) — cachés pour l'instant */}
      <div className="absolute top-3 left-44 flex gap-2 z-10 hidden">
        <button
          type="button"
          onClick={() => toggleEdit("translate")}
          aria-label="Déplacer le bus"
          title="Drag X/Z (mode déplacement)"
          className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md ring-1 ring-black/5 hover:scale-105 transition-all ${
            editMode === "translate" ? "bg-accent text-white" : "bg-white/95 text-neutral-dark hover:bg-white"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => toggleEdit("rotate")}
          aria-label="Tourner le bus"
          title="Drag rotation Y (mode rotation)"
          className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md ring-1 ring-black/5 hover:scale-105 transition-all ${
            editMode === "rotate" ? "bg-accent text-white" : "bg-white/95 text-neutral-dark hover:bg-white"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" />
          </svg>
        </button>
      </div>

      {/* HUD position bus */}
      {editMode && busPos && (
        <div className="absolute bottom-3 left-3 z-10 bg-black/75 text-white text-xs font-mono px-3 py-2 rounded-lg shadow-md">
          <div>x: <span className="tabular-nums">{busPos.x.toFixed(2)}</span> m</div>
          <div>z: <span className="tabular-nums">{busPos.z.toFixed(2)}</span> m</div>
          <div>rotY: <span className="tabular-nums">{((busPos.ry * 180) / Math.PI).toFixed(1)}</span>°</div>
        </div>
      )}

      {/* Boutons capture (cachés en prod, accessibles via SHOW_DEBUG_CONTROLS) */}
      {SHOW_DEBUG_CONTROLS && (
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          type="button"
          onClick={handleScreenshot}
          aria-label="Capturer en PNG haute résolution"
          title="Screenshot HD (3840×2160)"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/95 shadow-md ring-1 ring-black/5 hover:bg-white hover:scale-105 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-neutral-dark" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-3h8l2 3h3v12H3V7z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleRecord}
          aria-label={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un cycle d'animation"}
          title={isRecording ? "Stop enregistrement" : "Record WebM (1 cycle)"}
          className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md ring-1 ring-black/5 hover:scale-105 transition-all ${
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-white/95 hover:bg-white"
          }`}
        >
          {isRecording ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor" aria-hidden>
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500" fill="currentColor" aria-hidden>
              <circle cx="12" cy="12" r="6" />
            </svg>
          )}
        </button>
      </div>
      )}

      {/* Hint marketing : apparaît pendant que le bus est à l'arrêt (~4.5s) */}
      <div
        className={`absolute left-6 top-4 z-10 max-w-[260px] transition-all duration-700 ease-out pointer-events-none ${
          isInHoldPhase
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-6"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-urbaquai.png"
            alt="URBAQUAI®"
            className="h-9 w-auto mb-3"
          />
          <div className="text-2xl font-bold text-neutral-dark leading-tight">
            Posé en <span className="text-accent">48 h</span>
          </div>
          <div className="mt-2 text-sm text-gray-600 leading-snug">
            Quai modulaire béton préfabriqué, conforme PMR dès la pose.
          </div>
        </div>
      </div>

      {!hasStarted && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Lancer l'animation d'assemblage"
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5 transition-colors group"
        >
          <span className="flex items-center justify-center w-20 h-20 rounded-full bg-white/95 shadow-xl ring-1 ring-black/5 group-hover:scale-110 group-hover:bg-white transition-all">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-accent translate-x-0.5"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      {/* Barre de transport (cachée en prod) */}
      {SHOW_DEBUG_CONTROLS && hasStarted && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/75 text-white rounded-full px-4 py-2 shadow-lg">
          <button
            type="button"
            onClick={handleTogglePause}
            aria-label={isPaused ? "Reprendre" : "Pause"}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-neutral-dark hover:bg-gray-100 transition-colors"
          >
            {isPaused ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4 translate-x-0.5" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            )}
          </button>
          <div className="relative w-72">
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={seekT01}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            {/* Marqueurs de phase */}
            <div className="absolute inset-x-0 -bottom-3 h-2 pointer-events-none">
              {[
                { t: phaseMarkers.s2, label: "Arrivée" },
                { t: phaseMarkers.s3, label: "Arrêt" },
                { t: phaseMarkers.s4, label: "Départ" },
                { t: phaseMarkers.s5, label: "Fin" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="absolute -top-0.5 w-px h-2 bg-white/50"
                  style={{ left: `${m.t * 100}%` }}
                />
              ))}
            </div>
          </div>
          <span className="text-[10px] font-mono tabular-nums opacity-80">
            {(seekT01 * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
