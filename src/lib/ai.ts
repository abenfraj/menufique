import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import sharp from "sharp";
import { TemplateData } from "@/templates/types";
import { getTemplateByStyle } from "@/lib/ai-prompt-templates";

export type ImageMode = "none" | "emojis" | "ai-photos";

export interface AIDesignOptions {
  style: "elegant" | "modern" | "rustic" | "minimal" | "colorful" | "auto";
  imageMode: ImageMode;
  colorPreference: "warm" | "cool" | "dark" | "pastel" | "auto";
  complexity: "simple" | "detailed" | "luxe";
  includeCoverPage: boolean;
  imageGranularity: "category" | "dish";
  menuPageCount: number; // 1-4
  customInstructions?: string;
}

export const AI_STYLE_LABELS: Record<AIDesignOptions["style"], string> = {
  auto: "Automatique",
  elegant: "Élégant",
  modern: "Moderne",
  rustic: "Rustique",
  minimal: "Minimaliste",
  colorful: "Coloré",
};

export const AI_COLOR_LABELS: Record<AIDesignOptions["colorPreference"], string> = {
  auto: "Automatique",
  warm: "Tons chauds",
  cool: "Tons froids",
  dark: "Sombre",
  pastel: "Pastel",
};

export const AI_COMPLEXITY_LABELS: Record<AIDesignOptions["complexity"], string> = {
  simple: "Simple",
  detailed: "Détaillé",
  luxe: "Luxe",
};

export interface AIDesignResult {
  html: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  backgroundUrl: string | null;
}

export interface GeneratedImage {
  name: string;
  dataUri: string;
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY non configurée");
  return new Anthropic({ apiKey });
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY non configurée");
  return new OpenAI({ apiKey });
}

/**
 * Compress a base64-encoded image with sharp.
 */
