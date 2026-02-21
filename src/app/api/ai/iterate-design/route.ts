import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Simple in-memory rate limiter — best-effort in serverless environments
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) return false;
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id as string;

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Trop de requêtes. Attendez 1 minute avant de réessayer." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { menuId, prompt } = body as { menuId?: string; prompt?: string };

    if (!menuId || typeof menuId !== "string") {
      return NextResponse.json({ error: "ID du menu requis" }, { status: 400 });
    }
    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Instruction de modification requise" },
        { status: 400 }
      );
    }

    // Fetch menu + ownership check
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId },
      select: { templateId: true, aiDesignHtml: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    if (menu.templateId !== "ai-custom" || !menu.aiDesignHtml) {
      return NextResponse.json(
        { error: "Ce menu n'a pas encore de design IA" },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu es un éditeur de menus HTML. On te fournit le HTML complet d'un menu et une instruction de modification. Tu dois :
1. Appliquer UNIQUEMENT la modification demandée
2. Ne changer RIEN d'autre (contenu, structure, polices, couleurs non mentionnées)
3. Retourner le HTML complet et valide
4. Conserver toutes les balises <style>, <link>, et la structure .menu-page
Ne génère pas de nouveau design. Modifie uniquement ce qui est demandé.
Retourne UNIQUEMENT le HTML brut, sans explications, sans markdown, sans balises de code.`;

    const userMessage = `Voici le HTML du menu :\n\n${menu.aiDesignHtml}\n\nInstruction de modification : ${prompt.trim()}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 16000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });
    }

    let newHtml = content.text.trim();
    // Strip markdown code blocks if AI added them
    newHtml = newHtml.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

    // Validate: must contain .menu-page class
    if (!newHtml.includes("menu-page")) {
      return NextResponse.json(
        { error: "Le design modifié semble invalide. Veuillez réessayer." },
        { status: 500 }
      );
    }

    // Save to DB
    await prisma.menu.update({
      where: { id: menuId },
      data: { aiDesignHtml: newHtml },
    });

    return NextResponse.json({ data: { html: newHtml } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
