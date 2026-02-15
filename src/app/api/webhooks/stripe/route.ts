import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendProConfirmationEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId && session.customer && session.subscription) {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
          select: { email: true, name: true },
        });
        // Send Pro confirmation email (non-blocking)
        sendProConfirmationEmail(updatedUser.email, updatedUser.name).catch(
          () => {}
        );
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: isActive ? "PRO" : "FREE",
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      // Could send an email notification here
      break;
    }
  }

  return NextResponse.json({ received: true });
}
