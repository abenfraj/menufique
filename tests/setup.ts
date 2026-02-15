import { vi } from "vitest";

// Mock Prisma globally
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    menu: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    restaurant: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
    dish: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    passwordResetToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  },
}));

// Mock Resend — must use function() to support `new`
vi.mock("resend", () => {
  const sendMock = vi.fn().mockResolvedValue({ id: "test-email-id" });
  function ResendMock() {
    return { emails: { send: sendMock } };
  }
  return { Resend: ResendMock };
});

// Mock Stripe
vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn().mockReturnValue({
    checkout: { sessions: { create: vi.fn() } },
    webhooks: { constructEvent: vi.fn() },
    billingPortal: { sessions: { create: vi.fn() } },
  }),
}));

// Mock Next.js headers/cookies
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

// Mock NextAuth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));
