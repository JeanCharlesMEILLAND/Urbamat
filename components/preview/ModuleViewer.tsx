"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { MODULE_CATALOG, COLORIS, type ModuleRef } from "@/lib/configurateur";

export type ColorisId = "quartz-blanc" | "basalte-noir" | "granit-gris" | "calcaire-jaune";

interface ModuleViewerProps {
  /** A catalog ref (uses procedural fallback) or any string matching a /models/{ref}.{glb,obj} file */
  moduleRef: ModuleRef | string;
  coloris?: ColorisId;
  autoRotate?: boolean;
  className?: string;
  /** Hide the "aperçu schématique" badge (utile en thumbnail) */
  hideBadge?: boolean;
  /** Désactive le zoom à la molette (utile dans des thumbnails inline) */
  enableZoom?: boolean;
  /** Vue strictement d'en haut (caméra orientée -Y) pour un plan 2D du module */
  topView?: boolean;
}

function getCatalogSpec(ref: string) {
  return (MODULE_CATALOG as Record<string, (typeof MODULE_CATALOG)[ModuleRef]>)[ref];
}

export function getConcreteColor(coloris: ColorisId | undefined): string {
  const found = COLORIS.find((c) => c.id === coloris);
  return found?.hex ?? "#C8C2B5";
}

// Cache de textures béton — chargées une seule fois par coloris (texture de base, repeat=1).
const concreteTextureCache: Partial<Record<ColorisId, THREE.Texture>> = {};
export function getConcreteTexture(coloris: ColorisId | undefined): THREE.Texture | undefined {
  if (typeof window === "undefined") return undefined;
  const id: ColorisId = coloris ?? "granit-gris";
  if (!concreteTextureCache[id]) {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(`/images/urbamat/coloris-${id}.png`);
    // MirroredRepeatWrapping cache les coutures de tiles sans toucher à la densité.
    tex.wrapS = THREE.MirroredRepeatWrapping;
    tex.wrapT = THREE.MirroredRepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    concreteTextureCache[id] = tex;
  }
  return concreteTextureCache[id];
}

/** Densité de tile fixe en répétitions par mètre — garantit la même finesse de granulat
 * sur tous les modules quelle que soit leur taille. Réglage validé : 1 motif/m + miroirs. */
const TILE_DENSITY_PER_METER = 1;

/** Crée le matériau béton plat — aplat de couleur du coloris, sans texture (validé : la texture
 * photo donnait des artefacts de tiling et un rendu incohérent entre modules). */
export function createConcreteMaterial(coloris: ColorisId | undefined): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: getConcreteColor(coloris),
    roughness: 0.92,
    metalness: 0.02,
  });
}

/** Crée un matériau béton spécifique à un slab — clone la texture avec un repeat
 * proportionnel aux dimensions physiques (L × W en mètres) + offset aléatoire pour
 * que les blocs adjacents ne soient pas des clones identiques.
 * `textureCounterRotation` (en radians) compense la rotation Y appliquée au module
 * par le caller, pour que la photo apparaisse toujours dans le même sens visuel
 * peu importe l'orientation du bloc. */
export function makeSlabConcreteMaterial(
  coloris: ColorisId | undefined,
  Lmeters: number,
  Wmeters: number,
  textureCounterRotation = 0
): THREE.MeshStandardMaterial {
  const baseMap = getConcreteTexture(coloris);
  if (!baseMap) {
    return new THREE.MeshStandardMaterial({
      color: getConcreteColor(coloris),
      roughness: 0.92,
      metalness: 0.02,
    });
  }
  const clonedTex = baseMap.clone();
  // Si on contre-tourne, on doit aussi swapper L/W pour que le repeat reste correct
  // dans l'orientation visuelle (90° → l'axe long du repeat passe sur l'autre axe).
  const isRotated90 = Math.abs(Math.abs(textureCounterRotation) - Math.PI / 2) < 0.01;
  const repeatX = isRotated90 ? Wmeters : Lmeters;
  const repeatY = isRotated90 ? Lmeters : Wmeters;
  clonedTex.repeat.set(
    Math.max(repeatX * TILE_DENSITY_PER_METER, 1),
    Math.max(repeatY * TILE_DENSITY_PER_METER, 1)
  );
  clonedTex.offset.set(Math.random(), Math.random());
  clonedTex.center.set(0.5, 0.5);
  clonedTex.rotation = textureCounterRotation;
  clonedTex.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: clonedTex,
    roughness: 0.92,
    metalness: 0.02,
  });
}

