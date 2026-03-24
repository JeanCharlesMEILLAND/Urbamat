"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PROFIL_LABELS } from "@/lib/constants";
import type { Lead } from "@/lib/types";

interface ExportCsvButtonProps {
  leads: Lead[];
}

export function ExportCsvButton({ leads }: ExportCsvButtonProps) {
  function handleExport() {
    const headers = ["Prénom", "Nom", "Société", "Email", "Profil", "Département", "Message", "Date"];
    const rows = leads.map((l) => [
      l.prenom,
      l.nom,
      l.societe,
      l.email,
      PROFIL_LABELS[l.profil] ?? l.profil,
      l.departement,
      (l.message ?? "").replace(/"/g, '""'),
      new Date(l.createdAt).toLocaleDateString("fr-FR"),
    ]);

    const csv = [
      headers.join(";"),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(";")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-urbaquai-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download size={16} className="mr-2" />
      Export CSV
    </Button>
  );
}
