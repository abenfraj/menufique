import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const publishSchema = z.object({
  isPublished: z.boolean(),
});

// PUT /api/menus/[id]/publish — Toggle publish status
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
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: { isPublished: parsed.data.isPublished },
    });

    return NextResponse.json({ data: updatedMenu });
  } catch (error) {
    console.error("Erreur lors de la publication du menu:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la publication du menu" },
      { status: 500 }
    );
  }
}
