"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { COLORIS } from "@/lib/configurateur";

type ColorisId = "quartz-blanc" | "basalte-noir" | "granit-gris" | "calcaire-jaune";

export default function TestTexturePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs vers les objets Three.js qu'on doit pouvoir modifier sans recréer la scène
  const slabRef = useRef<THREE.Mesh | null>(null);
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const texRef = useRef<THREE.Texture | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [coloris, setColoris] = useState<ColorisId>("granit-gris");
  const [density, setDensity] = useState(6);
  const [roughness, setRoughness] = useState(0.92);
  const [metalness, setMetalness] = useState(0.02);
  const [tint, setTint] = useState("#ffffff");
  const [seed, setSeed] = useState(1);
  const [moduleSize, setModuleSize] = useState<"3000x1500" | "1500x1500" | "1500x1000">("3000x1500");
  const [bumpScale, setBumpScale] = useState(0.0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [mirroredWrap, setMirroredWrap] = useState(true);
  const [copied, setCopied] = useState(false);

  // ─── 1. Scène + caméra créées UNE SEULE FOIS au montage ───
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-4, 4, -3);
    scene.add(fill);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    scene.add(ground);

    // Slab placeholder (sera reconfiguré par les autres useEffects)
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.18, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 })
    );
    slab.castShadow = true;
    slab.receiveShadow = true;
    slab.position.y = 0.09;
    scene.add(slab);
    slabRef.current = slab;
    matRef.current = slab.material as THREE.MeshStandardMaterial;

    // Camera fit initial
    const sceneCenter = new THREE.Vector3(0, 0.09, 0);
    const fitRadius = 3 * 1.1;
    const fovRad = camera.fov * (Math.PI / 180);
    const dist = (fitRadius / Math.tan(fovRad / 2)) * 1.0;
    camera.position
      .copy(sceneCenter)
      .add(new THREE.Vector3(0.6, 0.55, 1).normalize().multiplyScalar(dist));
    camera.lookAt(sceneCenter);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.copy(sceneCenter);
    controls.update();
    controlsRef.current = controls;

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
      // Disposer matériau/texture courants
      if (matRef.current) matRef.current.dispose();
      if (texRef.current) texRef.current.dispose();
      slab.geometry.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      slabRef.current = null;
      matRef.current = null;
      texRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  // ─── 2. Géométrie du slab : refait quand on change la taille du module ───
  useEffect(() => {
    const slab = slabRef.current;
    if (!slab) return;
    const [Lmm, Wmm] = moduleSize.split("x").map(Number);
    const L = Lmm / 1000;
    const W = Wmm / 1000;
    const H = 0.18;
    slab.geometry.dispose();
    slab.geometry = new THREE.BoxGeometry(L, H, W);
    slab.position.y = H / 2;
    // Mettre à jour le repeat de la texture en cours puisqu'il dépend des dimensions
    if (texRef.current) {
      texRef.current.repeat.set(L * density, W * density);
      texRef.current.needsUpdate = true;
    }
  }, [moduleSize, density]);

  // ─── 3. Texture : recréée quand coloris ou seed change ───
  useEffect(() => {
    const slab = slabRef.current;
    const mat = matRef.current;
    if (!slab || !mat) return;
    const [Lmm, Wmm] = moduleSize.split("x").map(Number);
    const L = Lmm / 1000;
    const W = Wmm / 1000;

    const tex = new THREE.TextureLoader().load(`/images/urbamat/coloris-${coloris}.png`);
    const wrap = mirroredWrap ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping;
    tex.wrapS = wrap;
    tex.wrapT = wrap;
    tex.repeat.set(L * density, W * density);
    const rng = (n: number) => ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;
    tex.offset.set(rng(seed), rng(seed + 100));
    tex.colorSpace = THREE.SRGBColorSpace;

    // Remplacer dans le matériau
    if (texRef.current) texRef.current.dispose();
    texRef.current = tex;
    mat.map = tex;
    mat.bumpMap = bumpScale > 0 ? tex : null;
    mat.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coloris, seed, mirroredWrap]);

  // ─── 4. Densité : ajuste juste le repeat ───
  useEffect(() => {
    const tex = texRef.current;
    if (!tex) return;
    const [Lmm, Wmm] = moduleSize.split("x").map(Number);
    const L = Lmm / 1000;
    const W = Wmm / 1000;
    tex.repeat.set(L * density, W * density);
    tex.needsUpdate = true;
  }, [density, moduleSize]);

  // ─── 5. Propriétés du matériau : roughness, metalness, tint, bump ───
  useEffect(() => {
    const mat = matRef.current;
    if (!mat) return;
    mat.color.set(tint);
    mat.roughness = roughness;
    mat.metalness = metalness;
    mat.bumpScale = bumpScale;
    mat.bumpMap = bumpScale > 0 ? texRef.current : null;
    mat.needsUpdate = true;
  }, [tint, roughness, metalness, bumpScale]);

  // ─── 6. Auto-rotation : juste un flag sur les controls ───
  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.autoRotate = autoRotate;
    controlsRef.current.autoRotateSpeed = 1.5;
  }, [autoRotate]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-neutral-dark mb-1">Atelier texture béton</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sliders en direct pour calibrer le rendu. La caméra reste où vous l&apos;avez laissée
          quand vous bougez les curseurs. Quand le rendu vous convient, dites-moi les valeurs et
          je les applique dans <code className="bg-white px-1 rounded text-[11px] ml-1 font-mono">ModuleViewer.tsx</code>.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* 3D viewer */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
            <div ref={containerRef} className="w-full h-[600px]" />
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
              <span>
                {moduleSize}mm — répétitions ({(parseInt(moduleSize.split("x")[0]) / 1000 * density).toFixed(1)} × {(parseInt(moduleSize.split("x")[1]) / 1000 * density).toFixed(1)})
              </span>
              <span>1 motif ≈ {(1000 / density).toFixed(0)}mm</span>
            </div>
          </div>

          {/* Sliders panel */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-5 space-y-5 lg:max-h-[640px] lg:overflow-y-auto">
            {/* Coloris */}
            <Field
              label="Coloris du béton"
              hint="La photo URBAMAT utilisée comme texture sur le bloc."
            >
              <div className="grid grid-cols-2 gap-2">
                {COLORIS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColoris(c.id as ColorisId)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs ${
                      coloris === c.id
                        ? "border-accent bg-accent/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/urbamat/coloris-${c.id}.png`}
                      alt={c.nom}
                      className="w-6 h-6 rounded object-cover"
                    />
                    <span className="text-[11px] truncate">{c.nom}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Module size */}
            <Field
              label="Taille du module"
              hint="Pour comparer comment la même densité rend sur un grand vs petit bloc."
            >
              <div className="grid grid-cols-3 gap-1">
                {(["3000x1500", "1500x1500", "1500x1000"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setModuleSize(s)}
                    className={`px-2 py-1.5 rounded border text-[11px] font-mono ${
                      moduleSize === s
                        ? "border-accent bg-accent/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Slider
              label="Densité de la texture"
              hint="Combien de fois la photo se répète par mètre. Plus haut = granulats plus petits."
              value={density}
              onChange={setDensity}
              min={1}
              max={20}
              step={0.5}
              suffix={` motifs/m (≈${(1000 / density).toFixed(0)}mm)`}
            />

            <Slider
              label="Rugosité (mat ↔ brillant)"
              hint="0 = brillant comme du verre · 1 = mat comme du béton brut. Béton classique : 0.85–0.95."
              value={roughness}
              onChange={setRoughness}
              min={0}
              max={1}
              step={0.02}
            />

            <Slider
              label="Aspect métallique"
              hint="Reflets du béton. À 0 = pas de reflets. Du béton n'a quasi pas de métal (0–0.05)."
              value={metalness}
              onChange={setMetalness}
              min={0}
              max={0.5}
              step={0.01}
            />

            <Slider
              label="Relief de surface"
              hint="Donne du volume aux granulats : la photo devient une carte de profondeur. 0 = à plat."
              value={bumpScale}
              onChange={setBumpScale}
              min={0}
              max={0.05}
              step={0.001}
              suffix={bumpScale === 0 ? " (désactivé)" : ""}
            />

            <Field
              label="Teinte appliquée"
              hint="Couleur multipliée à la texture. Blanc = photo pure. Plus sombre = béton assombri."
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tint}
                  onChange={(e) => setTint(e.target.value)}
                  className="w-10 h-8 rounded border border-gray-200"
                />
                <code className="text-xs font-mono text-gray-500">{tint}</code>
                <button
                  onClick={() => setTint("#ffffff")}
                  className="ml-auto text-[11px] text-accent hover:underline"
                >
                  réinitialiser
                </button>
              </div>
            </Field>

            <Field
              label="Coutures miroir"
              hint="Alterne les tiles miroirés pour cacher la grille. Le quadrillage disparaît, mais on garde la même densité."
            >
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={mirroredWrap}
                  onChange={(e) => setMirroredWrap(e.target.checked)}
                  className="rounded"
                />
                <span>{mirroredWrap ? "Activées (recommandé)" : "Désactivées (grille visible)"}</span>
              </label>
            </Field>

            <Field
              label="Variation aléatoire"
              hint="Décale la photo d'un cran : utile pour que deux blocs voisins ne soient pas identiques."
            >
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="w-full px-3 py-2 bg-neutral-dark text-white rounded text-xs hover:bg-neutral-dark/90"
              >
                Nouveau décalage (#{seed})
              </button>
            </Field>

            <Field
              label="Rotation automatique"
              hint="Stoppez-la pour observer un détail précis sans que le bloc bouge."
            >
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="rounded"
                />
                <span>{autoRotate ? "Activée" : "Stoppée"}</span>
              </label>
            </Field>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <button
                onClick={async () => {
                  const text = `Applique ces réglages texture béton :
- densité = ${density} motifs/m
- rugosité = ${roughness}
- métal = ${metalness}
- relief = ${bumpScale}
- teinte = ${tint}
- coutures miroir = ${mirroredWrap}`;
                  try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  } catch {
                    alert("Copie impossible — voici le texte :\n\n" + text);
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-accent text-white hover:bg-accent/90"
                }`}
              >
                {copied ? "✓ Copié — colle dans le chat" : "📋 Copier le réglage"}
              </button>
              <p className="text-[11px] text-gray-400 leading-snug">
                Le bouton copie un message tout fait. Colle-le dans le chat et j&apos;applique
                ces valeurs comme nouveaux défauts dans <code className="font-mono">ModuleViewer.tsx</code>.
              </p>
              <p className="text-[10px] text-gray-300 font-mono">
                {density}/m · rug{roughness} · mét{metalness} · rel{bumpScale} · {tint} · miroir:{mirroredWrap ? "on" : "off"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-1">
        {label}
      </label>
      {hint && <p className="text-[11px] text-gray-500 mb-2 leading-snug">{hint}</p>}
      {children}
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  suffix = "",
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-bold text-neutral-dark uppercase tracking-wider">
          {label}
        </label>
        <code className="text-[11px] font-mono text-gray-500">
          {value}
          {suffix}
        </code>
      </div>
      {hint && <p className="text-[11px] text-gray-500 mb-2 leading-snug">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}
