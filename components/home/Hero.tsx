import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getPageContents } from "@/lib/content";

const DEFAULTS = {
  hero_titre: "Le quai bus accessible. En 48h.",
  hero_sous_titre: "Système breveté URBAMAT Environnement",
  hero_description:
    "URBAQUAI est le système modulaire en béton haute performance pour la mise en accessibilité des arrêts de bus. Provisoire ou définitif, conforme à toutes les normes en vigueur.",
  hero_cta: "Voir le système",
};

export async function Hero() {
  const c = await getPageContents("home", DEFAULTS);

  // Séparer le titre pour colorer la fin en accent
  const parts = c.hero_titre.split(".");
  const mainTitle = parts.slice(0, -1).join(".") + ".";
  const accentTitle = parts[parts.length - 1]?.trim();

  return (
    <section className="relative bg-neutral-dark min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-neutral-dark to-neutral-dark" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <Container className="relative z-10 py-20 lg:py-28">
        <div className="max-w-3xl animate-fade-in">
          <span className="inline-block px-3 py-1 mb-6 text-sm font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
            {c.hero_sous_titre}
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
            {mainTitle}{" "}
            {accentTitle && (
              <span className="text-accent">{accentTitle}</span>
            )}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
            {c.hero_description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 animate-slide-up">
            <Button href="/produit" size="lg">
              {c.hero_cta}
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button
              href="/telechargements"
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white hover:text-neutral-dark"
            >
              <Download size={18} className="mr-2" />
              Fiche technique
            </Button>
          </div>
        </div>
      </Container>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary to-transparent" />
    </section>
  );
}
