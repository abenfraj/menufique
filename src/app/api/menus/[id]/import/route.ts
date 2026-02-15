import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface ImportDish {
  name: string;
  description?: string;
  price: number;
  allergens?: string[];
}

interface ImportCategory {
  name: string;
  description?: string;
  dishes: ImportDish[];
}

interface ImportPayload {
  categories: ImportCategory[];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: menuId } = await params;

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    const body: ImportPayload = await request.json();

    if (!body.categories || !Array.isArray(body.categories)) {
      return NextResponse.json(
        { error: "Format invalide : { categories: [...] } attendu" },
        { status: 400 }
      );
    }

    // Get current max sortOrder
    const maxCat = await prisma.category.aggregate({
      where: { menuId },
      _max: { sortOrder: true },
    });
    let catOrder = (maxCat._max.sortOrder ?? -1) + 1;

    let totalDishes = 0;

    for (const cat of body.categories) {
      if (!cat.name || !Array.isArray(cat.dishes)) continue;

      const category = await prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description ?? null,
          sortOrder: catOrder++,
          menuId,
        },
      });

      for (let i = 0; i < cat.dishes.length; i++) {
        const d = cat.dishes[i];
        if (!d.name || typeof d.price !== "number") continue;

        await prisma.dish.create({
          data: {
            name: d.name,
            description: d.description ?? null,
            price: d.price,
            allergens: d.allergens ?? [],
            sortOrder: i,
            categoryId: category.id,
          },
        });
        totalDishes++;
      }
    }

    return NextResponse.json({
      data: {
        categoriesCreated: body.categories.length,
        dishesCreated: totalDishes,
      },
    });
  } catch (error) {
    console.error("Erreur import JSON:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import" },
      { status: 500 }
    );
  }
}
