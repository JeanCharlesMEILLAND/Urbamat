import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const STEP_KEYS = ["step1", "step2", "step3", "step4"] as const;
const STEP_NUMS = ["01", "02", "03", "04"];

export async function InstallationSteps() {
  const t = await getTranslations("installation");

  return (
    <div className="space-y-0">
      {STEP_KEYS.map((key, index) => (
        <div
          key={key}
          className={cn(
            "flex gap-6 py-8",
            index < STEP_KEYS.length - 1 && "border-b border-gray-100"
          )}
        >
          {/* Numéro */}
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-mono text-lg font-bold text-primary">{STEP_NUMS[index]}</span>
            </div>
          </div>

          {/* Contenu */}
          <div>
            <h3 className="text-lg font-bold text-neutral-dark">{t(`${key}.titre`)}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t(`${key}.description`)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
