import { Link } from "@/i18n/navigation";
import { MapPin, Calendar, ArrowRight, Ruler } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Realisation } from "@/lib/types";

interface RealisationCardProps {
  realisation: Realisation;
}

export function RealisationCard({ realisation }: RealisationCardProps) {
  return (
    <Link href={`/realisations/${realisation.slug}`}>
      <Card variant="realisation" className="h-full group cursor-pointer">
        {/* Header visuel */}
        <div className="h-40 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center overflow-hidden">
          <div className="text-center px-4">
            <span className="text-3xl font-bold text-primary/20">{realisation.ville}</span>
          </div>
        </div>

        <div className="p-6">
          <Badge variant="info" className="mb-3">
            {realisation.typologieQuai}
          </Badge>

          <h3 className="text-lg font-bold text-neutral-dark group-hover:text-primary transition-colors">
            {realisation.titre}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {realisation.ville} ({realisation.departement})
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {realisation.annee}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-2">
            {realisation.contexte}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Ruler size={12} />
              {realisation.longueurMl} ml
            </span>
            <span>{realisation.nbStations} station{realisation.nbStations > 1 ? "s" : ""}</span>
          </div>

          <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            Voir le projet <ArrowRight size={14} />
          </span>
        </div>
      </Card>
    </Link>
  );
}
