import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="py-32 lg:py-40">
      <Container>
        <div className="text-center max-w-lg mx-auto">
          <div className="text-7xl font-mono font-bold text-primary/20 mb-6">404</div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">
            Page introuvable
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/">Retour à l'accueil</Button>
            <Button href="/contact" variant="outline">
              Nous contacter
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
