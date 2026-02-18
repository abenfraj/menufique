import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCustomerPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun abonnement actif trouvé" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const portalSession = await createCustomerPortalSession(
      user.stripeCustomerId,
      `${appUrl}/dashboard/billing`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'ouverture du portail de facturation" },
      { status: 500 }
    );
  }
}
