import { describe, it, expect } from "vitest";
import { buildDesignPrompt, buildBackgroundPrompt, injectImagesIntoHtml, detectItemType, validateGeneratedHtml } from "@/lib/ai";
import type { AIDesignOptions } from "@/lib/ai";
import { TemplateData } from "@/templates/types";

const mockTemplateData: TemplateData = {
  restaurant: {
    name: "Le Petit Bistrot",
    address: "12 Rue de la Paix, Paris",
    phone: "01 42 00 00 00",
    email: "contact@petitbistrot.fr",
    website: "www.petitbistrot.fr",
  },
  menu: {
    name: "Menu du jour",
    categories: [
      {
        name: "Entrées",
        description: "Nos entrées maison",
        dishes: [
          {
            name: "Soupe à l'oignon",
            description: "Gratinée au fromage",
            price: "8,50 €",
            allergens: ["gluten", "lait"],
            isAvailable: true,
          },
          {
            name: "Salade César",
            description: "Poulet grillé, parmesan, croûtons",
            price: "12,00 €",
            allergens: ["gluten", "oeufs"],
            isAvailable: true,
          },
        ],
      },
      {
        name: "Plats",
        dishes: [
          {
            name: "Entrecôte grillée",
            description: "Sauce béarnaise, frites maison",
            price: "24,00 €",
            allergens: ["oeufs"],
            isAvailable: true,
          },
        ],
      },
    ],
  },
  customization: {
    primaryColor: "#FF6B35",
    backgroundColor: "#FFF8F2",
    textColor: "#1A1A2E",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
  },
  branding: {
    showWatermark: false,
  },
};

const defaultOptions: AIDesignOptions = {
  style: "auto",
  imageMode: "none",
  colorPreference: "auto",
  complexity: "detailed",
  includeCoverPage: false,
  imageGranularity: "category",
  menuPageCount: 1,
};

describe("buildDesignPrompt", () => {
  it("includes restaurant name prominently", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("**Le Petit Bistrot**");
    expect(prompt).toContain("DOIT apparaître en grand");
  });

  it("includes restaurant address as mandatory", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("12 Rue de la Paix, Paris");
    expect(prompt).toContain("DOIT apparaître sur le menu");
  });

  it("includes restaurant phone as mandatory", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("01 42 00 00 00");
  });

  it("includes restaurant email and website", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("contact@petitbistrot.fr");
    expect(prompt).toContain("www.petitbistrot.fr");
  });

  it("includes menu name", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("Menu du jour");
  });

  it("includes dish names, prices and descriptions", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("Soupe à l'oignon");
    expect(prompt).toContain("8,50 €");
    expect(prompt).toContain("Gratinée au fromage");
    expect(prompt).toContain("Entrecôte grillée");
    expect(prompt).toContain("24,00 €");
  });

  it("includes allergens for dishes that have them", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("allergènes: gluten, lait");
  });

  it("includes category names and descriptions", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("### Entrées — Nos entrées maison");
    expect(prompt).toContain("### Plats");
  });

  it("specifies JSON response format", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("JSON");
    expect(prompt).toContain('"html"');
    expect(prompt).toContain('"colors"');
    expect(prompt).toContain('"fonts"');
  });

  it("mentions legal obligation for restaurant info", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("obligation légale");
  });

  it("omits address when not provided", () => {
    const dataWithoutAddress = {
      ...mockTemplateData,
      restaurant: { name: "Test Restaurant" },
    };
    const prompt = buildDesignPrompt(dataWithoutAddress);
    expect(prompt).not.toContain("Adresse :");
  });

  // Options tests
  it("uses auto style by default", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("Analyse les plats pour déterminer automatiquement");
  });

  it("respects explicit style option", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      style: "elegant",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("Élégant");
  });

  it("respects color preference option", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      colorPreference: "dark",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("Sombre");
  });

  // Image mode tests
  it("disables emojis and images when imageMode is none", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      imageMode: "none",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("PAS d'emojis");
  });

  it("includes emoji instruction when imageMode is emojis", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      imageMode: "emojis",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("emojis");
    expect(prompt).toContain("Unicode");
  });

  it("includes image placeholders when imageMode is ai-photos with images", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      imageMode: "ai-photos",
    };
    const images = [
      { name: "Soupe à l'oignon", dataUri: "data:image/jpeg;base64,abc123" },
    ];
    const prompt = buildDesignPrompt(mockTemplateData, options, images);
    // Should use placeholders, NOT actual base64 data
    expect(prompt).toContain("{{IMG:Soupe à l'oignon}}");
    expect(prompt).not.toContain("data:image/jpeg;base64,abc123");
    expect(prompt).toContain("<img src=");
  });

  it("falls back to no-image mode when ai-photos but no images provided", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      imageMode: "ai-photos",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("PAS d'emojis");
  });

  // Cover page tests
  it("includes cover page instructions when includeCoverPage is true", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      includeCoverPage: true,
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("Page de couverture");
    expect(prompt).toContain("min-height: 100vh");
    expect(prompt).not.toContain("height: 50vh");
    expect(prompt).not.toContain("max-height: 500px");
    expect(prompt).toContain("page-break-after: always");
  });

  it("includes cover image placeholder when cover image provided", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      includeCoverPage: true,
    };
    const coverUri = "data:image/jpeg;base64,coverimage123";
    const prompt = buildDesignPrompt(mockTemplateData, options, undefined, coverUri);
    // Should use placeholder, NOT actual base64 data
    expect(prompt).toContain("{{COVER_IMG}}");
    expect(prompt).not.toContain("coverimage123");
    expect(prompt).toContain("background-image");
  });

  it("does not include cover instructions when includeCoverPage is false", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      includeCoverPage: false,
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).not.toContain("Page de couverture");
  });

  it("includes custom instructions when provided", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      customInstructions: "Utilise du doré et un cadre art déco",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("Utilise du doré et un cadre art déco");
    expect(prompt).toContain("Instructions personnalisées");
  });

  it("generates simple complexity instructions", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      complexity: "simple",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("Simple");
    expect(prompt).toContain("ÉPURÉ");
  });

  it("generates detailed complexity instructions", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      complexity: "detailed",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("Détaillé");
    expect(prompt).toContain("RICHE");
    expect(prompt).toContain("gradients");
  });

  it("generates luxe complexity instructions", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      complexity: "luxe",
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("Luxe");
    expect(prompt).toContain("SPECTACULAIRE");
    expect(prompt).toContain("Michelin");
    expect(prompt).toContain("lisibilité reste prioritaire");
  });

  it("includes readability constraints", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("Contraintes de lisibilité");
    expect(prompt).toContain("16px");
    expect(prompt).toContain("Line-height");
    expect(prompt).toContain("RÈGLE D'OR");
  });

  // Menu page count tests
  it("defaults to 1 page — forces all content on single A4", () => {
    const prompt = buildDesignPrompt(mockTemplateData);
    expect(prompt).toContain("EXACTEMENT 1 div.menu-page");
    expect(prompt).toContain("UNE SEULE page");
    expect(prompt).toContain("height: 297mm");
  });

  it("includes correct page count when menuPageCount is 2", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      menuPageCount: 2,
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("EXACTEMENT 2 div.menu-page");
    expect(prompt).toContain("EXACTEMENT 2 pages A4");
  });

  it("includes multi-page layout instructions", () => {
    const options: AIDesignOptions = {
      ...defaultOptions,
      menuPageCount: 3,
    };
    const prompt = buildDesignPrompt(mockTemplateData, options);
    expect(prompt).toContain("EXACTEMENT 3 div.menu-page");
    expect(prompt).toContain("page-break-after: always");
    expect(prompt).toContain("EXACTEMENT 3 pages A4");
  });
});

