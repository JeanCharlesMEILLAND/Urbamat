import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="py-32 lg:py-40">
      <Container>
        <div className="text-center max-w-lg mx-auto">
          <div className="text-7xl font-mono font-bold text-primary/20 mb-6">404</div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">
            {t("titre")}
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/">{t("retour")}</Button>
            <Button href="/contact" variant="outline">
              {t("contact")}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
