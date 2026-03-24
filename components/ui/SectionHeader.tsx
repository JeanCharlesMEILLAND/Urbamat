import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  titre: string;
  sousTitre?: string;
  className?: string;
  align?: "left" | "center";
}

function SectionHeader({
  titre,
  sousTitre,
  className,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
        {titre}
      </h2>
      {sousTitre && (
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {sousTitre}
        </p>
      )}
    </div>
  );
}

export { SectionHeader };
export type { SectionHeaderProps };
