import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout wraps ALL routes (including /admin).
  // The [locale]/layout.tsx handles <html>, <body>, fonts, Header/Footer for public pages.
  // The admin layout handles its own chrome.
  return children;
}
