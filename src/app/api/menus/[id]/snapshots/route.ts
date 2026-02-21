import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

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

/** GET /api/menus/[id]/snapshots — List all snapshots for a menu */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: menuId } = await params;

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id as string },
      select: { designSnapshots: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    // Return snapshots without the full HTML to keep payload light
    const snapshots = parseSnapshots(menu.designSnapshots).map(
      ({ id, label, createdAt }) => ({ id, label, createdAt })
    );

    return NextResponse.json({ data: snapshots });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST /api/menus/[id]/snapshots — Create a new snapshot of the current design */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: menuId } = await params;

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id as string },
      select: { aiDesignHtml: true, designSnapshots: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    if (!menu.aiDesignHtml) {
      return NextResponse.json(
        { error: "Pas de design IA à sauvegarder" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const label =
      (body as { label?: string }).label?.trim() ||
      `Version du ${new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;

    const snapshots = parseSnapshots(menu.designSnapshots);
    const newSnapshot: Snapshot = {
      id: randomUUID(),
      label,
      html: menu.aiDesignHtml,
      createdAt: new Date().toISOString(),
    };

    const updated = [...snapshots, newSnapshot];
    // Max 10 snapshots — remove oldest first
    while (updated.length > 10) updated.shift();

    await prisma.menu.update({
      where: { id: menuId },
      data: { designSnapshots: JSON.parse(JSON.stringify(updated)) },
    });

    return NextResponse.json({
      data: { id: newSnapshot.id, label: newSnapshot.label, createdAt: newSnapshot.createdAt },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
