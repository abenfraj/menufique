import Stripe from "stripe";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

export function getStripe() {
  return getStripeClient();
}

export const PLANS = {
  FREE: {
    maxMenus: 1,
    templates: ["classic", "minimal"],
    customization: false,
    watermark: true,
    logo: false,
  },
  PRO: {
    maxMenus: Infinity,
    templates: ["classic", "minimal", "bistrot", "elegant", "modern"],
    customization: true,
    watermark: false,
    logo: true,
  },
} as const;

export function getPlanLimits(plan: "FREE" | "PRO") {
  return PLANS[plan];
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await getStripe().checkout.sessions.create({
    customer_email: userEmail,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });

  return session;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
