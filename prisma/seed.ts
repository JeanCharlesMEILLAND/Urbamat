import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Réalisations ──────────────────────────────────────────────
  const realisations = [
    {
      titre: "Uckange (57) — Quai provisoire ligne TER",
      ville: "Uckange",
      departement: "57 — Moselle",
      annee: 2024,
      typologieQuai: "Quai provisoire — avancée de trottoir",
      contexte:
        "Mise en accessibilité provisoire d'un arrêt de bus sur la ligne TER durant les travaux de rénovation de la gare d'Uckange. Le système modulaire URBAQUAI a permis une installation en 48h sans terrassement, avec remise en état du site à l'issue des travaux.",
      longueurMl: 19,
      nbStations: 1,
      slug: "uckange-57-quai-provisoire",
    },
    {
      titre: "Carquefou (44) — Mobilité autonome Nantes Métropole",
      ville: "Carquefou",
      departement: "44 — Loire-Atlantique",
      annee: 2024,
      typologieQuai: "6 stations — 9 ml à 16 ml",
      contexte:
        "Déploiement de 6 quais modulaires pour le service expérimental de navettes autonomes sur la commune de Carquefou, dans le cadre du projet de mobilité innovante de Nantes Métropole. Quais de longueurs variables (9 à 16 ml) adaptés aux différentes configurations de voirie.",
      longueurMl: 72,
      nbStations: 6,
      slug: "carquefou-44-mobilite-autonome",
    },
    {
      titre: "Strasbourg (67) — Ligne BHNS L2",
      ville: "Strasbourg",
      departement: "67 — Bas-Rhin",
      annee: 2023,
      typologieQuai: "Avancée de trottoir — quai définitif",
      contexte:
        "Installation de quais modulaires définitifs sur la ligne BHNS L2 de l'Eurométropole de Strasbourg. Solution retenue pour sa rapidité de pose et sa conformité aux exigences d'accessibilité PMR (norme CEREMA 2018). Hauteur de quai 180 mm avec rampe PMR intégrée.",
      longueurMl: 25,
      nbStations: 2,
      slug: "strasbourg-67-bhns-l2",
    },
    {
      titre: "Metz (57) — Mise en accessibilité arrêts Mettis",
      ville: "Metz",
      departement: "57 — Moselle",
      annee: 2023,
      typologieQuai: "Quai définitif — mise en accessibilité",
      contexte:
        "Remplacement de bordures classiques par des quais modulaires URBAQUAI sur 3 arrêts du réseau Mettis. Intervention réalisée de nuit pour limiter l'impact sur la circulation, avec remise en service dès le lendemain matin. Conformité loi accessibilité 2005 et Ad'AP.",
      longueurMl: 45,
      nbStations: 3,
      slug: "metz-57-accessibilite-mettis",
    },
    {
      titre: "Mulhouse (68) — Arrêts bus Soléa",
      ville: "Mulhouse",
      departement: "68 — Haut-Rhin",
      annee: 2024,
      typologieQuai: "Avancée de trottoir avec piste cyclable",
      contexte:
        "Aménagement de 2 arrêts de bus avec avancée de trottoir intégrant une piste cyclable sécurisée à l'arrière du quai. Configuration innovante permettant la cohabitation bus-vélo en toute sécurité, conformément au plan vélo de Mulhouse Alsace Agglomération.",
      longueurMl: 30,
      nbStations: 2,
      slug: "mulhouse-68-arrets-solea",
    },
    {
      titre: "Lupstein (67) — Showroom URBAMAT",
      ville: "Lupstein",
      departement: "67 — Bas-Rhin",
      annee: 2022,
      typologieQuai: "Quai de démonstration",
      contexte:
        "Quai de démonstration installé au siège d'URBAMAT Environnement à Lupstein. Configuration complète avec rampes PMR, modules centraux et jonctions, permettant aux maîtres d'ouvrage et bureaux d'études de visualiser le système grandeur nature.",
      longueurMl: 15,
      nbStations: 1,
      slug: "lupstein-67-showroom-urbamat",
    },
  ];

  for (const r of realisations) {
    await prisma.realisation.upsert({
      where: { slug: r.slug },
      update: r,
      create: r,
    });
    console.log(`✓ ${r.ville} (${r.slug})`);
  }

  // ─── Stats homepage ────────────────────────────────────────────
  const stats = [
    { label: "Mètres linéaires posés", valeur: "250+", ordre: 1 },
    { label: "Stations équipées", valeur: "15+", ordre: 2 },
    { label: "Villes en France", valeur: "8", ordre: 3 },
    { label: "Temps de pose moyen", valeur: "48h", ordre: 4 },
  ];

  for (const s of stats) {
    const existing = await prisma.stat.findFirst({ where: { label: s.label } });
    if (existing) {
      await prisma.stat.update({ where: { id: existing.id }, data: s });
    } else {
      await prisma.stat.create({ data: s });
    }
    console.log(`✓ Stat: ${s.label} = ${s.valeur}`);
  }

  // ─── Contenus de pages ──────────────────────────────────────────
  const pageContents = [
    // Home
    { page: "home", section: "hero_titre", contenu: "Le quai bus accessible. En 48h.", ordre: 1 },
    { page: "home", section: "hero_sous_titre", contenu: "Système breveté URBAMAT Environnement", ordre: 2 },
    { page: "home", section: "hero_description", contenu: "URBAQUAI est le système modulaire en béton haute performance pour la mise en accessibilité des arrêts de bus. Provisoire ou définitif, conforme à toutes les normes en vigueur.", ordre: 3 },
    { page: "home", section: "hero_cta", contenu: "Voir le système", ordre: 4 },
    { page: "home", section: "probleme_titre", contenu: "Le constat est clair", ordre: 5 },
    { page: "home", section: "probleme_texte", contenu: "Des milliers d'arrêts de bus en France ne sont toujours pas conformes à la loi accessibilité de 2005. Les solutions classiques en béton coulé nécessitent des semaines de travaux et des perturbations de trafic majeures.", ordre: 6 },
    { page: "home", section: "cta_titre", contenu: "Un projet d'accessibilité ?", ordre: 7 },
    { page: "home", section: "cta_description", contenu: "Contactez-nous pour recevoir une étude personnalisée et un chiffrage adapté à votre projet.", ordre: 8 },
    // Produit
    { page: "produit", section: "titre", contenu: "URBAQUAI — Quai bus modulaire", ordre: 1 },
    { page: "produit", section: "description", contenu: "Le système de quai bus modulaire en béton haute performance. Chaque module de 3 000 × 1 500 mm s'assemble pour créer un quai sur mesure, de 6 à 30 mètres.", ordre: 2 },
    { page: "produit", section: "avantages_titre", contenu: "Pourquoi choisir URBAQUAI ?", ordre: 3 },
    // URBATERRA
    { page: "urbaterra", section: "titre", contenu: "URBATERRA — Terrasse modulaire", ordre: 1 },
    { page: "urbaterra", section: "description", contenu: "Système de terrasse modulaire en béton haute performance pour espaces publics et privés.", ordre: 2 },
    // Contact
    { page: "contact", section: "titre", contenu: "Contactez-nous", ordre: 1 },
    { page: "contact", section: "description", contenu: "Une question, un projet ? Notre équipe vous répond sous 24h.", ordre: 2 },
    // Réglementation
    { page: "reglementation", section: "titre", contenu: "Réglementation accessibilité", ordre: 1 },
    { page: "reglementation", section: "introduction", contenu: "Tout savoir sur les obligations réglementaires en matière d'accessibilité des arrêts de transport en commun.", ordre: 2 },
  ];

  for (const pc of pageContents) {
    await prisma.pageContent.upsert({
      where: { page_section: { page: pc.page, section: pc.section } },
      update: { contenu: pc.contenu, ordre: pc.ordre },
      create: { ...pc, type: "texte" },
    });
    console.log(`✓ Page: ${pc.page} / ${pc.section}`);
  }

  console.log("\n✅ Seed terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
