import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendResetPasswordEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

export async function POST(request: Request) {
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

    // Check user exists (but always return success to prevent email enumeration)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } });

      // Create new token (1h expiry)
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      });

      await sendResetPasswordEmail(email, token);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message:
        "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.",
    });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
