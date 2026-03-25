import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/constants";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const meta = messages.metadata;

  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
      default: meta.defaultTitle
        .replace("{name}", SITE_CONFIG.name)
        .replace("{company}", SITE_CONFIG.company),
      template: `%s | ${SITE_CONFIG.name}`,
    },
    description: meta.defaultDescription,
    keywords: [
      "quai bus modulaire",
      "modular bus platform",
      "Bushaltestelle modular",
      "accessible bus stop",
      "URBAQUAI",
      "URBAMAT",
    ],
    authors: [{ name: SITE_CONFIG.company }],
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : locale === "de" ? "de_DE" : "en_GB",
      siteName: SITE_CONFIG.name,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        fr: "/",
        en: "/en",
        de: "/de",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
