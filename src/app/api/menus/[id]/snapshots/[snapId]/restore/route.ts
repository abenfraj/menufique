import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Snapshot {
  id: string;
  label: string;
  html: string;
  createdAt: string;
}

function parseSnapshots(raw: unknown): Snapshot[] {
  if (Array.isArray(raw)) return raw as Snapshot[];
  return [];
}

/** POST /api/menus/[id]/snapshots/[snapId]/restore — Restore a saved snapshot */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; snapId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: menuId, snapId } = await params;

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id as string },
      select: { designSnapshots: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    const snapshot = parseSnapshots(menu.designSnapshots).find(
      (s) => s.id === snapId
    );

    if (!snapshot) {
      return NextResponse.json({ error: "Version introuvable" }, { status: 404 });
    }

    await prisma.menu.update({
      where: { id: menuId },
      data: { aiDesignHtml: snapshot.html },
    });

    return NextResponse.json({ data: { html: snapshot.html } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
