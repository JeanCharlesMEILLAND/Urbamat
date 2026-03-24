"use client";

import Link from "next/link";
import { ShieldCheck, BookOpen, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const NORMES = [
  {
    titre: "Loi du 11 février 2005",
    description: "Égalité des droits et des chances : tous les points d'arrêt de transport collectif doivent être rendus accessibles.",
  },
  {
    titre: "Guide CEREMA 2018",
    description: "Recommandations techniques pour l'aménagement des arrêts de bus accessibles. URBAQUAI répond à chaque exigence.",
  },
  {
    titre: "Norme NF P 98-352",
    description: "Exigences de résistance et de durabilité des bordures et éléments de quai. Béton haute performance certifié.",
  },
];

export function ReglementationBlock() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="py-20 lg:py-28 bg-primary" ref={ref}>
      <Container>
        <div className={cn(
          "text-center mb-12 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
            <ShieldCheck size={28} className="text-accent" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            100% conforme. Sans compromis.
          </h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed">
            URBAQUAI est conçu pour satisfaire l'ensemble du cadre réglementaire
            français en matière d'accessibilité des transports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {NORMES.map((norme) => (
            <div key={norme.titre} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <BookOpen size={20} className="text-accent mb-3" />
              <h3 className="text-lg font-bold text-white">{norme.titre}</h3>
              <p className="mt-2 text-sm text-primary-100 leading-relaxed">{norme.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/reglementation" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-300 transition-colors">
            Explorer le cadre réglementaire <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