describe("injectImagesIntoHtml", () => {
  it("replaces food image placeholders with data URIs", () => {
    const html = '<img src="{{IMG:Soupe}}" alt="Soupe"><img src="{{IMG:Salade}}" alt="Salade">';
    const images = [
      { name: "Soupe", dataUri: "data:image/jpeg;base64,soup123" },
      { name: "Salade", dataUri: "data:image/jpeg;base64,salad456" },
    ];
    const result = injectImagesIntoHtml(html, images);
    expect(result).toContain("data:image/jpeg;base64,soup123");
    expect(result).toContain("data:image/jpeg;base64,salad456");
    expect(result).not.toContain("{{IMG:");
  });

  it("replaces cover image placeholder", () => {
    const html = '<div style="background-image: url(\'{{COVER_IMG}}\');">Hero</div>';
    const result = injectImagesIntoHtml(html, undefined, "data:image/jpeg;base64,cover789");
    expect(result).toContain("data:image/jpeg;base64,cover789");
    expect(result).not.toContain("{{COVER_IMG}}");
  });

  it("handles special characters in image names", () => {
    const html = '<img src="{{IMG:Soupe à l\'oignon}}" alt="Soupe">';
    const images = [
      { name: "Soupe à l'oignon", dataUri: "data:image/jpeg;base64,onion" },
    ];
    const result = injectImagesIntoHtml(html, images);
    expect(result).toContain("data:image/jpeg;base64,onion");
  });

  it("returns html unchanged when no images provided", () => {
    const html = "<div>Hello</div>";
    const result = injectImagesIntoHtml(html);
    expect(result).toBe("<div>Hello</div>");
  });
});

