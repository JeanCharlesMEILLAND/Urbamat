"use client";

import { useRef, useEffect, useState } from "react";
import type { PlacedModule, ModuleRow, NbRangees } from "@/lib/configurateur";
import { COLORIS } from "@/lib/configurateur";
import { Maximize2, Minimize2 } from "lucide-react";

interface QuaiView3DProps {
  modulesByRow: Record<ModuleRow, PlacedModule[]>;
  nbRangees: NbRangees;
  coloris: string;
  showShelter?: boolean;
  showLabels?: boolean;
}

const S = 1 / 1000; // mm -> m
const ROW_DEPTH = 1.5; // 1500mm
const GAP = 0.15;

// Couleurs par role -- identiques au 2D
const ROLE_COLORS: Record<string, string> = {
  rampe: "#F5D4A0",    // amber
  lateral: "#93C5FD",   // blue-300
  central: "#D1D5DB",   // gray-300
  jonction: "#C4B5FD",  // purple-300
  fin: "#6EE7B7",       // emerald-300
};

const ROLE_EDGE: Record<string, string> = {
  rampe: "#D97706",
  lateral: "#3B82F6",
  central: "#6B7280",
  jonction: "#8B5CF6",
  fin: "#10B981",
};

function getModuleColor(colorisId: string, role: string): { base: string; edge: string } {
  // Utiliser la couleur beton choisie pour les modules centraux, couleur role pour les autres
  if (role === "central") {
    const c = COLORIS.find((cl) => cl.id === colorisId);
    const hex = c?.hex ?? "#D4D0C8";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return {
      base: hex,
      edge: `rgb(${Math.floor(r * 0.75)},${Math.floor(g * 0.75)},${Math.floor(b * 0.75)})`,
    };
  }
  return { base: ROLE_COLORS[role] ?? "#D1D5DB", edge: ROLE_EDGE[role] ?? "#6B7280" };
}

// Row 1 = outermost (closest to bus/road center)
// Row N = innermost (closest to sidewalk curb)
const getRowZ = (row: number, nbRangees: number): number => {
  // Row N (closest to curb) is at Z=0, row 1 is farthest out
  return (nbRangees - row) * (ROW_DEPTH + GAP);
};

