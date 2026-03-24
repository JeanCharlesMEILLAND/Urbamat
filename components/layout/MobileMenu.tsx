"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
        >
          <nav className="px-4 py-4 space-y-1" aria-label="Menu mobile">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 rounded text-base font-medium transition-colors",
                    isActive
                      ? "text-primary bg-primary-50"
                      : "text-neutral-dark hover:text-primary hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 px-4">
              <Button href="/contact" className="w-full" onClick={onClose}>
                Demander un devis
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
