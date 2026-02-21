import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateMenuDesign,
  AIDesignOptions,
} from "@/lib/ai";
import { formatPrice } from "@/lib/utils";
import { TemplateData } from "@/templates/types";

/**
 * POST /api/ai/generate-variant
 * Generates an alternative design for an existing AI menu without saving it to DB.
 * The caller receives the HTML and decides whether to keep it.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { menuId } = body as { menuId?: string };

    if (!menuId || typeof menuId !== "string") {
      return NextResponse.json({ error: "ID du menu requis" }, { status: 400 });
    }

    // Fetch menu with ownership check
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        user: { select: { plan: true } },
        restaurant: true,
        categories: {
          include: { dishes: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    if (menu.userId !== (session.user.id as string)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (menu.user.plan !== "PRO") {
      return NextResponse.json(
        { error: "Cette fonctionnalité nécessite un abonnement Pro" },
        { status: 403 }
      );
    }

    if (menu.templateId !== "ai-custom" || !menu.aiDesignHtml) {
      return NextResponse.json(
        { error: "Générez d'abord un design IA avant de créer une variante" },
        { status: 400 }
      );
    }

    const totalDishes = menu.categories.reduce(
      (sum, cat) => sum + cat.dishes.length,
      0
    );
    if (totalDishes === 0) {
      return NextResponse.json(
        { error: "Ajoutez au moins un plat avant de générer une variante" },
        { status: 400 }
      );
    }

    const customColors = (menu.customColors as Record<string, string>) ?? {};
    const customFonts = (menu.customFonts as Record<string, string>) ?? {};

    const templateData: TemplateData = {
      restaurant: {
        name: menu.restaurant.name,
        address: menu.restaurant.address ?? undefined,
        phone: menu.restaurant.phone ?? undefined,
        email: menu.restaurant.email ?? undefined,
        website: menu.restaurant.website ?? undefined,
        logoUrl: menu.restaurant.logoUrl ?? undefined,
      },
      menu: {
        name: menu.name,
        categories: menu.categories.map((cat) => ({
          name: cat.name,
          description: cat.description ?? undefined,
          dishes: cat.dishes.map((dish) => ({
            name: dish.name,
            description: dish.description ?? undefined,
            price: formatPrice(Number(dish.price)),
            allergens: dish.allergens,
            isAvailable: dish.isAvailable,
            imageUrl: dish.imageUrl ?? undefined,
          })),
        })),
      },
      customization: {
        primaryColor: customColors.primary ?? "#FF6B35",
        backgroundColor: customColors.background ?? "#FFF8F2",
        textColor: customColors.text ?? "#1A1A2E",
        headingFont: customFonts.heading ?? "Playfair Display",
        bodyFont: customFonts.body ?? "Inter",
      },
      branding: { showWatermark: false },
    };

    // Use the same options as the current design but:
    // 1. Skip cover page to keep it fast
    // 2. Add a variation seed so Claude produces a different layout
    const variationSeeds = [
      "Exploration variante : essaie une mise en page totalement différente, une autre typographie, et un agencement alternatif des sections.",
      "Variation créative : utilise une hiérarchie visuelle différente, change l'organisation des colonnes et expérimente avec les espaces blancs.",
      "Alternative design : teste une composition asymétrique avec une palette chromatique légèrement différente tout en gardant le même contenu.",
    ];
    const seed = variationSeeds[Math.floor(Math.random() * variationSeeds.length)];

    const options: AIDesignOptions = {
      style: "auto",
      imageMode: "none",
      colorPreference: "auto",
      complexity: "detailed",
      includeCoverPage: false,
      imageGranularity: "category",
      menuPageCount: 1,
      customInstructions: seed,
    };

    const designResult = await generateMenuDesign(
      templateData,
      options,
      undefined,
      undefined,
      menu.restaurant.logoUrl ?? undefined
    );

    // Return HTML only — caller decides whether to save it
    return NextResponse.json({ data: { html: designResult.html } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