export async function compressImage(
  b64: string,
  width: number,
  height: number
): Promise<string> {
  const buffer = Buffer.from(b64, "base64");
  const compressed = await sharp(buffer)
    .resize(width, height, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
  return compressed.toString("base64");
}

/**
 * Detect item type based on name keywords to generate appropriate DALL-E prompts.
 */
export function detectItemType(name: string, context?: string): "drink" | "dessert" | "food" {
  const text = `${name} ${context ?? ""}`.toLowerCase();

  const drinkKeywords = [
    "coca", "pepsi", "soda", "jus", "thé", "café", "coffee", "tea",
    "eau", "water", "vin", "wine", "bière", "beer", "limonade", "lemonade",
    "cocktail", "smoothie", "sprite", "fanta", "orangina", "perrier",
    "schweppes", "mojito", "margarita", "sangria", "champagne", "prosecco",
    "apéritif", "digestif", "liqueur", "rhum", "rum", "whisky", "vodka",
    "gin", "tonic", "ice tea", "milkshake", "chocolat chaud", "hot chocolate",
    "cappuccino", "espresso", "latte", "americano", "infusion", "tisane",
    "cidre", "cider", "boisson", "drink", "beverage",
  ];

  const dessertKeywords = [
    "gâteau", "cake", "tarte", "pie", "glace", "ice cream", "sorbet",
    "crème", "cream", "mousse", "tiramisu", "brownie", "cookie",
    "macaron", "fondant", "crêpe", "crepe", "profiterole", "éclair",
    "mille-feuille", "panna cotta", "cheesecake", "clafoutis", "baba",
    "charlotte", "opéra", "paris-brest", "financier", "madeleine",
    "île flottante", "moelleux", "dessert", "pâtisserie", "pastry",
    "flan", "pudding", "compote", "crumble", "nougat", "meringue",
  ];

  for (const kw of drinkKeywords) {
    // Use word boundary to avoid false positives (e.g. "eau" in "gâteau")
    const regex = new RegExp(`(?:^|\\s|')${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$|,|\\.)`, "i");
    if (regex.test(text)) return "drink";
  }
  for (const kw of dessertKeywords) {
    const regex = new RegExp(`(?:^|\\s|')${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$|,|\\.)`, "i");
    if (regex.test(text)) return "dessert";
  }
  return "food";
}

/**
 * Build a DALL-E prompt specific to the item type.
 */
function buildDallePrompt(name: string, itemType: "drink" | "dessert" | "food", context?: string): string {
  const desc = context ? ` (${context})` : "";
  switch (itemType) {
    case "drink":
      return `Ultra-realistic professional beverage photography of "${name}"${desc}. Shot with a Canon EOS R5, 85mm lens, f/2.8. Crystal clear glass with condensation droplets, ice glistening, vibrant liquid colors. Placed on polished surface with soft reflections. Dramatic side lighting, shallow depth of field, refreshing and inviting. No text, no watermarks, no hands.`;
    case "dessert":
      return `Ultra-realistic professional dessert photography of "${name}"${desc}. Shot with a Canon EOS R5, 90mm macro lens, f/2.8. Exquisite plating, visible textures (glossy chocolate, powdered sugar, caramel drizzle), garnished beautifully. Soft warm lighting, shallow depth of field, luxurious and irresistible. No text, no watermarks, no hands.`;
    case "food":
      return `Ultra-realistic professional food photography of "${name}"${desc}. Shot with a Canon EOS R5, 85mm lens, f/2.8 aperture. Perfectly plated on elegant tableware, steam rising, vibrant natural colors, appetizing textures visible. Soft diffused natural window light, shallow depth of field with creamy bokeh. Mouth-watering, editorial quality for a Michelin-starred restaurant magazine. No text, no watermarks, no hands.`;
  }
}

/**
 * Generate food images via DALL-E 3, compress with sharp, return data URIs.
 * Processes in batches of 3 to respect rate limits.
 */
export async function generateFoodImages(
  items: { name: string; context?: string }[],
  _cuisineContext?: string
): Promise<GeneratedImage[]> {
  const client = getOpenAIClient();
  const results: GeneratedImage[] = [];
  const batchSize = 3;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const promises = batch.map(async (item) => {
      try {
        const itemType = detectItemType(item.name, item.context);
        const prompt = buildDallePrompt(item.name, itemType, item.context);

        const response = await client.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          response_format: "b64_json",
        });

        const b64 = response.data?.[0]?.b64_json;
        if (!b64) return null;

        const compressed = await compressImage(b64, 512, 512);
        return {
          name: item.name,
          dataUri: `data:image/jpeg;base64,${compressed}`,
        };
      } catch (error) {
        console.error(`Erreur génération image pour "${item.name}":`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return results;
}

/**
 * Generate a cover image for the restaurant via DALL-E 3.
 */
export async function generateCoverImage(
  restaurantName: string,
  cuisineStyle: string
): Promise<string | null> {
  try {
    const client = getOpenAIClient();
    const prompt = `Stunning hero image for a ${cuisineStyle} restaurant called "${restaurantName}". Beautiful food spread or elegant restaurant interior, cinematic lighting, warm tones, professional photography quality. Landscape composition, inviting atmosphere. No text, no watermarks, no logos.`;

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
      response_format: "b64_json",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return null;

    const compressed = await compressImage(b64, 1200, 675);
    return `data:image/jpeg;base64,${compressed}`;
  } catch (error) {
    console.error("Erreur génération image de couverture:", error);
    return null;
  }
}

export function buildDesignPrompt(
  data: TemplateData,
  options: AIDesignOptions = {
    style: "auto",
    imageMode: "none",
    colorPreference: "auto",
    complexity: "detailed",
    includeCoverPage: false,
    imageGranularity: "category",
    menuPageCount: 1,
  },
  images?: GeneratedImage[],
  coverImageDataUri?: string
): string {
  const { restaurant, menu } = data;

  const dishList = menu.categories
    .map((cat) => {
      const dishes = cat.dishes
        .map((d) => {
          let line = `  - ${d.name} — ${d.price}`;
          if (d.description) line += ` (${d.description})`;
          if (d.allergens.length > 0) line += ` [allergènes: ${d.allergens.join(", ")}]`;
          return line;
        })
        .join("\n");
      return `### ${cat.name}${cat.description ? ` — ${cat.description}` : ""}\n${dishes}`;
    })
    .join("\n\n");

  const styleInstruction =
    options.style === "auto"
      ? "Analyse les plats pour déterminer automatiquement le style visuel le plus adapté (bistrot français, italien, japonais, gastro, fast-casual, etc.)"
      : `Le style visuel doit être : ${AI_STYLE_LABELS[options.style]}`;

  const colorInstruction =
    options.colorPreference === "auto"
      ? "Choisis une palette de couleurs adaptée au type de cuisine détecté"
      : `Palette de couleurs souhaitée : ${AI_COLOR_LABELS[options.colorPreference]}`;

  // Image mode instructions — use placeholders to avoid bloating the prompt with base64
  let imageInstruction: string;
  if (options.imageMode === "ai-photos" && images && images.length > 0) {
    const imageList = images
      .map((img) => `  - "${img.name}" → placeholder: {{IMG:${img.name}}}`)
      .join("\n");
    imageInstruction = `IMPORTANT: Intègre des images de plats dans le menu HTML.
Pour chaque image listée ci-dessous, utilise EXACTEMENT cette balise :
<img src="{{IMG:nom}}" class="dish-img" alt="nom">
Les images seront injectées automatiquement après la génération.
Le CSS doit contenir cette règle (OBLIGATOIRE, ne pas modifier) :
.dish-img { width: 120px; height: 120px; object-fit: cover; border-radius: 10px; display: block; }
NE PAS utiliser de style inline sur les <img> pour la taille. La classe .dish-img gère tout.
Images disponibles (utilise les placeholders EXACTEMENT tels quels) :
${imageList}`;
  } else if (options.imageMode === "emojis") {
    imageInstruction = "Ajoute des emojis ou caractères Unicode décoratifs pertinents (ex: 🍕🍝🥩🍷🌿) à côté des catégories ou en décoration. Utilise-les avec parcimonie pour embellir le menu sans surcharger.";
  } else {
    imageInstruction = "N'utilise PAS d'emojis ni d'images. Le design doit être purement typographique et graphique (lignes, bordures, couleurs).";
  }

  // Cover page instructions — use placeholder for cover image
  let coverInstruction = "";
  if (options.includeCoverPage) {
    if (coverImageDataUri) {
      coverInstruction = `

## Page de couverture (OBLIGATOIRE — PLEINE PAGE)
Crée une section de couverture EN PREMIER dans le HTML avec :
- L'image de couverture en fond, utilise ce placeholder EXACTEMENT : <div style="background-image: url('{{COVER_IMG}}'); background-size: cover; background-position: center; min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center;">
- Un overlay sombre OBLIGATOIRE (rgba(0,0,0,0.45)) pour la lisibilité du texte
- UNIQUEMENT : le nom du restaurant "${restaurant.name}" en grand, centré
${restaurant.address ? `- L'adresse "${restaurant.address}" en dessous, c'est tout` : ""}
- RIEN D'AUTRE : pas de slogan, pas de sous-titre décoratif, pas d'éléments superflus
- Style: min-height: 100vh; page-break-after: always (pour le PDF)
- L'image sera injectée automatiquement à la place du placeholder.`;
    } else {
      coverInstruction = `

## Page de couverture (OBLIGATOIRE — PLEINE PAGE)
Crée une section de couverture EN PREMIER dans le HTML avec :
- Un fond avec gradient sophistiqué ou couleur forte
- UNIQUEMENT : le nom du restaurant "${restaurant.name}" en grand, centré, typographie impactante
${restaurant.address ? `- L'adresse "${restaurant.address}" en dessous, c'est tout` : ""}
- RIEN D'AUTRE : pas de slogan, pas de sous-titre décoratif, pas d'éléments superflus
- Style: min-height: 100vh; page-break-after: always (pour le PDF)`;
    }
  }

  const menuPageCount = options.menuPageCount ?? 1;
  const totalPages = menuPageCount + (options.includeCoverPage ? 1 : 0);

  const fitInstruction = menuPageCount === 1
    ? `- CRITIQUE : TOUT le contenu du menu DOIT tenir sur UNE SEULE page A4 (297mm de haut). S'il y a beaucoup de plats, réduis les font-size (min 10px pour les noms, 8px pour les descriptions), réduis les marges et espacements, utilise 2 colonnes si nécessaire. AUCUN contenu ne doit déborder sur une 2e page.
- La page de menu utilise .menu-page { width: 210mm; height: 297mm; padding: 12mm; box-sizing: border-box; overflow: hidden; position: relative; }
- N'utilise PAS min-height, utilise HEIGHT: 297mm pour forcer la taille exacte.`
    : `- Le contenu du menu doit occuper EXACTEMENT ${menuPageCount} pages A4.
- Chaque page utilise .menu-page { width: 210mm; height: 297mm; padding: 12mm; box-sizing: border-box; page-break-after: always; overflow: hidden; position: relative; }
- .menu-page:last-child { page-break-after: auto; }
- Répartis le contenu uniformément entre les ${menuPageCount} pages. Chaque page doit être remplie, pas d'espace vide en bas.`;

  const pageLayoutInstruction = `

## FORMAT DE PAGE — A4 (OBLIGATOIRE, NE PAS IGNORER)
${fitInstruction}
- Le document total a EXACTEMENT ${totalPages} div.menu-page${options.includeCoverPage ? ` (1 couverture + ${menuPageCount} page(s) de contenu)` : ""}.
- body { margin: 0; padding: 0; } — le body ne doit PAS avoir de padding.
- Si le contenu déborde, réduis les tailles de police et espacements. Si le contenu est insuffisant, agrandis-les. L'objectif est que chaque page soit EXACTEMENT remplie.`;

  const customInstruction = options.customInstructions
    ? `\n\n## Instructions personnalisées du restaurateur\n${options.customInstructions}`
    : "";

  // Reference template injection
  const referenceTemplate = getTemplateByStyle(options.style, options.complexity);
  const templateInstruction = `

## TEMPLATE DE RÉFÉRENCE (BASE OBLIGATOIRE)
Voici un template HTML complet qui définit la STRUCTURE et le STYLE de référence pour ce type de menu.
Tu DOIS utiliser cette structure comme point de départ et l'adapter :
- Remplace le contenu fictif (restaurant "Le Jardin") par le vrai contenu du menu
- Adapte les couleurs, polices, ornements selon les directives de style ci-dessus
- Conserve la structure A4 exacte (.menu-page width:210mm, height:297mm, overflow:hidden)
- Améliore le design si possible, mais ne casse pas la structure de base
- Respecte le format de réponse JSON demandé ci-dessous

\`\`\`html
${referenceTemplate}
\`\`\``;

  // Complexity-specific design instructions
  const complexityInstructions = buildComplexityInstructions(options.complexity);

  return `Tu es un designer de menus de restaurant PROFESSIONNEL, expert en typographie, mise en page et design graphique. Tu crées des menus LISIBLES, ÉLÉGANTS et de qualité professionnelle. Génère un design HTML/CSS soigné et visuellement cohérent pour le menu suivant.

## Informations du restaurant (OBLIGATOIRE sur le menu)
- Nom du restaurant : **${restaurant.name}** — DOIT apparaître en grand, bien visible, en haut du menu
${restaurant.address ? `- Adresse : ${restaurant.address} — DOIT apparaître sur le menu` : ""}
${restaurant.phone ? `- Téléphone : ${restaurant.phone} — DOIT apparaître sur le menu` : ""}
${restaurant.email ? `- Email : ${restaurant.email} — À inclure si possible` : ""}
${restaurant.website ? `- Site web : ${restaurant.website} — À inclure si possible` : ""}

## Menu "${menu.name}"
${dishList}

## Directives de style
- ${styleInstruction}
- ${colorInstruction}
- ${imageInstruction}
${coverInstruction}
${pageLayoutInstruction}
${customInstruction}
${templateInstruction}

## Niveau de complexité : ${AI_COMPLEXITY_LABELS[options.complexity]}
${complexityInstructions}

## Contraintes de lisibilité (OBLIGATOIRES)
- Taille min noms de plats : 16px, prix : 16px, descriptions : 14px, allergènes : 12px
- Line-height : 1.5 minimum pour le corps de texte
- Contraste texte/fond fort (texte foncé sur fond clair ou inversement, jamais de gris clair sur blanc)
- Prix alignés verticalement (flexbox ou grid)
- Espacement min 1rem entre les plats, 2rem entre les catégories
- RÈGLE D'OR : si un élément décoratif réduit la lisibilité, supprime-le

## Règles techniques STRICTES
1. Génère un document HTML COMPLET (<!DOCTYPE html> jusqu'à </html>) avec un bloc <style> dans le <head> ET des styles inline
2. FORMAT A4 OBLIGATOIRE : chaque page = 1 div.menu-page avec width:210mm; height:297mm (pas min-height). body { margin:0; padding:0; }. Le HTML doit contenir EXACTEMENT ${totalPages} div.menu-page. C'est NON NÉGOCIABLE.${menuPageCount === 1 ? " TOUT le contenu du menu tient sur 1 SEULE page. Réduis les tailles si nécessaire." : ""}
3. Utilise 2-3 polices Google Fonts complémentaires (via <link> dans le <head>). Choisis des polices PREMIUM et originales (ex: Cormorant Garamond, Playfair Display, Libre Baskerville, Josefin Sans, Montserrat, DM Serif Display, Lora, Spectral, etc.)
4. PAS de JavaScript
5. TOUS les plats doivent apparaître avec leur nom et prix. Les descriptions doivent apparaître si elles existent.
6. Les allergènes doivent être indiqués (en légende en bas de page ou en petit à côté des plats)
7. Le nom du restaurant, l'adresse et le téléphone DOIVENT être visibles — c'est une obligation légale
8. Ajoute -webkit-print-color-adjust: exact et print-color-adjust: exact sur body
9. Le HTML doit faire minimum 150 lignes pour un design riche et détaillé

## Format de réponse
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de backticks, pas de commentaires) :
{
  "html": "<!DOCTYPE html>...(le HTML complet)...",
  "colors": {
    "primary": "#hex",
    "background": "#hex",
    "text": "#hex",
    "accent": "#hex"
  },
  "fonts": {
    "heading": "NomPolice",
    "body": "NomPolice"
  },
  "cuisineStyle": "type de cuisine détecté"
}`;
}

function buildComplexityInstructions(complexity: AIDesignOptions["complexity"]): string {
  switch (complexity) {
    case "simple":
      return `Design ÉPURÉ mais SOIGNÉ — la lisibilité reste prioritaire :
- Layout propre et aéré avec beaucoup d'espace blanc
- Typographie soignée : une police élégante pour les titres, une lisible pour le corps
- Séparateurs fins et discrets entre les sections
- Palette de 2-3 couleurs maximum, utilisées avec parcimonie
- Mise en page claire : le contenu est roi
- Bordures ou filets fins pour structurer
- Le nom du restaurant doit être stylé avec une belle police`;

    case "detailed":
      return `Design RICHE et PROFESSIONNEL — la lisibilité reste prioritaire :
- Header impressionnant avec le nom du restaurant en grand, avec un traitement typographique travaillé (letter-spacing, text-transform, taille imposante)
- Utilise des CSS gradients sophistiqués (linear-gradient, radial-gradient) pour les fonds et éléments décoratifs
- Séparateurs décoratifs entre les sections : lignes ornées, motifs CSS (≈ ✦ ◆ ─── ✧ ───), ou bordures stylisées
- Chaque catégorie doit avoir un traitement visuel distinct (fond coloré subtil, bordure latérale, icône)
- Les prix doivent être alignés et mis en valeur (couleur accent, police différente, leader dots ··· entre nom et prix)
- Ajoute un footer élégant avec les informations du restaurant et un petit élément décoratif
- Utilise des box-shadow subtils pour donner de la profondeur
- Les descriptions des plats en italique ou couleur plus claire
- Fond avec texture ou gradient subtil (pas un fond blanc uni)
- Padding et margins généreux pour un rendu luxueux
- Border-radius variés pour un design contemporain`;

    case "luxe":
      return `Design SPECTACULAIRE et LUXUEUX — la lisibilité reste prioritaire, RÈGLE D'OR : si un élément décoratif réduit la lisibilité, supprime-le :
- Header MONUMENTAL : nom du restaurant en très grande taille (48px+), avec letter-spacing élargi, possiblement sur un fond à gradient complexe ou avec une bordure ornée double/triple
- Utilise des techniques CSS avancées :
  * Gradients complexes multi-stops (3-4 couleurs) pour les fonds
  * Box-shadows multiples empilés pour un effet de profondeur luxueux
  * Bordures décoratives avec border-image ou des éléments pseudo (::before, ::after) pour des ornements
  * Effets de texte : text-shadow subtil, letter-spacing travaillé, small-caps pour les catégories
  * Background-patterns CSS (repeating-linear-gradient pour créer des motifs géométriques subtils en fond)
- Structure en COLONNES si le menu a 4+ catégories (CSS columns ou flexbox)
- Chaque catégorie a un "cartouche" : un cadre décoratif distinct avec fond, bordure, et titre orné
- Séparateurs ORNÉS entre les sections : créés en pur CSS avec des pseudo-éléments (ex: ── ✦ ── ou des lignes doubles avec un losange au centre)
- Les plats sont présentés comme des cartes individuelles avec hover-like styling, ombres, et coins arrondis
- Le prix est mis en valeur dans un badge ou cercle décoratif
- Les descriptions sont en italique avec une police serif élégante
- Leader dots sophistiqués entre le nom du plat et le prix (border-bottom dotted stylisé)
- Section allergènes dans un encadré élégant en bas avec une légende visuelle
- Footer richement décoré : bordure top ornée, espacement luxueux, texte en petites capitales
- Palette de couleurs riche : au moins 4-5 couleurs harmonieuses avec un accent doré/cuivré/bordeaux
- Fond TEXTURÉ : utilise des CSS patterns (ex: repeating-linear-gradient diagonal subtil, ou un radial-gradient doux)
- Typographie EXCEPTIONNELLE : 3 polices Google Fonts complémentaires (display pour le nom, serif pour les titres, sans-serif pour le corps)
- L'ensemble doit donner l'impression d'un menu de restaurant gastronomique 3 étoiles Michelin`;

    default:
      return "";
  }
}

export function buildBackgroundPrompt(
  cuisineStyle: string,
  restaurantName: string
): string {
  return `Subtle decorative background texture for a ${cuisineStyle} restaurant menu called "${restaurantName}". Muted watercolor effect, very light and subtle, no text, no food images, just an elegant abstract texture or pattern. Print-ready, seamless edges, portrait orientation.`;
}

/**
 * Post-process the generated HTML to replace image placeholders with actual base64 data URIs.
 * Placeholders: {{IMG:dish name}} for food images, {{COVER_IMG}} for cover image.
 */
export function injectImagesIntoHtml(
  html: string,
  images?: GeneratedImage[],
  coverImageDataUri?: string
): string {
  let result = html;

  // Replace cover image placeholder
  if (coverImageDataUri) {
    result = result.replace(/\{\{COVER_IMG\}\}/g, coverImageDataUri);
  }

  // Replace food image placeholders
  if (images && images.length > 0) {
    for (const img of images) {
      // Escape special regex chars in name
      const escapedName = img.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\{\\{IMG:${escapedName}\\}\\}`, "g");
      result = result.replace(regex, img.dataUri);
    }
  }

  return result;
}

/**
 * Validate generated HTML for basic quality checks.
 */
export function validateGeneratedHtml(
  html: string,
  restaurantName: string
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
    issues.push("HTML manquant : pas de <!DOCTYPE> ou <html>");
  }

  if (html.length < 500) {
    issues.push(`HTML trop court (${html.length} caractères, minimum 500)`);
  }

  if (!/€|\d+[.,]\d{2}/.test(html)) {
    issues.push("Aucun prix détecté dans le HTML (pas de € ni de format X.XX)");
  }

  if (/\{\{IMG:/.test(html)) {
    issues.push("Placeholders {{IMG:...}} non remplacés détectés");
  }

  if (/\{\{COVER_IMG\}\}/.test(html)) {
    issues.push("Placeholder {{COVER_IMG}} non remplacé détecté");
  }

  if (!html.toLowerCase().includes(restaurantName.toLowerCase())) {
    issues.push(`Le nom du restaurant "${restaurantName}" est absent du HTML`);
  }

  return { valid: issues.length === 0, issues };
}

export async function generateMenuDesign(
  data: TemplateData,
  options?: AIDesignOptions,
  images?: GeneratedImage[],
  coverImageDataUri?: string
): Promise<Omit<AIDesignResult, "backgroundUrl"> & { cuisineStyle: string }> {
  const client = getAnthropicClient();
  const prompt = buildDesignPrompt(data, options, images, coverImageDataUri);

  const maxTokens = options?.complexity === "luxe" ? 16000 : options?.complexity === "simple" ? 6000 : 12000;

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Réponse IA invalide : pas de contenu texte");
  }

  const rawText = textBlock.text.trim();

  // Parse JSON response — handle potential markdown code blocks
  let jsonText = rawText;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  let parsed: {
    html: string;
    colors: { primary: string; background: string; text: string; accent: string };
    fonts: { heading: string; body: string };
    cuisineStyle: string;
  };

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Réponse IA invalide : JSON malformé");
  }

  if (!parsed.html || !parsed.colors || !parsed.fonts) {
    throw new Error("Réponse IA incomplète : champs manquants");
  }

  // Post-process: inject actual base64 images into placeholders
  const finalHtml = injectImagesIntoHtml(parsed.html, images, coverImageDataUri);

  // Validate generated HTML
  const validation = validateGeneratedHtml(finalHtml, data.restaurant.name);
  if (!validation.valid) {
    throw new Error(`HTML généré invalide : ${validation.issues.join("; ")}`);
  }

  return {
    html: finalHtml,
    colors: parsed.colors,
    fonts: parsed.fonts,
    cuisineStyle: parsed.cuisineStyle ?? "restaurant",
  };
}

export async function extractMenuFromImage(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyse cette image de menu de restaurant. Extrais TOUTES les informations visibles et retourne-les dans ce format texte structuré :

NOM DU RESTAURANT: [nom s'il est visible]
ADRESSE: [adresse si visible]
TELEPHONE: [téléphone si visible]

CATEGORIES ET PLATS:
[Pour chaque catégorie, liste:]
## [Nom de la catégorie]
- [Nom du plat] | [Prix] | [Description si visible]

Sois exhaustif, extrais TOUS les plats avec leurs prix exacts. Si un prix n'est pas lisible, mets "?" Ne traduis pas, garde la langue originale du menu.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Impossible d'extraire le contenu du menu depuis l'image");
  }

  return content;
}

export async function generateMenuBackground(
  cuisineStyle: string,
  restaurantName: string
): Promise<string | null> {
  try {
    const client = getOpenAIClient();
    const prompt = buildBackgroundPrompt(cuisineStyle, restaurantName);

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "standard",
    });

    return response.data?.[0]?.url ?? null;
  } catch (error) {
    console.error("Erreur génération image DALL-E:", error);
    return null;
  }
}
