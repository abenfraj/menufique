import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dishSchema } from "@/lib/validators";

// PUT /api/menus/[menuId]/categories/[categoryId]/dishes/[id] — Update a dish
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string; dishId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id: menuId, categoryId, dishId } = await params;

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

    // Verify dish belongs to this category
    const dish = await prisma.dish.findFirst({
      where: { id: dishId, categoryId },
    });

    if (!dish) {
      return NextResponse.json(
        { error: "Plat introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = dishSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedDish = await prisma.dish.update({
      where: { id: dishId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.price !== undefined && { price: parsed.data.price }),
        ...(parsed.data.allergens !== undefined && { allergens: parsed.data.allergens }),
        ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl ?? null }),
        ...(parsed.data.isAvailable !== undefined && { isAvailable: parsed.data.isAvailable }),
        ...(parsed.data.sortOrder !== undefined && { sortOrder: parsed.data.sortOrder }),
      },
    });

    return NextResponse.json({ data: updatedDish });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du plat:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du plat" },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/[menuId]/categories/[categoryId]/dishes/[id] — Delete a dish
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string; dishId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id: menuId, categoryId, dishId } = await params;

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

    // Verify dish belongs to this category
    const dish = await prisma.dish.findFirst({
      where: { id: dishId, categoryId },
    });

    if (!dish) {
      return NextResponse.json(
        { error: "Plat introuvable" },
        { status: 404 }
      );
    }

    await prisma.dish.delete({
      where: { id: dishId },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Erreur lors de la suppression du plat:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression du plat" },
      { status: 500 }
    );
  }
}
