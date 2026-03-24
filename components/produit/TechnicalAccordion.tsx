"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  titre: string;
  contenu: React.ReactNode;
}

interface TechnicalAccordionProps {
  items: AccordionItem[];
}

export function TechnicalAccordion({ items }: TechnicalAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.titre} className="bg-white">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-neutral-dark">{item.titre}</span>
              <ChevronDown
                size={20}
                className={cn(
                  "text-gray-400 transition-transform duration-200 shrink-0 ml-4",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed">
                {item.contenu}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
