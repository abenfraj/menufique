import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

/**
 * GET /api/menus/[id]/preview — Returns the AI design HTML directly (no Puppeteer).
 * Used by the editor iframe for instant preview.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { id: menuId } = await params;

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id },
      include: {
        restaurant: true,
        categories: {
          include: { dishes: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!menu) {
      return new NextResponse("Menu introuvable", { status: 404 });
    }

    // If we have AI-generated HTML, serve it directly
    if (menu.templateId === "ai-custom" && menu.aiDesignHtml) {
      return new NextResponse(menu.aiDesignHtml, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Otherwise, build a simple preview HTML
    const html = buildSimplePreviewHtml(menu);
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildSimplePreviewHtml(menu: {
  name: string;
  restaurant: { name: string; address: string | null; phone: string | null };
  categories: {
    name: string;
    description: string | null;
    dishes: {
      name: string;
      description: string | null;
      price: unknown;
      allergens: string[];
      isAvailable: boolean;
    }[];
  }[];
}): string {
  const cats = menu.categories
    .map(
      (cat) => `
      <div style="margin-bottom:24px;">
        <h3 style="font-family:'Playfair Display',serif;font-size:15pt;color:#FF6B35;text-align:center;margin-bottom:12px;text-transform:uppercase;letter-spacing:2px;">${escapeHtml(cat.name)}</h3>
        ${cat.description ? `<p style="text-align:center;font-style:italic;opacity:0.5;font-size:10pt;margin-bottom:10px;">${escapeHtml(cat.description)}</p>` : ""}
        ${cat.dishes
          .filter((d) => d.isAvailable)
          .map(
            (d) => `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
            <span style="font-weight:600;font-size:11pt;">${escapeHtml(d.name)}</span>
            <span style="font-weight:700;color:#FF6B35;">${formatPrice(Number(d.price))}</span>
          </div>
          ${d.description ? `<p style="font-size:9pt;opacity:0.5;margin-top:-4px;margin-bottom:8px;">${escapeHtml(d.description)}</p>` : ""}
        `
          )
          .join("")}
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #1A1A2E; background: #FFF8F2; }
    .menu-page { width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="menu-page">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="font-family:'Playfair Display',serif;font-size:24pt;color:#FF6B35;">${escapeHtml(menu.restaurant.name)}</h1>
      ${menu.restaurant.address ? `<p style="font-size:9pt;opacity:0.5;margin-top:6px;">${escapeHtml(menu.restaurant.address)}</p>` : ""}
      ${menu.restaurant.phone ? `<p style="font-size:9pt;opacity:0.5;margin-top:2px;">${escapeHtml(menu.restaurant.phone)}</p>` : ""}
    </div>
    ${cats}
  </div>
</body>
</html>`;
}
