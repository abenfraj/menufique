import { readFileSync } from "fs";
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

const MENU_ID = "cmlsg7sir0001mkfdfpdvrhj0";
const menu = await prisma.menu.findUnique({
  where: { id: MENU_ID },
  select: { aiDesignHtml: true },
});

if (!menu?.aiDesignHtml) {
  console.error("Menu not found or no HTML");
  process.exit(1);
}

let html = menu.aiDesignHtml;
console.log("Original HTML length:", html.length);

// ─── Fix 1: Remove duplicate "Plats Principaux" title ────────────────────────
// The first occurrence is in the left column ("Cuisinés avec passion").
// The second occurrence is in the right column ("Suite") — we just change it to
// show "— Suite —" as the title without repeating "Plats Principaux".
const TITLE_MARKER = '<h2 class="category-title">Plats Principaux</h2>';
const firstOcc = html.indexOf(TITLE_MARKER);
const secondOcc = html.indexOf(TITLE_MARKER, firstOcc + 1);

if (secondOcc === -1) {
  console.log("Fix 1: Only one occurrence found — nothing to change");
} else {
  // Find the subtitle that follows the second occurrence
  const SUBTITLE_SUITE = '<p class="category-subtitle">Suite</p>';
  const subtitleIdx = html.indexOf(SUBTITLE_SUITE, secondOcc);

  if (subtitleIdx !== -1 && subtitleIdx < secondOcc + 300) {
    const blockEnd = subtitleIdx + SUBTITLE_SUITE.length;
    html =
      html.slice(0, secondOcc) +
      '<p class="category-subtitle" style="font-size:10pt;font-style:normal;letter-spacing:3px;color:#D4A574;">— Suite —</p>' +
      html.slice(blockEnd);
    console.log("Fix 1 ✓  Replaced duplicate 'Plats Principaux' title with '— Suite —'");
  } else {
    console.log("Fix 1: Subtitle 'Suite' not found after second occurrence — skipping");
  }
}

// ─── Fix 2: Move Boissons out of the right column into a full-width row ───────
// Structure we're targeting in the right column:
//   [Desserts section]
//   </section>
//   \n        \n        <section class="category">   ← Boissons starts here
//   ...4 dishes...
//   </section>                                        ← Boissons ends here
//   \n      </div>                                    ← right column closes
//   \n    </div>                                      ← main-content closes
//
// We move Boissons to after main-content closes, as a full-width compact row.

const BOISSONS_H2 = '<h2 class="category-title">Boissons</h2>';
const boissonsH2Pos = html.indexOf(BOISSONS_H2);

if (boissonsH2Pos === -1) {
  console.log("Fix 2: Boissons not found — skipping");
} else {
  // ── Find the start of the Boissons <section> (8-space indent)
  const BOISSONS_SECTION_OPEN = '        <section class="category">';
  const boissonsSecStart = html.lastIndexOf(BOISSONS_SECTION_OPEN, boissonsH2Pos);

  // ── Find "        </section>\n      </div>\n    </div>" after Boissons h2
  const CLOSE_SEQUENCE = '        </section>\n      </div>\n    </div>';
  const closeSeqPos = html.indexOf(CLOSE_SEQUENCE, boissonsH2Pos);

  if (boissonsSecStart === -1 || closeSeqPos === -1) {
    console.log("Fix 2: Could not find Boissons section boundaries — skipping");
  } else {
    const boissonsCloseEnd = closeSeqPos + '        </section>'.length;

    // Extract the Boissons section HTML (indented at 8 spaces)
    const boissonsBlock = html.slice(boissonsSecStart, boissonsCloseEnd);

    // Rebuild it at 4-space indent for the full-width row
    const boissonsFullWidth = boissonsBlock
      .split("\n")
      .map((line) => {
        // Remove the extra 4 spaces of column indentation
        if (line.startsWith("        ")) return "    " + line.slice(8);
        if (line.startsWith("          ")) return "    " + line.slice(10);
        if (line.startsWith("            ")) return "    " + line.slice(12);
        return line;
      })
      .join("\n");

    // The Boissons items as a 2-column inline grid for compactness
    // We'll keep the section structure but make dishes 2-col
    const boissonsRebuilt = `    <section class="category" style="margin-top:2.5mm;">
      <div class="category-header">
        <h2 class="category-title">Boissons</h2>
        <p class="category-subtitle">Sélection de la maison</p>
      </div>
      <div style="height:1px;background:linear-gradient(to right,transparent,rgba(212,165,116,0.5) 20%,rgba(212,165,116,0.5) 80%,transparent);margin:2mm 0;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1mm 8mm;">
        <div class="dish">
          <div class="dish-header">
            <span class="dish-name">Eau minérale</span>
            <span class="dish-dots"></span>
            <span class="dish-price">4,50 €</span>
          </div>
          <p class="dish-description">Plate ou gazeuse — 75cl</p>
        </div>
        <div class="dish">
          <div class="dish-header">
            <span class="dish-name">Verre de vin rouge</span>
            <span class="dish-dots"></span>
            <span class="dish-price">7,00 €</span>
          </div>
          <p class="dish-description">Sélection du sommelier — 15cl</p>
        </div>
        <div class="dish">
          <div class="dish-header">
            <span class="dish-name">Verre de vin blanc</span>
            <span class="dish-dots"></span>
            <span class="dish-price">7,00 €</span>
          </div>
          <p class="dish-description">Sélection du sommelier — 15cl</p>
        </div>
        <div class="dish">
          <div class="dish-header">
            <span class="dish-name">Café gourmand</span>
            <span class="dish-dots"></span>
            <span class="dish-price">6,50 €</span>
          </div>
          <p class="dish-description">Expresso, mignardises maison</p>
        </div>
      </div>
    </section>`;

    // ── Also remove the leading blank line before the Boissons section
    const beforeBoissons = html.slice(0, boissonsSecStart);
    const trailingNewlines = beforeBoissons.match(/(\n[ \t]*)$/)?.[0] ?? "";
    const cleanStart = boissonsSecStart - trailingNewlines.length;

    // Build new HTML:
    // [before Boissons start (trim trailing)] + [right-col close + main-content close]
    // + \n\n + [Boissons full-width] + [rest: \n\n    <footer...]
    html =
      html.slice(0, cleanStart) +           // content before Boissons section
      "\n      </div>\n    </div>" +        // close right column + main-content
      "\n\n" + boissonsRebuilt + "\n" +     // Boissons full-width
      html.slice(closeSeqPos + CLOSE_SEQUENCE.length); // rest (footer etc.)

    console.log("Fix 2 ✓  Moved Boissons to full-width row below main-content");
  }
}

// ─── Save to database ─────────────────────────────────────────────────────────
console.log("New HTML length:", html.length);
await prisma.menu.update({
  where: { id: MENU_ID },
  data: { aiDesignHtml: html },
});
console.log("Saved to DB ✓");

await prisma.$disconnect();
await pool.end();
