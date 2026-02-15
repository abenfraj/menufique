import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateMenuDesign,
  generateCoverImage,
  buildDesignPrompt,
  AIDesignOptions,
  ImageMode,
  GeneratedImage,
} from "@/lib/ai";
import { formatPrice } from "@/lib/utils";
import { TemplateData } from "@/templates/types";

const VALID_STYLES = ["elegant", "modern", "rustic", "minimal", "colorful", "auto"] as const;
const VALID_COLORS = ["warm", "cool", "dark", "pastel", "auto"] as const;
const VALID_COMPLEXITIES = ["simple", "detailed", "luxe"] as const;
const VALID_IMAGE_MODES = ["none", "emojis", "ai-photos"] as const;
const VALID_GRANULARITIES = ["category", "dish"] as const; // kept for backward compat

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { menuId, options: rawOptions } = body;

    if (!menuId || typeof menuId !== "string") {
      return NextResponse.json(
        { error: "ID du menu requis" },
        { status: 400 }
      );
    }

    // Parse and validate options
    const imageMode: ImageMode = VALID_IMAGE_MODES.includes(rawOptions?.imageMode)
      ? rawOptions.imageMode
      : "none";

    const rawPageCount = parseInt(rawOptions?.menuPageCount, 10);
    const menuPageCount = Number.isFinite(rawPageCount)
      ? Math.max(1, Math.min(4, rawPageCount))
      : 1;

    const options: AIDesignOptions = {
      style: VALID_STYLES.includes(rawOptions?.style) ? rawOptions.style : "auto",
      imageMode,
      colorPreference: VALID_COLORS.includes(rawOptions?.colorPreference)
        ? rawOptions.colorPreference
        : "auto",
      complexity: VALID_COMPLEXITIES.includes(rawOptions?.complexity)
        ? rawOptions.complexity
        : "detailed",
      includeCoverPage: rawOptions?.includeCoverPage === true,
      imageGranularity: VALID_GRANULARITIES.includes(rawOptions?.imageGranularity)
        ? rawOptions.imageGranularity
        : "category",
      menuPageCount,
      customInstructions:
        typeof rawOptions?.customInstructions === "string"
          ? rawOptions.customInstructions.slice(0, 500)
          : undefined,
    };

    // 2. Fetch menu with ownership check
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
      return NextResponse.json(
        { error: "Menu introuvable" },
        { status: 404 }
      );
    }

    if (menu.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // 3. Pro plan check
    if (menu.user.plan !== "PRO") {
      return NextResponse.json(
        { error: "Cette fonctionnalité nécessite un abonnement Pro" },
        { status: 403 }
      );
    }

    // 4. Check menu has content
    const totalDishes = menu.categories.reduce(
      (sum, cat) => sum + cat.dishes.length,
      0
    );
    if (totalDishes === 0) {
      return NextResponse.json(
        { error: "Ajoutez au moins un plat avant de générer un design IA" },
        { status: 400 }
      );
    }

    // 5. Build template data
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
      branding: {
        showWatermark: false,
      },
    };

    // 6. Collect existing dish images (from Unsplash or user uploads)
    let generatedImages: GeneratedImage[] = [];
    let coverImageDataUri: string | null = null;

    // Gather all dishes that already have images
    for (const cat of menu.categories) {
      for (const dish of cat.dishes) {
        if (dish.imageUrl) {
          generatedImages.push({
            name: dish.name,
            dataUri: dish.imageUrl,
          });
        }
      }
    }

    // If dishes have images, force imageMode to ai-photos so prompt includes them
    if (generatedImages.length > 0 && imageMode === "none") {
      options.imageMode = "ai-photos";
    }

    // Generate cover image if requested
    if (options.includeCoverPage) {
      // Detect cuisine style (we'll use a placeholder, the AI will refine)
      coverImageDataUri = await generateCoverImage(
        menu.restaurant.name,
        "gastronomique français"
      );
    }

    // 7. Generate design with images
    const designPrompt = buildDesignPrompt(
      templateData,
      options,
      generatedImages.length > 0 ? generatedImages : undefined,
      coverImageDataUri ?? undefined
    );
    const designResult = await generateMenuDesign(
      templateData,
      options,
      generatedImages.length > 0 ? generatedImages : undefined,
      coverImageDataUri ?? undefined
    );

    // 8. Save to database
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        templateId: "ai-custom",
        aiDesignHtml: designResult.html,
        aiBackgroundUrl: null,
        designPrompt,
        customColors: {
          primary: designResult.colors.primary,
          background: designResult.colors.background,
          text: designResult.colors.text,
          accent: designResult.colors.accent,
        },
        customFonts: {
          heading: designResult.fonts.heading,
          body: designResult.fonts.body,
        },
      },
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: {
            dishes: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    return NextResponse.json({
      data: updatedMenu,
      design: {
        html: designResult.html,
        colors: designResult.colors,
        fonts: designResult.fonts,
        backgroundUrl: null,
      },
    });
  } catch (error) {
    console.error("Erreur génération design IA:", error);
    const message =
      error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
