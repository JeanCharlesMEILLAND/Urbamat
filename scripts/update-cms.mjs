import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const updates = [
  { page: 'home', section: 'hero_titre', locale: 'fr', contenu: "Garantir l'accessibilité aux bus et aux cars." },
  { page: 'home', section: 'hero_cta', locale: 'fr', contenu: 'Demander un devis' },
  { page: 'home', section: 'hero_titre', locale: 'en', contenu: 'Make every bus and coach stop accessible.' },
  { page: 'home', section: 'hero_cta', locale: 'en', contenu: 'Request a quote' },
  { page: 'home', section: 'hero_titre', locale: 'de', contenu: 'Barrierefreier Zugang zu Bus und Reisebus.' },
  { page: 'home', section: 'hero_cta', locale: 'de', contenu: 'Angebot anfordern' },
];

for (const u of updates) {
  const existing = await p.pageContent.findFirst({
    where: { page: u.page, section: u.section, locale: u.locale },
  });
  if (existing) {
    await p.pageContent.update({ where: { id: existing.id }, data: { contenu: u.contenu } });
    console.log(`updated: ${u.section} (${u.locale})`);
  } else {
    console.log(`skipped (no row): ${u.section} (${u.locale})`);
  }
}

await p.$disconnect();
