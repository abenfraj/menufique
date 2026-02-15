import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dishSchema } from "@/lib/validators";

// POST /api/menus/[menuId]/categories/[categoryId]/dishes — Add a dish
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id: menuId, categoryId } = await params;

    // Verify menu ownership
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
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

    // Verify category belongs to this menu
    const category = await prisma.category.findFirst({
      where: { id: categoryId, menuId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = dishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Auto-set sortOrder to max + 1
    const maxSortOrder = await prisma.dish.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const dish = await prisma.dish.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        allergens: parsed.data.allergens,
        isAvailable: parsed.data.isAvailable,
        sortOrder,
        categoryId,
      },
    });

    return NextResponse.json({ data: dish }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du plat:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du plat" },
      { status: 500 }
    );
  }
}
