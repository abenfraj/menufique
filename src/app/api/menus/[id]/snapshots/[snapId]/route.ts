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

/** DELETE /api/menus/[id]/snapshots/[snapId] — Delete a snapshot */
export async function DELETE(
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

    const updated = parseSnapshots(menu.designSnapshots).filter(
      (s) => s.id !== snapId
    );

    await prisma.menu.update({
      where: { id: menuId },
      data: { designSnapshots: JSON.parse(JSON.stringify(updated)) },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH /api/menus/[id]/snapshots/[snapId] — Rename a snapshot */
export async function PATCH(
  request: Request,
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

    const body = await request.json().catch(() => ({}));
    const { label } = body as { label?: string };

    const updated = parseSnapshots(menu.designSnapshots).map((s) =>
      s.id === snapId ? { ...s, label: label?.trim() ?? s.label } : s
    );

    await prisma.menu.update({
      where: { id: menuId },
      data: { designSnapshots: JSON.parse(JSON.stringify(updated)) },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
