import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQrCode } from "@/lib/qr";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { menuId } = await request.json();
    if (!menuId) {
      return NextResponse.json({ error: "ID du menu requis" }, { status: 400 });
    }

    // Verify ownership
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const menuUrl = `${appUrl}/m/${menu.slug}`;
    const qrDataUrl = await generateQrCode(menuUrl);

    return NextResponse.json({
      data: {
        qrCode: qrDataUrl,
        menuUrl,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la génération du QR code" },
      { status: 500 }
    );
  }
}
