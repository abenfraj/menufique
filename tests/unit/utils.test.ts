import { describe, it, expect } from "vitest";
import { slugify, formatPrice, generateId, cn } from "@/lib/utils";

describe("slugify", () => {
  it("converts text to URL-friendly slug", () => {
    expect(slugify("Le Bistrot du Coin")).toBe("le-bistrot-du-coin");
  });

  it("removes accents", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
  });

  it("handles special characters", () => {
    expect(slugify("L'Étoile & Co.")).toBe("l-etoile-co");
  });

  it("trims and collapses spaces", () => {
    expect(slugify("  hello   world  ")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatPrice", () => {
  it("formats price in euros", () => {
    const result = formatPrice(14.5);
    // Should contain the number and € symbol
    expect(result).toContain("14");
    expect(result).toContain("€");
  });

  it("formats integer prices", () => {
    const result = formatPrice(10);
    expect(result).toContain("10");
    expect(result).toContain("€");
  });

  it("formats zero", () => {
    const result = formatPrice(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("returns unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
    expect(result).not.toContain("hidden");
  });

  it("merges conflicting tailwind classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });
});
