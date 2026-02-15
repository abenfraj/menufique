import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validators";

// PUT /api/menus/[id]/categories/[categoryId] — Update a category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: menuId, categoryId } = await params;

    // Verify menu ownership
    const menu = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }
    if (menu.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Verify category belongs to this menu
    const category = await prisma.category.findFirst({
      where: { id: categoryId, menuId },
    });
    if (!category) {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      },
      include: { dishes: true },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la catégorie" }, { status: 500 });
  }
}

// DELETE /api/menus/[id]/categories/[categoryId] — Delete a category
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: menuId, categoryId } = await params;

    const menu = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }
    if (menu.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, menuId },
    });
    if (!category) {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    }

    await prisma.category.delete({ where: { id: categoryId } });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression de la catégorie" }, { status: 500 });
  }
}
