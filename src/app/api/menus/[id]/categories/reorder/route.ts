import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

// PUT /api/menus/[menuId]/categories/reorder — Reorder categories
export async function PUT(
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

    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Update sortOrder for each category in a transaction
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Erreur lors du réordonnancement des catégories:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du réordonnancement des catégories" },
      { status: 500 }
    );
  }
}
