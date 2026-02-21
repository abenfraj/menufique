import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq < 0) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const { PrismaClient } = await import("@prisma/client");
const { PrismaPg } = await import("@prisma/adapter-pg");
const { Pool } = await import("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const menus = await prisma.menu.findMany({
  where: { templateId: "ai-custom", aiDesignHtml: { not: null } },
  select: { id: true, name: true, aiDesignHtml: true, updatedAt: true },
  orderBy: { updatedAt: "desc" },
  take: 3,
});

mkdirSync("C:/tmp", { recursive: true });

for (const m of menus) {
  const html = m.aiDesignHtml || "";
  const platCount = (html.match(/[Pp]lats.{0,5}[Pp]rincipaux/g) || []).length;
  const boissonCount = (html.match(/[Bb]oissons?/g) || []).length;
  console.log("=== MENU:", m.name, "|", m.id, "| updated:", m.updatedAt);
  console.log("  Plats principaux occurrences:", platCount);
  console.log("  Boissons occurrences:", boissonCount);
  console.log("  HTML length:", html.length);
  const outPath = `C:/tmp/menu_${m.id}.html`;
  writeFileSync(outPath, html);
  console.log("  Saved to", outPath);
}

await prisma.$disconnect();
await pool.end();