export const MM_TO_M_EXPORT = 1 / 1000;

const MM_TO_M = 1 / 1000;

/**
 * Generate a procedural concrete texture (CanvasTexture).
 * Combines:
 *   - subtle large-scale value variation (cement paste mottling)
 *   - random aggregate stones (pebbles)
 *   - fine sandblasted speckles (B24 finish)
 */
function makeConcreteTexture(baseHex: string, size = 512): {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
} {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base color
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Large-scale mottling (random soft blobs)
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 30 + Math.random() * 90;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = Math.random() < 0.5 ? "rgba(0,0,0," : "rgba(255,255,255,";
    const a = (0.04 + Math.random() * 0.07).toFixed(2);
    grad.addColorStop(0, tone + a + ")");
    grad.addColorStop(1, tone + "0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Aggregate stones (visible pebbles in concrete)
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1.5 + Math.random() * 4;
    const dark = Math.random() < 0.4;
    ctx.fillStyle = dark
      ? `rgba(${30 + Math.random() * 40},${30 + Math.random() * 40},${30 + Math.random() * 40},0.6)`
      : `rgba(${200 + Math.random() * 50},${200 + Math.random() * 50},${190 + Math.random() * 50},0.55)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine sandblasted speckles (sablé B24)
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    if (Math.random() < 0.18) {
      const noise = (Math.random() - 0.5) * 35;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + noise));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + noise));
    }
  }
  ctx.putImageData(img, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1);
  map.colorSpace = THREE.SRGBColorSpace;

  // Bump map: greyscale of color map (cheap normal proxy)
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext("2d")!;
  bctx.drawImage(canvas, 0, 0);
  const bimg = bctx.getImageData(0, 0, size, size);
  for (let i = 0; i < bimg.data.length; i += 4) {
    const g = (bimg.data[i] + bimg.data[i + 1] + bimg.data[i + 2]) / 3;
    bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = g;
  }
  bctx.putImageData(bimg, 0, 0);
  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 1);

  return { map, bump };
}

/**
 * Build a procedural Group from the catalog spec.
 *   - Bloc béton aux dimensions exactes du MODULE_CATALOG (mm)
 *   - Rampes : profil trapézoïdal biseauté (40→180mm)
 * NOTE : inserts d'ancrage, trous de levage, texture sablée non rendus
 *        — en attente des specs dimensionnelles réelles URBAMAT.
 */
/** Couleur des rainures/rubans adaptée au coloris du bloc — contraste maximal avec
 * la couleur du béton pour rester lisibles à toute distance. */
export function getGrooveColor(coloris: ColorisId | undefined): string {
  switch (coloris) {
    case "basalte-noir":   return "#f0ebde"; // crème très claire sur béton presque noir
    case "granit-gris":    return "#e8e2d2"; // beige clair sur béton gris (contraste fort)
    case "calcaire-jaune": return "#15110d"; // noir profond sur béton sablé
    case "quartz-blanc":   return "#0a0805"; // noir profond sur béton blanc
    default:                return "#1a1612";
  }
}

export function buildProceduralModule(
  ref: ModuleRef,
  concreteMat: THREE.Material,
  coloris?: ColorisId,
  /** Rotation Y (rad) prévue par le caller — sert à contre-tourner la texture
   * pour que la photo béton garde le même sens sur tous les blocs. */
  upcomingRotateY = 0
): THREE.Group {
  const spec = MODULE_CATALOG[ref];
  // D-004 = miroir de D-003 (fin de quai gauche)
  // D-008a = miroir de D-008 (jonction droite avec chanfrein côté 1.5m)
  const mirrorOnX = ref === "D-004";
  const mirrorOnZ = ref === "D-008a";
  // D-007 : swap L/W pour que le chanfrein/rainures soient sur le côté 1m (pas 1.5m)
  const swapDims = ref === "D-007";
  const L = (swapDims ? spec.largeur : spec.longueur) * MM_TO_M;
  const W = (swapDims ? spec.longueur : spec.largeur) * MM_TO_M;
  const H = spec.hauteur * MM_TO_M;

  const group = new THREE.Group();

  // Modules nus (sans chanfrein ni rainures)
  const isNuModule = ref === "D-005" || ref === "D-007a";
  // Modules sans rainures sur le top (mais peuvent avoir d'autres détails)
  const noRainures = isNuModule || ref === "D-009a";

  let slabGeom: THREE.BufferGeometry;
  if (isNuModule) {
    slabGeom = new THREE.BoxGeometry(L, H, W);
  } else if (ref === "D-009a") {
    // D-009a : encoche sous le slab + top légèrement sloped (rampe arrière)
    // Profil de section (vue de côté) extrudé sur la profondeur W.
    const Hmax = 0.22;          // 220mm hauteur max
    const Hmin = 0.17;          // 170mm hauteur min (côté quai)
    const notchStart = 0.497;   // 497mm depuis bord gauche
    const notchWidth = 0.449;   // 449mm de large
    const notchDepth = 0.12;    // 120mm profondeur
    const Lreal = 1.5;
    const Wreal = 1.5;
    const profile = new THREE.Shape();
    profile.moveTo(0, 0);
    profile.lineTo(notchStart, 0);
    profile.lineTo(notchStart, notchDepth);
    profile.lineTo(notchStart + notchWidth, notchDepth);
    profile.lineTo(notchStart + notchWidth, 0);
    profile.lineTo(Lreal, 0);
    profile.lineTo(Lreal, Hmax);
    profile.lineTo(0, Hmin);
    profile.closePath();
    slabGeom = new THREE.ExtrudeGeometry(profile, { depth: Wreal, bevelEnabled: false });
    slabGeom.translate(-Lreal / 2, -Hmax / 2, -Wreal / 2);
    slabGeom.computeVertexNormals();
  } else if (spec.role === "rampe") {
    // D'après PDF "D-009 (rampe 18 à 10cm)" : haut = 180mm, bas = 100mm.
    // D-009 : HAUT à gauche (-X côté quai), BAS à droite (+X, plaque métal).
    // D-009s : biseau inversé — HAUT à droite (+X), BAS à gauche (-X).
    // Côté HAUT : top à 180mm pile au bord, et chanfrein 25×142mm INVERSÉ
    // (le bas est inset 25mm) pour s'emboîter dans le rebord biseauté de D-002.
    const lowH = 0.10;
    const highH = 0.18;
    const chamferW = 0.025;
    const chamferDrop = 0.142;
    const isInverted = ref === "D-009s";
    const shape = new THREE.Shape();
    if (isInverted) {
      // HAUT à droite (+X) : top au bord, bas inset
      shape.moveTo(0, 0);
      shape.lineTo(L - chamferW, 0);                         // bottom inset 25mm
      shape.lineTo(L - chamferW, highH - chamferDrop);        // up to chamfer base
      shape.lineTo(L, highH);                                 // chanfrein vers top-edge à 180mm
      shape.lineTo(0, lowH);                                  // pente vers le bas (côté gauche, 100mm)
    } else {
      // HAUT à gauche (-X) : top au bord, bas inset
      shape.moveTo(chamferW, 0);                              // bottom inset 25mm
      shape.lineTo(L, 0);                                     // bottom-right
      shape.lineTo(L, lowH);                                  // top-right (low side, 100mm)
      shape.lineTo(0, highH);                                 // top-left au bord à 180mm
      shape.lineTo(chamferW, highH - chamferDrop);            // chanfrein vers le bas inset
    }
    shape.closePath();
    slabGeom = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false });
    slabGeom.translate(-L / 2, -H / 2, -W / 2);
    slabGeom.computeVertexNormals();
  } else if (spec.role === "fin") {
    // Module d'angle (fin de quai) : DEUX chanfreins perpendiculaires côté route
    // (+Z) et côté extrémité (+X) qui se rejoignent proprement à l'angle exterieur.
    // Construit via ConvexGeometry depuis les sommets définis manuellement.
    const chamferW = 0.025;
    const verticalFaceH = 0.038;
    const yTop = H / 2;
    const yMid = -H / 2 + verticalFaceH;
    const yBot = -H / 2;
    const verts: THREE.Vector3[] = [
      // Top face (inset on +X and +Z sides because of the 2 chamfers)
      new THREE.Vector3(-L / 2, yTop, -W / 2),
      new THREE.Vector3(+L / 2 - chamferW, yTop, -W / 2),
      new THREE.Vector3(+L / 2 - chamferW, yTop, +W / 2 - chamferW),
      new THREE.Vector3(-L / 2, yTop, +W / 2 - chamferW),
      // Mid level (haut de la petite face verticale 38mm) on +Z and +X sides
      new THREE.Vector3(-L / 2, yMid, +W / 2),
      new THREE.Vector3(+L / 2, yMid, +W / 2),
      new THREE.Vector3(+L / 2, yMid, -W / 2),
      // Bottom face (full rectangle)
      new THREE.Vector3(-L / 2, yBot, -W / 2),
      new THREE.Vector3(+L / 2, yBot, -W / 2),
      new THREE.Vector3(+L / 2, yBot, +W / 2),
      new THREE.Vector3(-L / 2, yBot, +W / 2),
    ];
    slabGeom = new ConvexGeometry(verts);
    slabGeom.computeVertexNormals();
  } else {
    // Profil de section d'après Detail A du plan tech.
    // Le top est INSET de 25mm côté ROUTE, le chanfrein descend vers l'extérieur
    // sur 142mm, puis 38mm de face verticale en bas. Angle 100° en haut, 80° en bas.
    // Côté route = shape's -X = world +Z après rotateY(+PI/2).
    const verticalFaceH = 0.038;
    const chamferW = 0.025;
    const profile = new THREE.Shape();
    profile.moveTo(W / 2, H / 2);                          // top-trottoir
    profile.lineTo(-W / 2 + chamferW, H / 2);              // top-route (inset 25mm)
    profile.lineTo(-W / 2, -H / 2 + verticalFaceH);        // haut de la petite face verticale 38mm
    profile.lineTo(-W / 2, -H / 2);                        // bottom-route
    profile.lineTo(W / 2, -H / 2);                         // bottom-trottoir
    profile.closePath();
    slabGeom = new THREE.ExtrudeGeometry(profile, { depth: L, bevelEnabled: false });
    slabGeom.rotateY(Math.PI / 2);
    slabGeom.translate(-L / 2, 0, 0);
    slabGeom.computeVertexNormals();
  }

  const slab = new THREE.Mesh(slabGeom, concreteMat);
  slab.castShadow = true;
  slab.receiveShadow = true;
  group.add(slab);

  // Subtle edge overlay so the silhouette reads well
  const edges = new THREE.EdgesGeometry(slabGeom, 30);
  group.add(
    new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: "#3D2A4F", transparent: true, opacity: 0.22 })
    )
  );

  // ─── Détails spécifiques aux RAMPES ─────────────
  // D-009  : HAUT à -X (côté quai), BAS à +X (côté chaussée)
  // D-009s : biseau inversé (HAUT à +X)
  if (spec.role === "rampe" && ref !== "D-009a") {
    const lowH = 0.10;
    const highH = 0.18;
    const isInverted = ref === "D-009s";
    const yTopAt = (x: number) => {
      const t = (x + L / 2) / L; // 0=gauche, 1=droite
      const leftH = isInverted ? lowH : highH;
      const rightH = isInverted ? highH : lowH;
      return -H / 2 + (leftH * (1 - t) + rightH * t);
    };

    // ─── 4 inserts de levage sur la pente ─────────
    const liftDiameter = 0.04;
    const liftDepth = 0.012;
    const liftMat = new THREE.MeshStandardMaterial({
      color: "#1a1715",
      roughness: 1,
      metalness: 0,
    });
    const insertXs = [-L * 0.25, L * 0.25];
    const insertZs = [-W * 0.25, W * 0.25];
    insertXs.forEach((ix) => {
      const yTop = yTopAt(ix);
      insertZs.forEach((iz) => {
        const insert = new THREE.Mesh(
          new THREE.CylinderGeometry(liftDiameter / 2, liftDiameter / 2, liftDepth, 20),
          liftMat
        );
        insert.position.set(ix, yTop - liftDepth / 2 + 0.0005, iz);
        group.add(insert);
      });
    });

    // ─── Plaque métal galvanisé 510mm — prolonge la pente jusqu'au sol ──
    // Son bord côté slab est à hauteur du dessus du bas de la rampe (-H/2 + lowH),
    // son bord extérieur arrive pile sur le sol (-H/2). Drop = lowH / 2 sur metalLength.
    // D-009s = "rampe suite" → pas de plaque métal (continuité avec autre rampe)
    if (ref !== "D-009s") {
      const metalLength = 0.51;
      const metalThickness = 0.005;
      const metalGeom = new THREE.BoxGeometry(metalLength, metalThickness, W);
      const metalMat = new THREE.MeshStandardMaterial({
        color: "#d4d8dc",
        roughness: 0.25,
        metalness: 1.0,
      });
      const metalPlate = new THREE.Mesh(metalGeom, metalMat);
      // Drop réel : du haut de la marche basse (y=-H/2+lowH) au sol (y=-H/2)
      const yInner = -H / 2 + lowH;
      const yOuter = -H / 2 + metalThickness; // juste au-dessus du sol pour éviter le z-fighting
      const drop = yInner - yOuter;
      const slopeAngle = Math.atan2(drop, metalLength);
      metalPlate.rotation.z = -slopeAngle;
      metalPlate.position.set(L / 2 + metalLength / 2, (yInner + yOuter) / 2, 0);
      metalPlate.castShadow = true;
      metalPlate.receiveShadow = true;
      group.add(metalPlate);
    }

    return group;
  }

  // ─── 4 inserts de levage 1BG sur le DESSUS (Ø40) ──
  // Position d'après plan tech D-002 : ±750mm × ±450mm du centre
  // Pour les modules 3m centraux ; pour les latéraux 1500mm, pattern proportionnel
  const liftDiameter = 0.04; // Ø40mm (douille RD16)
  const liftDepth = 0.012;
  const liftMat = new THREE.MeshStandardMaterial({
    color: "#1a1715",
    roughness: 1,
    metalness: 0,
  });
  // Inserts à 750mm des extrémités le long de L (pour 3m → ±750 du centre = inset 750mm/edge)
  // Et à 300mm des bords le long de W (pour 1500 → ±450 du centre)
  let liftOffsetXMm = spec.longueur >= 3000 ? 750 : Math.max(spec.longueur / 4, 200);
  let liftOffsetZMm = spec.largeur >= 1500 ? 450 : spec.largeur / 4;
  // Pour D-007, swapDims a inversé la géométrie ; il faut inverser aussi les offsets
  // pour que les inserts/pads tombent aux mêmes positions visuelles que D-007a.
  if (swapDims) {
    [liftOffsetXMm, liftOffsetZMm] = [liftOffsetZMm, liftOffsetXMm];
  }
  const liftX = liftOffsetXMm * MM_TO_M;
  const liftZ = liftOffsetZMm * MM_TO_M;
  // Pour D-009a, le top suit une pente de 170mm (X=0) à 220mm (X=L), Hmax=220mm
  const computeInsertY = (worldX: number): number => {
    if (ref === "D-009a") {
      const Lreal = 1.5;
      const Hmax = 0.22;
      const Hmin = 0.17;
      const xShape = worldX + Lreal / 2; // 0..L
      const yTopShape = Hmin + (xShape / Lreal) * (Hmax - Hmin);
      return yTopShape - Hmax / 2 - liftDepth / 2 + 0.0005;
    }
    return H / 2 - liftDepth / 2 + 0.0005;
  };
  [-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
      const insert = new THREE.Mesh(
        new THREE.CylinderGeometry(liftDiameter / 2, liftDiameter / 2, liftDepth, 20),
        liftMat
      );
      const wx = sx * liftX;
      insert.position.set(wx, computeInsertY(wx), sz * liftZ);
      group.add(insert);
    });
  });

  // ─── 4 empreintes carrées (cuvelage) en DESSOUS ──
  // Empreinte rectangulaire 200×200mm où traverse l'insert (visible quand on retourne)
  // D-009a n'a pas d'empreintes en dessous (forme spéciale avec encoche)
  if (ref !== "D-009a") {
    const padFootprint = 0.2; // 200×200mm (d'après plan tech)
    const padThickness = 0.04; // 40mm
    const padMat = new THREE.MeshStandardMaterial({
      color: "#2a2422",
      roughness: 0.85,
      metalness: 0.2,
    });
    [-1, 1].forEach((sx) => {
      [-1, 1].forEach((sz) => {
        const pad = new THREE.Mesh(
          new THREE.BoxGeometry(padFootprint, padThickness, padFootprint),
          padMat
        );
        pad.position.set(sx * liftX, -H / 2 - padThickness / 2, sz * liftZ);
        pad.castShadow = true;
        group.add(pad);
      });
    });
  }

  // Skip toutes les rainures pour les modules nus ou D-009a
  if (noRainures) return group;

  // ─── Rainures sur le dessus (NFP 98-352) ──────
  // Côté ROUTE (+Z après rotateY) — même côté que le chanfrein.
  // Latéraux : bande d'éveil podotactile (12 rainures parallèles dans une zone)
  // Autres : 2 rainures de guidage
  const grooveDepth = 0.006;
  const grooveMat = new THREE.MeshStandardMaterial({
    color: getGrooveColor(coloris),
    roughness: 1,
    metalness: 0,
  });

  if (spec.role === "lateral") {
    // Bande d'éveil podotactile : 8 rainures de 12mm espacées de 28mm
    // entièrement dans la zone non-chanfreinée du dessus.
    const chamferTopInset = 0.025; // chanfrein côté route
    const safeMargin = 0.04;
    const stripeCount = 8;
    const stripeWidth = 0.012;
    const stripePitch = 0.028;
    const stripeBandWidth = (stripeCount - 1) * stripePitch + stripeWidth;
    // Top route edge limite à W/2 - chamferTopInset
    const bandRouteEdge = W / 2 - chamferTopInset - safeMargin;
    const stripeBandCenterZ = bandRouteEdge - stripeBandWidth / 2;
    for (let i = 0; i < stripeCount; i++) {
      const dz = (i - (stripeCount - 1) / 2) * stripePitch;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(L, grooveDepth, stripeWidth),
        grooveMat
      );
      stripe.position.set(0, H / 2 - grooveDepth / 2 + 0.0008, stripeBandCenterZ + dz);
      group.add(stripe);
    }
  } else {
    // 2 rainures de guidage parallèles côté route (+Z), formant un L avec les
    // rainures perpendiculaires sur les fins de quai. Chaque rainure s'arrête
    // exactement au bord intérieur de sa rainure perpendiculaire correspondante.
    const grooveWidth = 0.015;
    const grooveSpacing = 0.05;
    const grooveOffsetFromEdge = 0.16;
    const yTopGroove = H / 2 - grooveDepth / 2 + 0.0008;
    const isFin = spec.role === "fin";

    // Pour chaque rainure (interne ou externe), définit son centre et la rainure
    // perpendiculaire correspondante (même rang). Inner ↔ inner, outer ↔ outer.
    const grooveOffsets = [-grooveSpacing / 2, grooveSpacing / 2];
    grooveOffsets.forEach((dz, i) => {
      // La rainure perpendiculaire correspondante a le même offset signe
      const dxOpp = grooveOffsets[i];
      // Rainures collées aux bords pour raccorder avec le module voisin
      const xStart = -L / 2;
      const xEnd = isFin
        ? L / 2 - grooveOffsetFromEdge + dxOpp + grooveWidth / 2
        : L / 2;
      const grooveLen = Math.max(0.001, xEnd - xStart);
      const groove = new THREE.Mesh(
        new THREE.BoxGeometry(grooveLen, grooveDepth, grooveWidth),
        grooveMat
      );
      const zCenter = W / 2 - grooveOffsetFromEdge + dz;
      groove.position.set((xStart + xEnd) / 2, yTopGroove, zCenter);
      group.add(groove);
    });

    if (isFin) {
      grooveOffsets.forEach((dx, i) => {
        const dzOpp = grooveOffsets[i];
        const zStart = -W / 2;
        const zEnd = W / 2 - grooveOffsetFromEdge + dzOpp + grooveWidth / 2;
        const grooveLen = Math.max(0.001, zEnd - zStart);
        const groove = new THREE.Mesh(
          new THREE.BoxGeometry(grooveWidth, grooveDepth, grooveLen),
          grooveMat
        );
        const xCenter = L / 2 - grooveOffsetFromEdge + dx;
        groove.position.set(xCenter, yTopGroove, (zStart + zEnd) / 2);
        group.add(groove);
      });
    }
  }

  // ─── D-004 spécifique : 4 rainures parallèles à L (axe X) ──
  // Longueur 1200mm, commencent à 30cm du côté chanfreiné (+X avant miroir)
  // et vont jusqu'à l'autre bout (-L/2). 4 rainures à 4 positions Z (centrées).
  // D-004a : 4 rubans qui partent du bord gauche (-L/2) et finissent 20cm avant droite,
  // pour se connecter aux rubans de D-004 à la jonction des rangées.
  if (ref === "D-004a") {
    const yTop = H / 2 - grooveDepth / 2 + 0.0008;
    const stripeWidth = 0.05;
    const stripePitch = 0.085;
    const stripeCount = 4;
    const xStart = -L / 2;             // bord gauche
    const xEnd = L / 2 - 0.20;         // 20cm avant le bord droit
    const stripeLen = xEnd - xStart;
    const xCenter = (xStart + xEnd) / 2;
    for (let i = 0; i < stripeCount; i++) {
      const dz = (i - (stripeCount - 1) / 2) * stripePitch;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(stripeLen, grooveDepth, stripeWidth),
        grooveMat
      );
      stripe.position.set(xCenter, yTop, dz);
      group.add(stripe);
    }
  }

  if (ref === "D-004") {
    // 4 rubans pivotés (le long de Z) pour s'aligner avec les rubans de D-004a
    const yTop = H / 2 - grooveDepth / 2 + 0.0008;
    const stripeWidth = 0.05;
    const stripePitch = 0.085;
    const stripeCount = 4;
    const zStart = -W / 2;
    const zEnd = W / 2 - 0.30; // 30cm du chanfrein côté Z
    const stripeLen = zEnd - zStart;
    const zCenter = (zStart + zEnd) / 2;
    for (let i = 0; i < stripeCount; i++) {
      const dx = (i - (stripeCount - 1) / 2) * stripePitch;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(stripeWidth, grooveDepth, stripeLen),
        grooveMat
      );
      stripe.position.set(dx, yTop, zCenter);
      group.add(stripe);
    }
  }

  if (mirrorOnX || mirrorOnZ) {
    const mirrored = new THREE.Group();
    if (mirrorOnX) mirrored.scale.x = -1;
    if (mirrorOnZ) mirrored.scale.z = -1;
    mirrored.add(group);
    return mirrored;
  }

  return group;
}

type Source = "glb" | "obj" | "procedural";

export function ModuleViewer({ moduleRef, coloris = "quartz-blanc", autoRotate = false, className, hideBadge = false, enableZoom = true, topView = false }: ModuleViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState<Source | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100);
    camera.position.set(4, 3, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting tuned for matte concrete
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
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

    const catalogSpec = getCatalogSpec(moduleRef);
    const groundY = catalogSpec
      ? -(catalogSpec.hauteur * MM_TO_M) / 2 - 0.001
      : -0.5;

    // Subtle shadow catcher under the module
    const shadowCatcher = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 64),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.y = groundY;
    shadowCatcher.receiveShadow = true;
    scene.add(shadowCatcher);

    const concreteMat = createConcreteMaterial(coloris);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = enableZoom;
    controls.enablePan = enableZoom;
    controls.target.set(0, 0, 0);

    // Pause auto-rotate quand l'utilisateur interagit
    let isInteracting = false;
    controls.addEventListener("start", () => {
      isInteracting = true;
    });
    controls.addEventListener("end", () => {
      isInteracting = false;
    });

    // Initial camera fit based on catalog dimensions if available (refined after load)
    const initSpec = catalogSpec ?? { longueur: 1500, largeur: 1500, hauteur: 180 };
    const maxDim = Math.max(initSpec.longueur, initSpec.largeur, initSpec.hauteur) * MM_TO_M;
    const radius = maxDim * 0.7;
    const fov = camera.fov * (Math.PI / 180);
    const distance = (radius / Math.tan(fov / 2)) * 1.2;
    // Caméra plus rasante pour les rampes (mieux voir la pente), plongeante pour le reste
    const isRampe = catalogSpec?.role === "rampe";
    const dir = isRampe
      ? new THREE.Vector3(1, 0.25, 0.6).normalize()  // plus latéral pour voir le wedge
      : new THREE.Vector3(1, 0.55, 1).normalize();   // plongeant pour le reste
    camera.position.copy(dir.multiplyScalar(distance));
    camera.lookAt(0, 0, 0);
    controls.update();

    // Loading priority: .glb → .obj → procedural
    let cancelled = false;

    const placeAtBase = (root: THREE.Object3D) => {
      // Center horizontally, sit on y = -H/2 (procedural module base level)
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      // If coords look like mm (max dim > 50), rescale to meters
      const maxObj = Math.max(size.x, size.y, size.z);
      if (maxObj > 50) {
        root.scale.setScalar(MM_TO_M);
        root.updateMatrixWorld(true);
      }
      const finalBox = new THREE.Box3().setFromObject(root);
      const center = new THREE.Vector3();
      finalBox.getCenter(center);
      if (catalogSpec) {
        // Catalog-known module: center horizontally and rest base on shadow plane
        root.position.x -= center.x;
        root.position.z -= center.z;
        root.position.y += -(catalogSpec.hauteur * MM_TO_M) / 2 - finalBox.min.y;
      } else {
        // Unknown module (e.g. D-007): center fully at origin
        root.position.sub(center);
      }
    };

    const applyConcreteToMeshes = (root: THREE.Object3D) => {
      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = concreteMat;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (!mesh.geometry.attributes.normal) {
            mesh.geometry.computeVertexNormals();
          }
        }
      });
    };

    const fitCameraToObject = (root: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(root);
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      const fovRad = camera.fov * (Math.PI / 180);
      const dist = (sphere.radius / Math.tan(fovRad / 2)) * 1.4;
      const dirVec = new THREE.Vector3(1, 0.55, 1).normalize();
      camera.position.copy(sphere.center).add(dirVec.multiplyScalar(dist));
      camera.lookAt(sphere.center);
      camera.near = Math.max(0.001, dist / 1000);
      camera.far = dist * 100;
      camera.updateProjectionMatrix();
      controls.target.copy(sphere.center);
      controls.maxDistance = dist * 5;
      controls.minDistance = dist / 20;
      controls.update();
    };

    const buildProcedural = () => {
      if (cancelled) return;
      if (!catalogSpec) {
        setSource("procedural");
        return;
      }
      const moduleGroup = buildProceduralModule(moduleRef as ModuleRef, concreteMat);
      pivot.add(moduleGroup);
      setSource("procedural");
    };

    const tryLoadObj = () => {
      const objUrl = `/models/${moduleRef}.obj`;
      fetch(objUrl, { method: "HEAD" })
        .then((res) => {
          if (cancelled) return;
          if (!res.ok) {
            buildProcedural();
            return;
          }
          new OBJLoader().load(
            objUrl,
            (obj) => {
              if (cancelled) return;
              if (catalogSpec) {
                const rawSize = new THREE.Vector3();
                new THREE.Box3().setFromObject(obj).getSize(rawSize);
                const rawMaxMm = Math.max(rawSize.x, rawSize.y, rawSize.z);
                const catalogMaxMm = Math.max(catalogSpec.longueur, catalogSpec.largeur, catalogSpec.hauteur);
                // Reject if OBJ max dim is more than 20% smaller than catalog max
                // (means OBJ doesn't represent a full module — likely topo targets or partial geometry)
                if (rawMaxMm < catalogMaxMm * 0.8) {
                  buildProcedural();
                  return;
                }
              }
              applyConcreteToMeshes(obj);
              placeAtBase(obj);
              pivot.add(obj);
              fitCameraToObject(obj);
              setSource("obj");
            },
            undefined,
            () => {
              if (!cancelled) buildProcedural();
            }
          );
        })
        .catch(() => {
          if (!cancelled) buildProcedural();
        });
    };

    // Loading priority for catalog modules: glb → procedural (skip OBJ since they're sparse).
    // For non-catalog refs (free-form), try glb → obj → empty.
    const glbUrl = `/models/${moduleRef}.glb`;
    fetch(glbUrl, { method: "HEAD" })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          new GLTFLoader().load(
            glbUrl,
            (gltf) => {
              if (cancelled) return;
              const root = gltf.scene;
              applyConcreteToMeshes(root);
              placeAtBase(root);
              pivot.add(root);
              fitCameraToObject(root);
              setSource("glb");
            },
            undefined,
            () => {
              if (!cancelled) (catalogSpec ? buildProcedural() : tryLoadObj());
            }
          );
        } else {
          if (catalogSpec) buildProcedural();
          else tryLoadObj();
        }
      })
      .catch(() => {
        if (!cancelled) (catalogSpec ? buildProcedural() : tryLoadObj());
      });

    let raf = 0;
    const animate = () => {
      if (autoRotate && !isInteracting) pivot.rotation.y += 0.0035;
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
        if ((obj as THREE.Mesh).isMesh || (obj as THREE.LineSegments).isLineSegments) {
          const m = obj as THREE.Mesh & THREE.LineSegments;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            (m.material as THREE.Material)?.dispose();
          }
        }
      });
    };
  }, [moduleRef, autoRotate, coloris, enableZoom]);

  return (
    <div ref={containerRef} className={className ?? "relative w-full h-full"}>
      {source === "procedural" && !hideBadge && (
        <span className="absolute bottom-2 right-3 text-[9px] uppercase tracking-wider text-neutral-dark/50 pointer-events-none">
          aperçu schématique
        </span>
      )}
    </div>
  );
}
