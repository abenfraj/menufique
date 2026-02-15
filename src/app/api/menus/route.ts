import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { menuSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

// GET /api/menus — List all menus for authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const menus = await prisma.menu.findMany({
      where: { userId: session.user.id },
      include: {
        categories: {
          include: { dishes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: menus });
  } catch (error) {
    console.error("Erreur lors de la récupération des menus:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des menus" },
      { status: 500 }
    );
  }
}

// POST /api/menus — Create a new menu
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Check if user has a restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: session.user.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Vous devez d'abord créer un restaurant" },
        { status: 400 }
      );
    }

    // Check plan limits (FREE = max 1 menu)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan === "FREE") {
      const menuCount = await prisma.menu.count({
        where: { userId: session.user.id },
      });

      if (menuCount >= 1) {
        return NextResponse.json(
          { error: "Le plan gratuit est limité à 1 menu. Passez au plan Pro pour en créer davantage." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const name = body.name || "Mon menu";

    // Validate with schema
    const parsed = menuSchema.safeParse({ name });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = slugify(`${restaurant.name}-${parsed.data.name}`);
    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.menu.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const menu = await prisma.menu.create({
      data: {
        name: parsed.data.name,
        slug,
        userId: session.user.id,
        restaurantId: restaurant.id,
      },
      include: {
        categories: {
          include: { dishes: true },
        },
      },
    });

    return NextResponse.json({ data: menu }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du menu:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du menu" },
      { status: 500 }
    );
  }
}
