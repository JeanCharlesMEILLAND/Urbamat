"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-20" aria-label="Navigation principale">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="URBAQUAI - Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-urbaquai.png"
              alt="URBAQUAI®"
              className="h-8 lg:h-10 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded transition-colors",
                      isActive
                        ? "text-primary bg-primary-50"
                        : "text-neutral-dark hover:text-primary hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* CTA desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Button href="/contact" size="sm">
              Demander un devis
            </Button>
          </div>

          {/* Burger mobile */}
          <button
            className="lg:hidden p-2 text-neutral-dark hover:text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </header>
  );
}
