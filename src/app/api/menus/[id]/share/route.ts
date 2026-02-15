import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMenuShareEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  email: z.email("Email invalide"),
});

// Simple in-memory rate limiter (per userId, per day)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 10) return false;

  entry.count += 1;
  return true;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Email invalide" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check rate limit (max 10/day)
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: "Vous avez atteint la limite de 10 emails partagés par jour" },
        { status: 429 }
      );
    }

    // Verify ownership + get menu data
    const menu = await prisma.menu.findFirst({
      where: { id, userId: session.user.id },
      include: { restaurant: true },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu introuvable" },
        { status: 404 }
      );
    }

    if (!menu.isPublished) {
      return NextResponse.json(
        { error: "Ce menu n'est pas publié. Publiez-le d'abord avant de le partager." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const menuUrl = `${appUrl}/m/${menu.slug}`;

    await sendMenuShareEmail(
      email,
      menu.restaurant.name,
      menu.name,
      menuUrl,
      session.user.name
    );

    return NextResponse.json({ message: "Menu partagé avec succès" });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
