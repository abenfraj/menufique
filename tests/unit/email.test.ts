import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendEmail, sendWelcomeEmail, sendResetPasswordEmail, sendProConfirmationEmail } from "@/lib/email";

// Resend is mocked in setup.ts
describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("silently returns when RESEND_API_KEY is missing", async () => {
    const original = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    // Should not throw
    await expect(
      sendEmail({ to: "test@example.com", subject: "Test", html: "<p>Hello</p>" })
    ).resolves.toBeUndefined();

    process.env.RESEND_API_KEY = original;
  });

  it("sends email when RESEND_API_KEY is present", async () => {
    process.env.RESEND_API_KEY = "re_test_key";

    // Should not throw
    await expect(
      sendEmail({ to: "test@example.com", subject: "Test", html: "<p>Hello</p>" })
    ).resolves.toBeUndefined();
  });
});

describe("sendWelcomeEmail", () => {
  it("resolves without throwing", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    await expect(
      sendWelcomeEmail("user@example.com", "Alice")
    ).resolves.toBeUndefined();
  });

  it("handles missing name gracefully", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    await expect(
      sendWelcomeEmail("user@example.com")
    ).resolves.toBeUndefined();
  });
});

describe("sendResetPasswordEmail", () => {
  it("resolves without throwing", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    await expect(
      sendResetPasswordEmail("user@example.com", "abc123token")
    ).resolves.toBeUndefined();
  });
});

describe("sendProConfirmationEmail", () => {
  it("resolves without throwing", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    await expect(
      sendProConfirmationEmail("user@example.com", "Bob")
    ).resolves.toBeUndefined();
  });
});
