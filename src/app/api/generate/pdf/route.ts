import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateMenuPdf } from "@/lib/pdf";

// Allow up to 60s for PDF generation on Vercel
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get("menuId");
    if (!menuId) {
      return NextResponse.json({ error: "ID du menu requis" }, { status: 400 });
    }

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    const pdfBuffer = await generateMenuPdf(menuId);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${menu.slug}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}

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

    const pdfBuffer = await generateMenuPdf(menuId);

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${menu.slug}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
