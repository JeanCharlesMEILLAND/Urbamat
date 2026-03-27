"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  BarChart3,
  PanelTop,
  Image,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/realisations", label: "Réalisations", icon: MapPin },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
  { href: "/admin/pages", label: "Pages", icon: PanelTop },
  { href: "/admin/medias", label: "Médias", icon: Image },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-neutral-dark min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <Link href="/admin" className="flex items-center">
          <span className="text-xl font-bold text-white">URBA</span>
          <span className="text-xl font-bold text-accent">QUAI</span>
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">Administration</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-700 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
        >
          Voir le site &rarr;
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-gray-400 hover:text-red-400 hover:bg-gray-700/50 transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
