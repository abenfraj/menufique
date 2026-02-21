import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

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

const m = await prisma.menu.findUnique({
  where: { id: "cmlsg7sir0001mkfdfpdvrhj0" },
  select: { aiDesignHtml: true },
});

const html = m?.aiDesignHtml || "";

const platCount = (html.match(/Plats Principaux/g) || []).length;
const suiteMark = (html.match(/— Suite —/g) || []).length;

// Boissons should NOT appear inside a .column div
const colMatch = html.match(/<div class="column">([\s\S]*?)<\/div>\s*<\/div>/g) || [];
const boissonsInCol = colMatch.some((c) => c.includes("Boissons"));

// Boissons should appear after </div> that closes main-content
const afterMainContent = html.split('</div>\n\n    <section class="category"')[1] || "";
const boissonsAfter = afterMainContent.includes("Boissons");

console.log("Plats Principaux occurrences:", platCount);
console.log("'— Suite —' marker:", suiteMark, "(should be 1)");
console.log("Boissons inside .column:", boissonsInCol, "(should be false)");
console.log("Boissons in full-width section:", boissonsAfter, "(should be true)");

// Save updated HTML to file for manual inspection
writeFileSync("C:/tmp/menu_fixed.html", html);
console.log("\nSaved fixed HTML to C:/tmp/menu_fixed.html");

// Quick sanity check on the surrounding area
const boissonsIdx = html.indexOf('<h2 class="category-title">Boissons</h2>');
console.log("\n--- Context around Boissons (50 chars before/after) ---");
console.log(html.slice(boissonsIdx - 200, boissonsIdx + 100));

await prisma.$disconnect();
await pool.end();
