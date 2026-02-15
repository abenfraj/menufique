import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { restaurantSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: session.user.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Aucun restaurant configuré" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: restaurant });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération du restaurant" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = restaurantSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    // Upsert: create or update
    const restaurant = await prisma.restaurant.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        name: data.name,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email || null,
        website: data.website || null,
        openingHours: data.openingHours ?? Prisma.JsonNull,
      },
      update: {
        name: data.name,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email || null,
        website: data.website || null,
        openingHours: data.openingHours ?? Prisma.JsonNull,
      },
    });

    return NextResponse.json({ data: restaurant });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du restaurant" },
      { status: 500 }
    );
  }
}
