import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST — Upload a photo for a dish (compressed to base64 data URI)
export async function POST(
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

    // Verify ownership chain
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu || menu.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Menu introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, menuId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 404 }
      );
    }

    const dish = await prisma.dish.findFirst({
      where: { id: dishId, categoryId },
    });
    if (!dish) {
      return NextResponse.json(
        { error: "Plat introuvable" },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 5 Mo)" },
        { status: 400 }
      );
    }

    // Read file, compress with sharp
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const compressed = await sharp(buffer)
      .resize(400, 400, { fit: "cover" })
      .jpeg({ quality: 75 })
      .toBuffer();

    const dataUri = `data:image/jpeg;base64,${compressed.toString("base64")}`;

    // Save to database
    const updatedDish = await prisma.dish.update({
      where: { id: dishId },
      data: { imageUrl: dataUri },
    });

    return NextResponse.json({
      data: { id: updatedDish.id, imageUrl: updatedDish.imageUrl },
    });
  } catch (error) {
    console.error("Erreur upload image plat:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload" },
      { status: 500 }
    );
  }
}

// DELETE — Remove the photo from a dish
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

    // Verify ownership chain
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu || menu.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Menu introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, menuId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 404 }
      );
    }

    const dish = await prisma.dish.findFirst({
      where: { id: dishId, categoryId },
    });
    if (!dish) {
      return NextResponse.json(
        { error: "Plat introuvable" },
        { status: 404 }
      );
    }

    await prisma.dish.update({
      where: { id: dishId },
      data: { imageUrl: null },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Erreur suppression image plat:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression" },
      { status: 500 }
    );
  }
}
