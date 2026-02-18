import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const USER_ID = "cmlse2ei50001fsfdpwvjwcxr";

async function main() {
  console.log("🌱 Seeding data for user:", USER_ID);

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: USER_ID } });
  if (!user) {
    console.error("❌ User not found in DB:", USER_ID);
    console.log("   Users in DB:");
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    allUsers.forEach((u) => console.log("  -", u.id, u.email, u.name));
    return;
  }
  console.log("✅ User found:", user.email);

  // 1. Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { userId: USER_ID },
    update: {},
    create: {
      userId: USER_ID,
      name: "Le Comptoir des Saveurs",
      address: "12 rue de la Paix, 75001 Paris",
      phone: "01 42 36 58 10",
      email: "contact@lecomptoirdessaveurs.fr",
      website: "https://lecomptoirdessaveurs.fr",
      openingHours: {
        lundi: "12h–14h30, 19h–22h30",
        mardi: "12h–14h30, 19h–22h30",
        mercredi: "12h–14h30, 19h–22h30",
        jeudi: "12h–14h30, 19h–22h30",
        vendredi: "12h–14h30, 19h–23h",
        samedi: "19h–23h",
        dimanche: "Fermé",
      },
    },
  });
  console.log("✅ Restaurant:", restaurant.name);

  // 2. Menu
  const menu = await prisma.menu.create({
    data: {
      userId: USER_ID,
      restaurantId: restaurant.id,
      name: "Menu de la Maison",
      slug: `le-comptoir-des-saveurs-${Date.now()}`,
      templateId: "classic",
      isPublished: true,
      customColors: {
        primary: "#FF6B35",
        background: "#FFF8F2",
        text: "#1A1A2E",
      },
    },
  });
  console.log("✅ Menu:", menu.name, "(slug:", menu.slug + ")");

  // 3. Catégories + plats
  const categories = [
    {
      name: "Entrées",
      description: "Pour bien commencer",
      sortOrder: 0,
      dishes: [
        {
          name: "Tartare de saumon",
          description: "Saumon frais, avocat, citron vert, sésame grillé",
          price: 14.5,
          allergens: ["poissons", "sesame"],
          sortOrder: 0,
        },
        {
          name: "Velouté de potimarron",
          description: "Crème fraîche, noisettes torréfiées, huile de truffe",
          price: 9.0,
          allergens: ["lait", "fruits-a-coque"],
          sortOrder: 1,
        },
        {
          name: "Foie gras maison",
          description: "Toast brioche, chutney de figues, fleur de sel",
          price: 18.0,
          allergens: ["gluten", "oeufs", "lait"],
          sortOrder: 2,
        },
        {
          name: "Salade de chèvre chaud",
          description: "Mesclun, tomates cerises, noix, miel d'acacia",
          price: 11.5,
          allergens: ["lait", "fruits-a-coque"],
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Plats principaux",
      description: "Cuisinés avec passion",
      sortOrder: 1,
      dishes: [
        {
          name: "Filet de bœuf Rossini",
          description: "Tournedos, escalope de foie gras poêlée, sauce Périgueux",
          price: 34.0,
          allergens: ["gluten"],
          sortOrder: 0,
        },
        {
          name: "Dos de cabillaud",
          description: "Écrasé de pommes de terre, beurre blanc aux herbes, légumes de saison",
          price: 26.0,
          allergens: ["poissons", "lait"],
          sortOrder: 1,
        },
        {
          name: "Magret de canard",
          description: "Jus réduit au miel, gratin dauphinois, haricots verts",
          price: 28.5,
          allergens: ["lait"],
          sortOrder: 2,
        },
        {
          name: "Risotto aux cèpes",
          description: "Riz carnaroli, parmesan 24 mois, huile de truffe blanche",
          price: 22.0,
          allergens: ["lait"],
          sortOrder: 3,
        },
        {
          name: "Suprême de volaille fermière",
          description: "Jus corsé, gratin de macaronis, champignons de Paris",
          price: 24.0,
          allergens: ["gluten", "lait"],
          sortOrder: 4,
        },
      ],
    },
    {
      name: "Desserts",
      description: "Une touche sucrée pour finir",
      sortOrder: 2,
      dishes: [
        {
          name: "Fondant au chocolat",
          description: "Cœur coulant Valrhona, glace vanille Bourbon, éclats de pralin",
          price: 10.0,
          allergens: ["gluten", "oeufs", "lait", "fruits-a-coque"],
          sortOrder: 0,
        },
        {
          name: "Crème brûlée à la vanille",
          description: "Vanille de Madagascar, cassonade caramélisée à la minute",
          price: 8.5,
          allergens: ["oeufs", "lait"],
          sortOrder: 1,
        },
        {
          name: "Tarte Tatin",
          description: "Pommes caramélisées, feuilletage beurré, crème fraîche épaisse",
          price: 9.0,
          allergens: ["gluten", "lait", "oeufs"],
          sortOrder: 2,
        },
        {
          name: "Île flottante",
          description: "Œufs en neige, crème anglaise, caramel et amandes effilées",
          price: 7.5,
          allergens: ["oeufs", "lait", "fruits-a-coque"],
          sortOrder: 3,
        },
      ],
    },
    {
      name: "Boissons",
      description: "Sélection de la maison",
      sortOrder: 3,
      dishes: [
        {
          name: "Eau minérale",
          description: "Plate ou gazeuse — 75cl",
          price: 4.5,
          allergens: [],
          sortOrder: 0,
        },
        {
          name: "Verre de vin rouge",
          description: "Sélection du sommelier — 15cl",
          price: 7.0,
          allergens: ["sulfites"],
          sortOrder: 1,
        },
        {
          name: "Verre de vin blanc",
          description: "Sélection du sommelier — 15cl",
          price: 7.0,
          allergens: ["sulfites"],
          sortOrder: 2,
        },
        {
          name: "Café gourmand",
          description: "Expresso, mignardises maison",
          price: 6.5,
          allergens: ["lait", "gluten", "oeufs"],
          sortOrder: 3,
        },
      ],
    },
  ];

  for (const catData of categories) {
    const { dishes, ...catFields } = catData;
    const category = await prisma.category.create({
      data: {
        menuId: menu.id,
        ...catFields,
        dishes: {
          create: dishes.map((d) => ({
            ...d,
            price: d.price,
            isAvailable: true,
          })),
        },
      },
    });
    console.log(`  📂 ${category.name} (${dishes.length} plats)`);
  }

  console.log("\n🎉 Données créées avec succès !");
  console.log(`   👉 Menu public : ${process.env.NEXT_PUBLIC_APP_URL}/m/${menu.slug}`);
  console.log(`   👉 Dashboard  : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
