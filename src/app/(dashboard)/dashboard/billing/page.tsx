import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import BillingClient from "./billing-client";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, stripeCustomerId: true },
  });

  return (
    <BillingClient
      plan={user?.plan ?? "FREE"}
      hasCustomer={!!user?.stripeCustomerId}
      priceMonthly={process.env.STRIPE_PRICE_PRO_MONTHLY!}
      priceYearly={process.env.STRIPE_PRICE_PRO_YEARLY!}
    />
  );
}
