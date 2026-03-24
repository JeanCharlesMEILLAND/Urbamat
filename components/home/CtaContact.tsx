"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CtaContact() {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: data.get("prenom"),
          nom: data.get("nom"),
          societe: data.get("societe"),
          email: data.get("email"),
          profil: "autre",
          departement: "",
          message: data.get("message"),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch {
      // silently fail — form will remain visible
    }
  }

  return (
    <section className="py-20 lg:py-28 bg-neutral-light">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
            Un projet d'accessibilité ?
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Parlez-nous de votre besoin. Notre équipe vous répond sous 24h avec
            une proposition technique adaptée.
          </p>

          {submitted ? (
            <div className="mt-10 p-8 bg-success/10 rounded-lg border border-success/20">
              <p className="text-lg font-semibold text-success">
                Merci pour votre message !
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Notre équipe vous recontactera dans les plus brefs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cta-prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    id="cta-prenom"
                    name="prenom"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label htmlFor="cta-nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    id="cta-nom"
                    name="nom"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cta-societe" className="block text-sm font-medium text-gray-700 mb-1">
                    Société
                  </label>
                  <input
                    id="cta-societe"
                    name="societe"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="Bureau d'études XYZ"
                  />
                </div>
                <div>
                  <label htmlFor="cta-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email professionnel
                  </label>
                  <input
                    id="cta-email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="j.dupont@exemple.fr"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cta-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Votre besoin en quelques mots
                </label>
                <textarea
                  id="cta-message"
                  name="message"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-y"
                  placeholder="Nombre d'arrêts, configuration souhaitée, délais..."
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <Send size={16} className="mr-2" />
                  Envoyer ma demande
                </Button>
              </div>

              <p className="text-xs text-gray-400 pt-1">
                Vos données sont traitées uniquement pour répondre à votre demande.
                Consultez notre{" "}
                <a href="/confidentialite" className="underline hover:text-gray-600">
                  politique de confidentialité
                </a>.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
