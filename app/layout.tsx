import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — Quai bus modulaire accessible | ${SITE_CONFIG.company}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description:
    "URBAQUAI : système de quai bus modulaire en béton haute performance. Accessibilité PMR, pose en 48h, provisoire ou définitif. Conforme CEREMA 2018 et loi accessibilité 2005.",
  keywords: [
    "quai bus modulaire",
    "quai bus accessible",
    "accessibilité arrêt bus PMR",
    "quai provisoire bus",
    "bordure quai bus béton",
    "mise en accessibilité transport",
    "URBAQUAI",
    "URBAMAT",
  ],
  authors: [{ name: SITE_CONFIG.company }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_CONFIG.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
