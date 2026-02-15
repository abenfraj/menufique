import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validators";

// POST /api/menus/[menuId]/categories — Add a category to a menu
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id: menuId } = await params;

    // Verify menu exists and belongs to user
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

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Auto-set sortOrder to max + 1
    const maxSortOrder = await prisma.category.aggregate({
      where: { menuId },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        sortOrder,
        menuId,
      },
      include: { dishes: true },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}
