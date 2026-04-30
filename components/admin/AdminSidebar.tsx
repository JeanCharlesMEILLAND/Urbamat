"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  BarChart3,
  PanelTop,
  Image as ImageIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Pages", icon: PanelTop },
  { href: "/admin/realisations", label: "Réalisations", icon: MapPin },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/medias", label: "Médias", icon: ImageIcon },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
];

const STORAGE_KEY = "urbaquai_admin_sidebar_collapsed";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Restaure l'état "réduit" depuis localStorage au montage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "bg-neutral-dark flex flex-col shrink-0 sticky top-0 h-screen transition-[width] duration-200 ease-out z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo + bouton réduire */}
      <div
        className={cn(
          "border-b border-gray-700 flex items-center",
          collapsed ? "px-2 py-4 justify-center" : "px-6 py-5 justify-between"
        )}
      >
        {!collapsed && (
          <Link href="/admin" className="flex flex-col" aria-label="Admin URBAQUAI">
            <span className="text-xl font-bold leading-none">
              <span className="text-white">URBA</span>
              <span className="text-accent">QUAI</span>
            </span>
            <p className="text-xs text-gray-500 mt-0.5">Administration</p>
          </Link>
        )}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Déplier la sidebar" : "Réduire la sidebar"}
          title={collapsed ? "Déplier" : "Réduire"}
          className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded p-1.5 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-4 space-y-1 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded text-sm font-medium transition-colors",
                collapsed
                  ? "justify-center px-2 py-2.5"
                  : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("py-4 border-t border-gray-700 space-y-1", collapsed ? "px-2" : "px-3")}>
        <Link
          href="/"
          title={collapsed ? "Voir le site" : undefined}
          className={cn(
            "flex items-center rounded text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          {collapsed ? "↗" : "Voir le site →"}
        </Link>
        <button
          onClick={handleLogout}
          title={collapsed ? "Déconnexion" : undefined}
          className={cn(
            "w-full flex items-center rounded text-sm text-gray-400 hover:text-red-400 hover:bg-gray-700/50 transition-colors",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}
