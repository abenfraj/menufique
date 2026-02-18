import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

// Whitelist of supported delivery platform domains
const ALLOWED_DOMAINS = [
  "deliveroo.fr",
  "deliveroo.co.uk",
  "deliveroo.be",
  "ubereats.com",
  "just-eat.fr",
];

// Simple in-memory rate limiter: userId → [timestamp, ...]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 5; // max extractions
const RATE_WINDOW_MS = 60 * 60 * 1000; // per hour

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

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return ALLOWED_DOMAINS.some(
      (d) => url.hostname === d || url.hostname.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY non configurée");
  return new Anthropic({ apiKey });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: "Limite atteinte : 5 extractions maximum par heure." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    }

    if (!isAllowedUrl(url)) {
      return NextResponse.json(
        {
          error:
            "URL non supportée. Seuls Deliveroo, Uber Eats et Just Eat sont acceptés.",
        },
        { status: 400 }
      );
    }

    // Fetch the page HTML with a browser-like User-Agent
    let html: string;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return NextResponse.json(
          {
            error:
              "Page inaccessible (code " +
              response.status +
              "). Essayez de copier-coller le texte du menu manuellement.",
          },
          { status: 422 }
        );
      }

      html = await response.text();
    } catch (fetchErr) {
      const isTimeout =
        fetchErr instanceof Error && fetchErr.name === "AbortError";
      return NextResponse.json(
        {
          error: isTimeout
            ? "La page a mis trop de temps à répondre (délai 10s). Essayez de copier-coller le texte du menu manuellement."
            : "Page inaccessible. Essayez de copier-coller le texte du menu manuellement.",
        },
        { status: 422 }
      );
    }

    // Trim HTML to 100k chars to avoid saturating the context
    const truncated = html.slice(0, 100_000);

    // Extract menu data with Claude
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Tu es un expert en extraction de données de menus de restaurants.
Analyse ce HTML de page de restaurant (Deliveroo, Uber Eats ou Just Eat) et extrait TOUTES les catégories et tous les plats visibles.

Règles STRICTES :
- Les prix doivent être des nombres flottants (ex: 12.5, pas "12,50 €")
- Si un prix n'est pas lisible, utilise 0
- Extrais TOUTES les catégories et TOUS les plats visibles
- Si le HTML semble être du contenu de restaurant, extrais ce que tu peux
- Réponds UNIQUEMENT avec un JSON valide, sans markdown ni backticks

Format de réponse OBLIGATOIRE :
{
  "categories": [
    {
      "name": "Nom de la catégorie",
      "description": "description optionnelle ou null",
      "dishes": [
        {
          "name": "Nom du plat",
          "description": "description ou null",
          "price": 12.5
        }
      ]
    }
  ]
}

HTML à analyser :
${truncated}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Réponse IA vide");
    }

    let parsed: { categories: { name: string; description?: string | null; dishes: { name: string; description?: string | null; price: number }[] }[] };
    try {
      let jsonText = textBlock.text.trim();
      const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonText = match[1].trim();
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error("L'IA n'a pas pu extraire le menu de cette page.");
    }

    if (!Array.isArray(parsed.categories) || parsed.categories.length === 0) {
      return NextResponse.json(
        {
          error:
            "Aucun plat trouvé sur cette page. La page est peut-être protégée ou vide.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("Erreur extract-from-url:", error);
    const message =
      error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