export function QuaiView3D({ modulesByRow, nbRangees, coloris, showShelter = true, showLabels = true }: QuaiView3DProps) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const hasModules = Object.values(modulesByRow).some(arr => arr.length > 0);

  // Fullscreen state sync (handles Escape key)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (!canvasWrapperRef.current || !hasModules) return;

    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const wrapper = canvasWrapperRef.current;
    let cancelled = false;

    (async () => {
      try {
        const THREE = await import("three");
        if (cancelled) return;

        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;

        // --- Scene ----
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#E8EDF5");

        // --- Dimensions ----
        let maxLen = 0;
        for (let r = 1; r <= nbRangees; r++) {
          const rowModules = modulesByRow[r as ModuleRow] ?? [];
          const len = rowModules.reduce((s, m) => s + m.spec.longueur, 0) * S;
          if (len > maxLen) maxLen = len;
        }
        maxLen = Math.max(maxLen, 3);

        const cx = maxLen / 2;
        const dist = Math.max(maxLen * 0.65, 4);

        // --- Camera ----
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);

        // --- Renderer ----
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        wrapper.appendChild(renderer.domElement);

        // --- Lights ----
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const sun = new THREE.DirectionalLight(0xffffff, 0.9);
        sun.position.set(maxLen * 0.7, 10, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        scene.add(sun);
        scene.add(new THREE.DirectionalLight(0xffffff, 0.3).translateX(-5).translateY(8).translateZ(-5));

        // --- Layout Z -- all rows on road (chaussee), extending from curb outward ----
        //
        //   Row N (innermost, closest to sidewalk curb) is at Z=0
        //   Row 1 (outermost, closest to bus/road center) is farthest out (+Z)
        //
        // Total quai depth
        const QUAI_DEPTH = nbRangees * ROW_DEPTH + (nbRangees - 1) * GAP;

        // Row N center is at Z=0, so the back of the quai (closest to curb) is at Z = -ROW_DEPTH/2
        const QUAI_BACK = -ROW_DEPTH / 2;
        // Front of quai (road side of row 1)
        const QUAI_FRONT = QUAI_BACK + QUAI_DEPTH;

        // The curb sits at the back edge of the quai
        const CURB_Z = QUAI_BACK;

        // Route starts at the curb (quai modules are ON the road)
        const ROUTE_START = CURB_Z;

        // --- Trottoir (sidewalk, behind the curb) ----
        const TROT_WIDTH = 3;
        const trot = new THREE.Mesh(
          new THREE.PlaneGeometry(maxLen + 4, TROT_WIDTH),
          new THREE.MeshStandardMaterial({ color: "#CBC7BB", roughness: 0.85 })
        );
        trot.rotation.x = -Math.PI / 2;
        trot.position.set(cx, -0.004, CURB_Z - TROT_WIDTH / 2);
        trot.receiveShadow = true;
        scene.add(trot);

        // Bordure trottoir (curb between sidewalk and road)
        const bordure = new THREE.Mesh(
          new THREE.BoxGeometry(maxLen + 4, 0.15, 0.1),
          new THREE.MeshStandardMaterial({ color: "#A0A0A0", roughness: 0.7 })
        );
        bordure.position.set(cx, 0.075, CURB_Z - 0.05);
        scene.add(bordure);

        // --- Route (road, extends in front of row 1) ----
        const ROUTE_WIDTH = 7;
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(maxLen + 8, ROUTE_WIDTH),
          new THREE.MeshStandardMaterial({ color: "#3a3a3a", roughness: 0.95 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(cx, -0.005, ROUTE_START + ROUTE_WIDTH / 2);
        ground.receiveShadow = true;
        scene.add(ground);

        // --- Road markings (far side of road) ----
        const dashGeo = new THREE.PlaneGeometry(0.7, 0.07);
        const dashMat = new THREE.MeshBasicMaterial({ color: "#E8E4D0", transparent: true, opacity: 0.5 });
        for (let i = 0; i < Math.floor((maxLen + 2) / 1.4); i++) {
          const d = new THREE.Mesh(dashGeo, dashMat);
          d.rotation.x = -Math.PI / 2;
          d.position.set(i * 1.4 - 0.5, 0.001, ROUTE_START + ROUTE_WIDTH / 2);
          scene.add(d);
        }

        // --- Trottoir oppose ----
        const trotOpp = new THREE.Mesh(
          new THREE.PlaneGeometry(maxLen + 4, 2.5),
          new THREE.MeshStandardMaterial({ color: "#CBC7BB", roughness: 0.85 })
        );
        trotOpp.rotation.x = -Math.PI / 2;
        trotOpp.position.set(cx, -0.004, ROUTE_START + ROUTE_WIDTH + 1.25);
        scene.add(trotOpp);

        // Bordure trottoir oppose
        const bordure2 = new THREE.Mesh(
          new THREE.BoxGeometry(maxLen + 4, 0.15, 0.1),
          new THREE.MeshStandardMaterial({ color: "#A0A0A0", roughness: 0.7 })
        );
        bordure2.position.set(cx, 0.075, ROUTE_START + ROUTE_WIDTH + 0.05);
        scene.add(bordure2);

        // --- Label helper ----
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createLabel = (text: string, position: any) => {
          const canvas2d = document.createElement("canvas");
          canvas2d.width = 128;
          canvas2d.height = 32;
          const ctx = canvas2d.getContext("2d")!;
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.roundRect(0, 0, 128, 32, 4);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 16px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, 64, 16);

          const texture = new THREE.CanvasTexture(canvas2d);
          const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.position.copy(position);
          sprite.scale.set(0.5, 0.125, 1);
          scene.add(sprite);
        }

        // --- Module builder ----
        const addBlock = (m: PlacedModule, zOff: number, rowLen: number) => {
          const w = m.spec.longueur * S;
          const h = m.spec.hauteur * S;
          const d = ROW_DEPTH;
          const px = m.x * S + w / 2;
          const py = h / 2;
          const { base, edge } = getModuleColor(coloris, m.spec.role);

          const MODULE_GAP = 0.02; // 2cm gap entre modules

          if (m.spec.rampeType === "arriere") {
            // --- Rear ramp (D-009a) - slope along Z axis (depth) ----
            // The shape is defined in the YZ plane and extruded along X.
            // Slopes from quai height (180mm) at the front to near-ground at the back (toward trottoir).
            const LIP = 0.04;          // lip height 40mm at the low end
            const CANIVEAU_L = 0.51;   // caniveau flap length 510mm
            const CANIVEAU_H = 0.04;   // caniveau flap thickness 40mm
            const rw = w - MODULE_GAP; // module width along X
            const rd = d - MODULE_GAP; // module depth along Z
            const rampeMat = new THREE.MeshStandardMaterial({ color: base, roughness: 0.6 });
            const rampeEdgeMat = new THREE.LineBasicMaterial({ color: edge });
            const startX = m.x * S + MODULE_GAP / 2;

            // Shape in YZ plane: slope from full height at front (Z=0) to lip at back (Z=rd)
            // Y is vertical, "depth" of extrude shape is along Z
            const shape = new THREE.Shape();
            // Bottom-front
            shape.moveTo(0, 0);
            // Top-front (full quai height)
            shape.lineTo(0, h);
            // Top-back (lip height, toward trottoir)
            shape.lineTo(rd, LIP);
            // Bottom-back
            shape.lineTo(rd, 0);
            shape.closePath();

            // Extrude along X (module width)
            const geo = new THREE.ExtrudeGeometry(shape, { depth: rw, bevelEnabled: false });
            const mesh = new THREE.Mesh(geo, rampeMat);
            // Position: the shape is in the YZ plane, extruded along "depth" which becomes X
            // We need to rotate so the extrude direction is along X
            mesh.rotation.y = Math.PI / 2;
            mesh.position.set(startX + rw, 0, zOff - rd / 2);
            mesh.castShadow = true;
            scene.add(mesh);
            scene.add(new THREE.LineSegments(
              new THREE.EdgesGeometry(geo), rampeEdgeMat
            ).rotateY(Math.PI / 2).translateX(startX + rw).translateZ(zOff - rd / 2));

            // Caniveau flap extending toward trottoir (behind the ramp, -Z direction)
            const caniveauGeo = new THREE.BoxGeometry(rw, CANIVEAU_H, CANIVEAU_L);
            const caniveauMat = new THREE.MeshStandardMaterial({
              color: "#8B8B85", roughness: 0.7, metalness: 0.1,
            });
            const caniveauMesh = new THREE.Mesh(caniveauGeo, caniveauMat);
            caniveauMesh.position.set(
              startX + rw / 2,
              CANIVEAU_H / 2,
              zOff - rd / 2 - CANIVEAU_L / 2
            );
            caniveauMesh.castShadow = true;
            scene.add(caniveauMesh);
            scene.add(new THREE.LineSegments(
              new THREE.EdgesGeometry(caniveauGeo),
              new THREE.LineBasicMaterial({ color: "#666" })
            ).translateX(caniveauMesh.position.x).translateY(caniveauMesh.position.y).translateZ(caniveauMesh.position.z));

            // Rainures antiderapantes along Z on the slope surface
            const grooveMat = new THREE.MeshBasicMaterial({ color: edge, transparent: true, opacity: 0.3 });
            const grooveCount = Math.floor(rd / 0.12);
            for (let gi = 1; gi < grooveCount; gi++) {
              const gz = gi * (rd / grooveCount);
              const grooveGeo = new THREE.PlaneGeometry(rw - 0.06, 0.008);
              const groove = new THREE.Mesh(grooveGeo, grooveMat);
              groove.rotation.x = -Math.PI / 2;
              // Height on the slope at this Z position
              const t = gz / rd;
              const grooveY = h - t * (h - LIP);
              groove.position.set(startX + rw / 2, grooveY + 0.001, zOff - rd / 2 + gz);
              scene.add(groove);
            }

            // Label
            if (showLabels) {
              createLabel(m.ref, new THREE.Vector3(m.x * S + w / 2, h + 0.12, zOff));
            }
          } else if (m.spec.role === "rampe") {
            // --- Lateral ramp (D-009) - slope along X axis ----
            // Detect if the ramp is on the left or right of the quai
            const moduleCenter = m.x * S + w / 2;
            const isLeftRampe = moduleCenter < rowLen / 2;

            // Dimensions reelles rampe URBAQUAI
            const LIP = 0.04;          // levre basse 40mm
            const CANIVEAU_L = 0.51;   // extension caniveau 510mm
            const CANIVEAU_H = 0.04;   // epaisseur volet caniveau 40mm
            const rw = w - MODULE_GAP;
            const rd = d - MODULE_GAP;
            const rampeMat = new THREE.MeshStandardMaterial({ color: base, roughness: 0.6 });
            const rampeEdgeMat = new THREE.LineBasicMaterial({ color: edge });
            const startX = m.x * S + MODULE_GAP / 2;

            // --- Corps principal rampe (biseau) ---
            const shape = new THREE.Shape();
            if (isLeftRampe) {
              // Pente montante : levre 40mm a gauche -> 180mm a droite
              shape.moveTo(0, 0);
              shape.lineTo(rw, 0);
              shape.lineTo(rw, h);
              shape.lineTo(0, LIP);
            } else {
              // Pente descendante : 180mm a gauche -> levre 40mm a droite
              shape.moveTo(0, 0);
              shape.lineTo(rw, 0);
              shape.lineTo(rw, LIP);
              shape.lineTo(0, h);
            }
            shape.closePath();
            const geo = new THREE.ExtrudeGeometry(shape, { depth: rd, bevelEnabled: false });
            const mesh = new THREE.Mesh(geo, rampeMat);
            mesh.position.set(startX, 0, zOff - rd / 2);
            mesh.castShadow = true;
            scene.add(mesh);
            scene.add(new THREE.LineSegments(
              new THREE.EdgesGeometry(geo), rampeEdgeMat
            ).translateX(startX).translateZ(zOff - rd / 2));

            // --- Volet caniveau (articule, a plat devant la levre) ---
            const caniveauGeo = new THREE.BoxGeometry(CANIVEAU_L, CANIVEAU_H, rd);
            const caniveauMat = new THREE.MeshStandardMaterial({
              color: "#8B8B85", roughness: 0.7, metalness: 0.1,
            });
            const caniveauMesh = new THREE.Mesh(caniveauGeo, caniveauMat);
            // Positionner le volet au sol, accolle au cote bas de la rampe
            if (isLeftRampe) {
              caniveauMesh.position.set(
                startX - CANIVEAU_L / 2,
                CANIVEAU_H / 2,
                zOff
              );
            } else {
              caniveauMesh.position.set(
                startX + rw + CANIVEAU_L / 2,
                CANIVEAU_H / 2,
                zOff
              );
            }
            caniveauMesh.castShadow = true;
            scene.add(caniveauMesh);
            scene.add(new THREE.LineSegments(
              new THREE.EdgesGeometry(caniveauGeo),
              new THREE.LineBasicMaterial({ color: "#666" })
            ).translateX(caniveauMesh.position.x).translateY(caniveauMesh.position.y).translateZ(caniveauMesh.position.z));

            // --- Rainures antiderapantes sur la surface de la rampe ---
            const grooveMat = new THREE.MeshBasicMaterial({ color: edge, transparent: true, opacity: 0.3 });
            const grooveCount = Math.floor(rw / 0.12);
            for (let gi = 1; gi < grooveCount; gi++) {
              const gx = gi * (rw / grooveCount);
              const grooveGeo = new THREE.PlaneGeometry(0.008, rd - 0.06);
              const groove = new THREE.Mesh(grooveGeo, grooveMat);
              groove.rotation.x = -Math.PI / 2;
              // Hauteur de la rainure sur la pente
              const t = gx / rw;
              let grooveY: number;
              if (isLeftRampe) {
                grooveY = LIP + t * (h - LIP);
              } else {
                grooveY = h - t * (h - LIP);
              }
              groove.position.set(startX + gx, grooveY + 0.001, zOff);
              scene.add(groove);
            }

            // Label
            if (showLabels) {
              createLabel(m.ref, new THREE.Vector3(m.x * S + w / 2, h + 0.12, zOff));
            }
          } else {
            const geo = new THREE.BoxGeometry(w - MODULE_GAP, h, d - MODULE_GAP);
            const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: base, roughness: 0.55, metalness: 0.03 }));
            mesh.position.set(px, py, zOff);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);

            // Aretes avec couleur de role
            scene.add(new THREE.LineSegments(
              new THREE.EdgesGeometry(geo),
              new THREE.LineBasicMaterial({ color: edge })
            ).translateX(px).translateY(py).translateZ(zOff));

            // Points tactiles sur le dessus
            if (w > 0.5) {
              const dotGeo = new THREE.CircleGeometry(0.02, 6);
              const dotMat = new THREE.MeshBasicMaterial({ color: edge });
              for (const dx of [-0.2, 0, 0.2]) {
                for (const dz of [-0.3, 0.3]) {
                  const dot = new THREE.Mesh(dotGeo, dotMat);
                  dot.rotation.x = -Math.PI / 2;
                  dot.position.set(px + w * dx, py + h / 2 + 0.002, zOff + dz);
                  scene.add(dot);
                }
              }
            }

            // Label ref
            if (showLabels) {
              createLabel(m.ref, new THREE.Vector3(px, h + 0.1, zOff));
            }
          }
        }

        // --- Dynamic module rendering ----
        for (let r = 1; r <= nbRangees; r++) {
          const row = r as ModuleRow;
          const rowModules = modulesByRow[row] ?? [];
          const rowLen = rowModules.reduce((s, m) => s + m.spec.longueur, 0) * S;
          const zOff = getRowZ(r, nbRangees);
          for (const m of rowModules) {
            if (m.spec.role === "vide") continue;
            addBlock(m, zOff, rowLen);
          }
        }

        // --- Abribus ----
        const buildBusShelter = (posX: number, posZ: number) => {
          const shelterGroup = new THREE.Group();

          const metalColor = "#5A5A5A";
          const glassColor = "#A8D8EA";
          const roofColor = "#4A4A4A";
          const metalMat = new THREE.MeshStandardMaterial({ color: metalColor, roughness: 0.3, metalness: 0.7 });
          const glassMat = new THREE.MeshPhysicalMaterial({
            color: glassColor, transparent: true, opacity: 0.25,
            roughness: 0.05, metalness: 0.1, transmission: 0.8,
          });
          const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.4, metalness: 0.5 });

          // Dimensions abribus
          const shelterW = 3.6;  // largeur (axe X)
          const shelterD = 1.3;  // profondeur (axe Z)
          const shelterH = 2.5;  // hauteur

          // --- 4 poteaux ----
          const postGeo = new THREE.CylinderGeometry(0.03, 0.03, shelterH, 8);
          const postPositions = [
            [-shelterW / 2, 0],
            [shelterW / 2, 0],
            [-shelterW / 2, -shelterD],
            [shelterW / 2, -shelterD],
          ];
          for (const [px, pz] of postPositions) {
            const post = new THREE.Mesh(postGeo, metalMat);
            post.position.set(px, shelterH / 2, pz);
            post.castShadow = true;
            shelterGroup.add(post);
          }

          // --- Toit (legerement incline) ----
          const roofGeo = new THREE.BoxGeometry(shelterW + 0.3, 0.06, shelterD + 0.3);
          const roof = new THREE.Mesh(roofGeo, roofMat);
          roof.position.set(0, shelterH, -shelterD / 2);
          roof.rotation.x = -0.03; // legere pente
          roof.castShadow = true;
          shelterGroup.add(roof);

          // Bord avant du toit (lisiere)
          const roofEdgeGeo = new THREE.BoxGeometry(shelterW + 0.3, 0.12, 0.04);
          const roofEdge = new THREE.Mesh(roofEdgeGeo, metalMat);
          roofEdge.position.set(0, shelterH - 0.03, 0.15);
          shelterGroup.add(roofEdge);

          // --- Panneau arriere (verre) ----
          const backGeo = new THREE.BoxGeometry(shelterW, shelterH - 0.3, 0.02);
          const back = new THREE.Mesh(backGeo, glassMat);
          back.position.set(0, shelterH / 2 - 0.1, -shelterD);
          shelterGroup.add(back);

          // --- Panneaux lateraux (verre) ----
          const sideGeo = new THREE.BoxGeometry(0.02, shelterH - 0.3, shelterD);
          const sideL = new THREE.Mesh(sideGeo, glassMat);
          sideL.position.set(-shelterW / 2, shelterH / 2 - 0.1, -shelterD / 2);
          shelterGroup.add(sideL);

          const sideR = new THREE.Mesh(sideGeo, glassMat);
          sideR.position.set(shelterW / 2, shelterH / 2 - 0.1, -shelterD / 2);
          shelterGroup.add(sideR);

          // --- Banc interieur ----
          const benchSeatGeo = new THREE.BoxGeometry(shelterW * 0.7, 0.04, 0.3);
          const benchSeat = new THREE.Mesh(benchSeatGeo, metalMat);
          benchSeat.position.set(0, 0.45, -shelterD + 0.25);
          shelterGroup.add(benchSeat);

          // Pieds du banc
          const benchLegGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
          for (const bx of [-shelterW * 0.3, 0, shelterW * 0.3]) {
            const leg = new THREE.Mesh(benchLegGeo, metalMat);
            leg.position.set(bx, 0.225, -shelterD + 0.25);
            shelterGroup.add(leg);
          }

          // --- Panneau publicitaire / info ----
          const panelGeo = new THREE.BoxGeometry(1.2, 1.7, 0.04);
          const panelCanvas = document.createElement("canvas");
          panelCanvas.width = 256;
          panelCanvas.height = 384;
          const pctx = panelCanvas.getContext("2d")!;
          // Fond
          pctx.fillStyle = "#1B3A6B";
          pctx.fillRect(0, 0, 256, 384);
          // Texte
          pctx.fillStyle = "#E8A020";
          pctx.font = "bold 28px sans-serif";
          pctx.textAlign = "center";
          pctx.fillText("URBAQUAI\u00AE", 128, 160);
          pctx.fillStyle = "#FFFFFF";
          pctx.font = "16px sans-serif";
          pctx.fillText("Quai bus modulaire", 128, 200);
          pctx.fillText("Accessible PMR", 128, 225);

          const panelTexture = new THREE.CanvasTexture(panelCanvas);
          const panelMat = new THREE.MeshStandardMaterial({ map: panelTexture, roughness: 0.3 });
          const panel = new THREE.Mesh(panelGeo, panelMat);
          panel.position.set(shelterW / 2 + 0.025, 1.2, -shelterD / 2);
          panel.rotation.y = Math.PI / 2;
          shelterGroup.add(panel);

          // Inverser l'abribus pour que l'ouverture soit face au quai (cote Z positif)
          shelterGroup.rotation.y = Math.PI;
          shelterGroup.position.set(posX, 0.18, posZ);
          scene.add(shelterGroup);
        }

        // Placer l'abribus cote trottoir, derriere le quai
        if (maxLen > 4 && showShelter) {
          buildBusShelter(cx, QUAI_BACK - 1.2);
        }

        // --- Row labels ----
        if (showLabels) {
          for (let r = 1; r <= nbRangees; r++) {
            const rowModules = modulesByRow[r as ModuleRow] ?? [];
            if (rowModules.length > 0) {
              const zOff = getRowZ(r, nbRangees);
              createLabel(`RANG ${r}`, new THREE.Vector3(-0.6, 0.15, zOff));
            }
          }
        }

        // --- Cotation longueur ----
        if (maxLen > 0) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.005, QUAI_BACK - 0.2),
            new THREE.Vector3(maxLen, 0.005, QUAI_BACK - 0.2),
          ]);
          scene.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: "#1B3A6B" })));
          if (showLabels) {
            createLabel(`${(maxLen).toFixed(1)}m`, new THREE.Vector3(cx, 0.12, QUAI_BACK - 0.2));
          }
        }

        // --- Orbit controls ----
        let isDragging = false;
        let prevX = 0, prevY = 0;
        let theta = -0.5, phi = 0.55, radius = dist;
        const quaiCenterZ = (getRowZ(1, nbRangees) + getRowZ(nbRangees, nbRangees)) / 2;
        const target = new THREE.Vector3(cx, 0.1, quaiCenterZ);

        const updateCam = () => {
          camera.position.set(
            target.x + radius * Math.sin(phi) * Math.cos(theta),
            target.y + radius * Math.cos(phi),
            target.z + radius * Math.sin(phi) * Math.sin(theta)
          );
          camera.lookAt(target);
        }
        updateCam();

        const cvs = renderer.domElement;
        cvs.style.display = "block";

        const onDown = (e: PointerEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; cvs.setPointerCapture(e.pointerId); };
        const onMove = (e: PointerEvent) => {
          if (!isDragging) return;
          theta -= (e.clientX - prevX) * 0.005;
          phi = Math.max(0.1, Math.min(1.5, phi - (e.clientY - prevY) * 0.005));
          prevX = e.clientX; prevY = e.clientY;
          updateCam();
        };
        const onUp = (e: PointerEvent) => { isDragging = false; cvs.releasePointerCapture(e.pointerId); };
        const onWheel = (e: WheelEvent) => { e.preventDefault(); radius = Math.max(1.5, Math.min(dist * 3, radius + e.deltaY * 0.005)); updateCam(); };

        cvs.addEventListener("pointerdown", onDown);
        cvs.addEventListener("pointermove", onMove);
        cvs.addEventListener("pointerup", onUp);
        cvs.addEventListener("wheel", onWheel, { passive: false });

        let animId: number;
        const animate = () => { animId = requestAnimationFrame(animate); renderer.render(scene, camera); };
        animate();

        const onResize = () => {
          const w2 = wrapper.clientWidth; const h2 = wrapper.clientHeight;
          camera.aspect = w2 / h2; camera.updateProjectionMatrix(); renderer.setSize(w2, h2);
        };
        window.addEventListener("resize", onResize);

        setLoaded(true);

        cleanupRef.current = () => {
          cancelAnimationFrame(animId);
          window.removeEventListener("resize", onResize);
          cvs.removeEventListener("pointerdown", onDown);
          cvs.removeEventListener("pointermove", onMove);
          cvs.removeEventListener("pointerup", onUp);
          cvs.removeEventListener("wheel", onWheel);
          renderer.dispose();
          scene.clear();
          if (wrapper.contains(cvs)) wrapper.removeChild(cvs);
        };
      } catch (err) {
        if (!cancelled) { console.error("3D:", err); setError(String(err)); }
      }
    })();

    return () => { cancelled = true; cleanupRef.current?.(); cleanupRef.current = null; };
  }, [modulesByRow, nbRangees, coloris, hasModules, showShelter, showLabels]);

  if (!hasModules) {
    return (
      <div className="w-full h-[450px] bg-neutral-dark/5 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        Ajoutez des modules pour voir la vue 3D
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[450px] bg-red-50 rounded-lg flex items-center justify-center text-red-500 text-sm p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[450px] lg:h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-b from-sky-100 to-sky-50 relative"
      style={{ touchAction: "none" }}
    >
      <div ref={canvasWrapperRef} className="absolute inset-0" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          Chargement de la vue 3D...
        </div>
      )}
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-10 p-2 rounded-md bg-white/80 hover:bg-white border border-gray-300 shadow-sm transition-colors"
        title={isFullscreen ? "Quitter le plein ecran" : "Plein ecran"}
        type="button"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4 text-gray-600" /> : <Maximize2 className="w-4 h-4 text-gray-600" />}
      </button>
    </div>
  );
}
