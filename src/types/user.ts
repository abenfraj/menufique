// ============================================
// USER TYPES
// ============================================
export type Plan = "FREE" | "PRO";

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: Plan;
}
