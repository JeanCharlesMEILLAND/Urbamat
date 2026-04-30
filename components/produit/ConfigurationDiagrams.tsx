/**
 * Schémas SVG des 4 configurations URBAQUAI : avancée trottoir, avancée + piste cyclable,
 * île, île + piste cyclable. Vue de dessus.
 *
 * Les composants délèguent au Style B (« Plan illustré IDFM ») validé par le client
 * dans /test-styles. Ce style équilibre rigueur normative (caniveau dark, plaque métal
 * galvanisée, marquage axial pointillé) et lisibilité moderne (gris béton + bus simplifié).
 *
 * Exporte :
 *   - 4 composants SVG individuels (utilisables seuls dans une card)
 *   - <ConfigurationDiagrams /> : grille 2x2 avec cards titrées (page /produit)
 *   - CONFIG_DIAGRAMS : map id config → composant
 */

import {
  StyleB_Avancee,
  StyleB_AvanceeVelo,
  StyleB_Ile,
  StyleB_IleVelo,
} from "./StyleVariants";

interface DiagramSvgProps {
  className?: string;
  /** Conservé pour compat avec les anciens consommateurs ; Style B n'a pas de
   *  label "URBAQUAI" sur le quai donc le flag n'a pas d'effet visuel. */
  showLabel?: boolean;
}

/* ─── 1. Avancée de trottoir ─────────────────────────────── */
export function AvanceeTrottoirDiagram({ className = "w-full h-auto" }: DiagramSvgProps = {}) {
  return (
    <div className={className}>
      <StyleB_Avancee />
    </div>
  );
}

/* ─── 2. Avancée + piste cyclable ────────────────────────── */
export function AvanceeVeloDiagram({ className = "w-full h-auto" }: DiagramSvgProps = {}) {
  return (
    <div className={className}>
      <StyleB_AvanceeVelo />
    </div>
  );
}

/* ─── 3. Configuration en île ────────────────────────────── */
export function IleDiagram({ className = "w-full h-auto" }: DiagramSvgProps = {}) {
  return (
    <div className={className}>
      <StyleB_Ile />
    </div>
  );
}

/* ─── 4. Île + piste cyclable ────────────────────────────── */
export function IleVeloDiagram({ className = "w-full h-auto" }: DiagramSvgProps = {}) {
  return (
    <div className={className}>
      <StyleB_IleVelo />
    </div>
  );
}

/* ────────── Card-wrapper helper (utilisé par /produit) ────────── */
function DiagramCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[11px] uppercase tracking-widest text-accent font-bold">{subtitle}</p>
        <h3 className="text-sm font-bold text-neutral-dark mt-0.5">{title}</h3>
      </div>
      <div className="bg-gray-50 p-3">{children}</div>
    </div>
  );
}

/** Grille 2×2 utilisée sur la page /produit (avec cards titrées). */
export function ConfigurationDiagrams() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      <DiagramCard title="Avancée de trottoir" subtitle="Configuration 1">
        <AvanceeTrottoirDiagram />
      </DiagramCard>
      <DiagramCard title="Avancée + piste cyclable" subtitle="Configuration 2">
        <AvanceeVeloDiagram />
      </DiagramCard>
      <DiagramCard title="Configuration en île" subtitle="Configuration 3">
        <IleDiagram />
      </DiagramCard>
      <DiagramCard title="Île + piste cyclable" subtitle="Configuration 4">
        <IleVeloDiagram />
      </DiagramCard>
    </div>
  );
}

/** Map id config → composant SVG pour usage dans les listings (ex: ConfigurationsGrid de la home). */
export const CONFIG_DIAGRAMS = {
  avancee: AvanceeTrottoirDiagram,
  avancee_velo: AvanceeVeloDiagram,
  ile: IleDiagram,
  ile_velo: IleVeloDiagram,
} as const;
