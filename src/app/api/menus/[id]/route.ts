import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { menuSchema } from "@/lib/validators";

// GET /api/menus/[id] — Get a single menu with categories and dishes
export async function GET(
  _request: Request,
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

    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: {
            dishes: {
              orderBy: { sortOrder: "asc" },
            },
          },
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

    return NextResponse.json({ data: menu });
  } catch (error) {
    console.error("Erreur lors de la récupération du menu:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération du menu" },
      { status: 500 }
    );
  }
}

// PUT /api/menus/[id] — Update a menu
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

    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
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
    const parsed = menuSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
    }
    if (parsed.data.templateId !== undefined) {
      updateData.templateId = parsed.data.templateId;
    }
    if (parsed.data.customColors !== undefined) {
      updateData.customColors = parsed.data.customColors ?? Prisma.JsonNull;
    }
    if (parsed.data.customFonts !== undefined) {
      updateData.customFonts = parsed.data.customFonts ?? Prisma.JsonNull;
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: {
            dishes: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: updatedMenu });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du menu:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du menu" },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/[id] — Delete a menu
export async function DELETE(
  _request: Request,
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

    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
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

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Erreur lors de la suppression du menu:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression du menu" },
      { status: 500 }
    );
  }
}