describe("buildBackgroundPrompt", () => {
  it("includes cuisine style", () => {
    const prompt = buildBackgroundPrompt("bistrot français", "Le Petit Bistrot");
    expect(prompt).toContain("bistrot français");
  });

  it("includes restaurant name", () => {
    const prompt = buildBackgroundPrompt("japonais", "Sushi Master");
    expect(prompt).toContain("Sushi Master");
  });

  it("requests subtle and print-ready output", () => {
    const prompt = buildBackgroundPrompt("italien", "Trattoria");
    expect(prompt).toContain("subtle");
    expect(prompt).toContain("Print-ready");
  });
});

describe("detectItemType", () => {
  it("detects drinks by name", () => {
    expect(detectItemType("Coca Cola")).toBe("drink");
    expect(detectItemType("Jus d'orange")).toBe("drink");
    expect(detectItemType("Café expresso")).toBe("drink");
    expect(detectItemType("Bière blonde")).toBe("drink");
    expect(detectItemType("Vin rouge")).toBe("drink");
    expect(detectItemType("Smoothie mangue")).toBe("drink");
    expect(detectItemType("Thé vert")).toBe("drink");
    expect(detectItemType("Limonade maison")).toBe("drink");
    expect(detectItemType("Sprite")).toBe("drink");
    expect(detectItemType("Perrier")).toBe("drink");
  });

  it("detects desserts by name", () => {
    expect(detectItemType("Tiramisu")).toBe("dessert");
    expect(detectItemType("Tarte aux pommes")).toBe("dessert");
    expect(detectItemType("Crème brûlée")).toBe("dessert");
    expect(detectItemType("Fondant au chocolat")).toBe("dessert");
    expect(detectItemType("Glace vanille")).toBe("dessert");
    expect(detectItemType("Macaron framboise")).toBe("dessert");
    expect(detectItemType("Brownie")).toBe("dessert");
    expect(detectItemType("Panna cotta")).toBe("dessert");
  });

  it("detects food as default", () => {
    expect(detectItemType("Entrecôte grillée")).toBe("food");
    expect(detectItemType("Pizza Margherita")).toBe("food");
    expect(detectItemType("Burger classique")).toBe("food");
    expect(detectItemType("Salade niçoise")).toBe("food");
    expect(detectItemType("Sushi saumon")).toBe("food");
  });

  it("uses context to detect type", () => {
    expect(detectItemType("Maison", "notre cocktail signature")).toBe("drink");
    expect(detectItemType("Spécialité", "gâteau fait maison")).toBe("dessert");
  });
});

describe("validateGeneratedHtml", () => {
  const validHtml = `<!DOCTYPE html><html><head></head><body>
    <h1>Le Petit Bistrot</h1>
    <p>Soupe à l'oignon — 8,50 €</p>
    <p>Entrecôte grillée — 24,00 €</p>
    ${"<p>Contenu additionnel pour atteindre la longueur minimale.</p>".repeat(20)}
  </body></html>`;

  it("validates correct HTML", () => {
    const result = validateGeneratedHtml(validHtml, "Le Petit Bistrot");
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("detects missing DOCTYPE/html tag", () => {
    const html = `<div><h1>Le Petit Bistrot</h1><p>Soupe — 8,50 €</p>${"x".repeat(500)}</div>`;
    const result = validateGeneratedHtml(html, "Le Petit Bistrot");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("<!DOCTYPE>"))).toBe(true);
  });

  it("detects HTML too short", () => {
    const html = '<!DOCTYPE html><html><body><h1>Le Petit Bistrot</h1><p>8,50 €</p></body></html>';
    const result = validateGeneratedHtml(html, "Le Petit Bistrot");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("trop court"))).toBe(true);
  });

  it("detects missing prices", () => {
    const html = `<!DOCTYPE html><html><body><h1>Le Petit Bistrot</h1><p>Soupe</p>${"x".repeat(500)}</body></html>`;
    const result = validateGeneratedHtml(html, "Le Petit Bistrot");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("prix"))).toBe(true);
  });

  it("detects unreplaced image placeholders", () => {
    const html = `<!DOCTYPE html><html><body><h1>Le Petit Bistrot</h1><p>8,50 €</p><img src="{{IMG:Soupe}}">${"x".repeat(500)}</body></html>`;
    const result = validateGeneratedHtml(html, "Le Petit Bistrot");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("{{IMG:"))).toBe(true);
  });

  it("detects unreplaced cover placeholder", () => {
    const html = `<!DOCTYPE html><html><body><h1>Le Petit Bistrot</h1><p>8,50 €</p><div style="background-image: url('{{COVER_IMG}}');">${"x".repeat(500)}</div></body></html>`;
    const result = validateGeneratedHtml(html, "Le Petit Bistrot");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("COVER_IMG"))).toBe(true);
  });

  it("detects missing restaurant name", () => {
    const html = `<!DOCTYPE html><html><body><h1>Autre Restaurant</h1><p>8,50 €</p>${"x".repeat(500)}</body></html>`;
    const result = validateGeneratedHtml(html, "Le Petit Bistrot");
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("Le Petit Bistrot"))).toBe(true);
  });
});
