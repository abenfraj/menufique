import { describe, it, expect } from "vitest";
import { generateQrCode, generateQrCodeSvg } from "@/lib/qr";

describe("generateQrCode", () => {
  it("returns a base64 data URL", async () => {
    const result = await generateQrCode("https://menufique.com/m/test");
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("generates QR code for valid URL", async () => {
    const url = "https://menufique.com/m/le-bistrot-du-coin";
    const result = await generateQrCode(url);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(100);
  });
});

describe("generateQrCodeSvg", () => {
  it("returns SVG string", async () => {
    const result = await generateQrCodeSvg("https://menufique.com/m/test");
    expect(result).toContain("<svg");
    expect(result).toContain("</svg>");
  });

  it("generates valid SVG for short URL", async () => {
    const result = await generateQrCodeSvg("https://example.com");
    expect(result).toContain("xmlns");
  });
});
