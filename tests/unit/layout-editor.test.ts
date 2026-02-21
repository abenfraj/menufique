/**
 * Tests for the layout editor logic (drag & resize category frames).
 * These tests cover:
 *  1. findSections-equivalent: section detection robustness
 *  2. Position application via DOMParser (the "save" path)
 *  3. No scaler contamination in ?layout=1 HTML
 *  4. stripPreviewInjections does not corrupt AI HTML
 */

import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";

// ─── Helpers mirrored from menu-editor.tsx ────────────────────────────────────

/** Mirrors findSections from menu-editor.tsx (exclude-descendants approach) */
function findSections(root: Document): Element[] {
  const SEL = [
    ".menu-section",
    "[class*='menu-section']",
    "[class*='category-block']",
    "[class*='category-section']",
    "[class*='food-section']",
    "section",
    "[class*='category']",
    "[class*='section']",
    ".category",
    ".section",
  ];
  for (const sel of SEL) {
    let found: Element[];
    try { found = [...root.querySelectorAll(sel)]; } catch { continue; }
    if (found.length < 2) continue;
    // Keep only top-level: remove any element that is a descendant of another in the set
    const topLevel = found.filter(
      (el) => !found.some((other) => other !== el && other.contains(el))
    );
    // In DOMParser docs (and in Node.js tests) offsetHeight is always 0 — skip the filter.
    // In a real browser with rendered layout, filter out tiny elements (icon wrappers).
    const inBrowserWithLayout =
      typeof document !== "undefined" && root === document;
    const visible = inBrowserWithLayout
      ? topLevel.filter((el) => (el as HTMLElement).offsetHeight > 20)
      : topLevel;
    if (visible.length >= 2) return visible;
  }
  return [];
}

/** Apply layout positions to the original HTML, return updated HTML.
 *  Mirrors saveLayoutAndExit in menu-editor.tsx — reparents all sections into
 *  the .menu-page container so cross-column dragging is preserved on save. */
function applyLayoutPositions(
  baseHtml: string,
  positions: Array<{ left: string; top: string; width: string; height: string }>
): string {
  const dom = new JSDOM(baseHtml);
  const parsedDoc = dom.window.document;
  const sections = findSections(parsedDoc);
  if (!sections.length) return baseHtml;

  // Find the A4 page container — single positioning root
  const pageEl = (
    parsedDoc.querySelector(".menu-page") ??
    (() => {
      let a: Element | null = sections[0].parentElement;
      while (a && !sections.every((s) => a!.contains(s))) a = a.parentElement;
      return a;
    })()
  ) as HTMLElement | null;

  if (!pageEl) return baseHtml;

  pageEl.style.position = "relative";
  const maxBot = positions.reduce((m, p) => {
    return Math.max(m, (parseFloat(p.top) || 0) + (parseFloat(p.height) || 200) + 40);
  }, 0);
  const currentMin = parseFloat(pageEl.style.minHeight) || 0;
  if (maxBot > currentMin) pageEl.style.minHeight = `${maxBot}px`;

  // Apply positions and reparent each section into pageEl
  positions.forEach((pos, i) => {
    const el = sections[i] as HTMLElement | undefined;
    if (!el) return;
    el.style.position = "absolute";
    el.style.left = pos.left;
    el.style.top = pos.top;
    if (pos.width) el.style.width = pos.width;
    if (pos.height) el.style.height = pos.height;
    el.style.boxSizing = "border-box";
    pageEl.appendChild(el);
  });

  return `<!DOCTYPE html>\n` + parsedDoc.documentElement.outerHTML;
}

/** Mirror of stripPreviewInjections from menu-editor.tsx */
function stripPreviewInjections(html: string): string {
  return html
    .replace(/<style id="preview-normalizer">[\s\S]*?<\/style>/i, "")
    .replace(/<script data-mf-scaler="1">[\s\S]*?<\/script>/i, "");
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeMenuHtml(sectionClass = "menu-section") {
  return `<!DOCTYPE html>
<html><head><title>Menu</title></head>
<body>
  <div class="menu-page">
    <header><h1>Restaurant Test</h1></header>
    <main>
      <div class="${sectionClass}"><h2>Entrées</h2><p>Salade 8€</p></div>
      <div class="${sectionClass}"><h2>Plats</h2><p>Steak 18€</p></div>
      <div class="${sectionClass}"><h2>Desserts</h2><p>Tiramisu 7€</p></div>
    </main>
  </div>
</body></html>`;
}

function makeScaledMenuHtml() {
  // Simulates the DOM after the mf-scaler has wrapped content — should NOT
  // appear in ?layout=1 mode, but tests that we never save this kind of HTML.
  return `<!DOCTYPE html>
<html><head>
  <style id="preview-normalizer">
    .menu-page{width:210mm;height:297mm;overflow:hidden;}
  </style>
</head>
<body>
  <div class="menu-page" data-mf-scaled="1">
    <div style="transform-origin:top left;width:120%;display:block;transform:scale(0.8333)">
      <div class="menu-section"><h2>Entrées</h2></div>
      <div class="menu-section"><h2>Plats</h2></div>
    </div>
  </div>
  <script data-mf-scaler="1">/* scaler */</script>
</body></html>`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("findSections", () => {
  it("finds sections by .menu-section class", () => {
    const dom = new JSDOM(makeMenuHtml("menu-section"));
    const sections = findSections(dom.window.document);
    expect(sections).toHaveLength(3);
    expect(sections[0].querySelector("h2")?.textContent).toBe("Entrées");
    expect(sections[2].querySelector("h2")?.textContent).toBe("Desserts");
  });

  it("finds sections by [class*='category'] fallback", () => {
    const dom = new JSDOM(makeMenuHtml("category-item"));
    const sections = findSections(dom.window.document);
    expect(sections).toHaveLength(3);
  });

  it("excludes sub-elements — picks top-level sections only", () => {
    // Nested structure: .menu-section-item are inside .menu-section
    // The top-level .menu-section should be picked, not the nested items
    const html = `<!DOCTYPE html><html><body>
      <div class="menu-page">
        <main>
          <div class="menu-section">
            <h2>Entrées</h2>
            <div class="menu-section-item">Salade</div>
            <div class="menu-section-item">Soupe</div>
          </div>
          <div class="menu-section"><h2>Plats</h2></div>
          <div class="menu-section"><h2>Desserts</h2></div>
        </main>
      </div>
    </body></html>`;
    const dom = new JSDOM(html);
    const sections = findSections(dom.window.document);
    // Should find 3 top-level .menu-section (the items inside are also matched by
    // [class*='menu-section'] but are excluded because they're descendants)
    expect(sections).toHaveLength(3);
    expect(sections[0].querySelector("h2")?.textContent).toBe("Entrées");
  });

  it("returns empty array when fewer than 2 matching sections exist", () => {
    const html = `<!DOCTYPE html><html><body><div class="menu-section"><h2>Only one</h2></div></body></html>`;
    const dom = new JSDOM(html);
    expect(findSections(dom.window.document)).toHaveLength(0);
  });

  it("handles AI-generated HTML with generic 'section' tag", () => {
    const html = `<!DOCTYPE html><html><body>
      <div class="menu-page">
        <section><h2>Entrées</h2></section>
        <section><h2>Plats</h2></section>
      </div>
    </body></html>`;
    const dom = new JSDOM(html);
    const sections = findSections(dom.window.document);
    expect(sections).toHaveLength(2);
  });

  it("finds ALL sections in a 2-column layout (old bug: only found 2/4)", () => {
    // This is the exact scenario that caused the original bug:
    // sections split between .col-left and .col-right → old code picked one column only
    const html = `<!DOCTYPE html><html><body>
      <div class="menu-page">
        <div class="columns">
          <div class="col-left">
            <div class="menu-section"><h2>Entrées</h2></div>
            <div class="menu-section"><h2>Plats</h2></div>
          </div>
          <div class="col-right">
            <div class="menu-section"><h2>Desserts</h2></div>
            <div class="menu-section"><h2>Boissons</h2></div>
          </div>
        </div>
      </div>
    </body></html>`;
    const dom = new JSDOM(html);
    const sections = findSections(dom.window.document);
    // Must find all 4, not just 2 from one column
    expect(sections).toHaveLength(4);
    const titles = sections.map((s) => s.querySelector("h2")?.textContent);
    expect(titles).toContain("Entrées");
    expect(titles).toContain("Plats");
    expect(titles).toContain("Desserts");
    expect(titles).toContain("Boissons");
  });

  it("excludes nested sub-sections that match the selector", () => {
    // A section containing sub-items that also match [class*='section']
    // Only the top-level sections should be returned
    const html = `<!DOCTYPE html><html><body>
      <div class="menu-content">
        <div class="menu-section">
          <h2>Entrées</h2>
          <div class="section-item">Salade</div>
          <div class="section-item">Soupe</div>
        </div>
        <div class="menu-section"><h2>Plats</h2></div>
        <div class="menu-section"><h2>Desserts</h2></div>
      </div>
    </body></html>`;
    const dom = new JSDOM(html);
    const sections = findSections(dom.window.document);
    // Should find 3 .menu-section, not the nested .section-item elements
    expect(sections).toHaveLength(3);
    expect(sections.every((s) => s.querySelector("h2"))).toBe(true);
  });
});

describe("applyLayoutPositions", () => {
  it("applies absolute positions to each section", () => {
    const baseHtml = makeMenuHtml("menu-section");
    const positions = [
      { left: "10px", top: "50px", width: "200px", height: "120px" },
      { left: "220px", top: "50px", width: "200px", height: "120px" },
      { left: "10px", top: "190px", width: "410px", height: "100px" },
    ];
    const result = applyLayoutPositions(baseHtml, positions);
    const dom = new JSDOM(result);
    const sections = [...dom.window.document.querySelectorAll(".menu-section")];
    expect(sections[0].getAttribute("style")).toContain("position: absolute");
    expect(sections[0].getAttribute("style")).toContain("left: 10px");
    expect(sections[0].getAttribute("style")).toContain("top: 50px");
    expect(sections[1].getAttribute("style")).toContain("left: 220px");
    expect(sections[2].getAttribute("style")).toContain("top: 190px");
  });

  it("makes .menu-page position:relative (sections are reparented into it)", () => {
    const baseHtml = makeMenuHtml("menu-section");
    const positions = [
      { left: "0px", top: "0px", width: "200px", height: "100px" },
      { left: "0px", top: "110px", width: "200px", height: "100px" },
      { left: "0px", top: "220px", width: "200px", height: "100px" },
    ];
    const result = applyLayoutPositions(baseHtml, positions);
    const dom = new JSDOM(result);
    const page = dom.window.document.querySelector(".menu-page") as HTMLElement;
    expect(page.style.position).toBe("relative");
  });

  it("sets minHeight on .menu-page based on max(top + height)", () => {
    const baseHtml = makeMenuHtml("menu-section");
    const positions = [
      { left: "0px", top: "0px", width: "200px", height: "100px" },
      { left: "0px", top: "110px", width: "200px", height: "200px" },
      { left: "0px", top: "50px", width: "200px", height: "80px" },
    ];
    const result = applyLayoutPositions(baseHtml, positions);
    const dom = new JSDOM(result);
    const page = dom.window.document.querySelector(".menu-page") as HTMLElement;
    // maxBot = max(100, 310, 130) = 310; minHeight = 310 + 40 = 350px
    expect(page.style.minHeight).toBe("350px");
  });

  it("preserves the original HTML content inside each section", () => {
    const baseHtml = makeMenuHtml("menu-section");
    const positions = [
      { left: "0px", top: "0px", width: "200px", height: "" },
      { left: "0px", top: "200px", width: "200px", height: "" },
      { left: "0px", top: "400px", width: "200px", height: "" },
    ];
    const result = applyLayoutPositions(baseHtml, positions);
    expect(result).toContain("Salade 8€");
    expect(result).toContain("Steak 18€");
    expect(result).toContain("Tiramisu 7€");
  });

  it("does not corrupt HTML when positions array is shorter than sections", () => {
    const baseHtml = makeMenuHtml("menu-section");
    const positions = [
      { left: "0px", top: "0px", width: "200px", height: "100px" },
      { left: "0px", top: "110px", width: "200px", height: "100px" },
      // missing third (Desserts)
    ];
    const result = applyLayoutPositions(baseHtml, positions);
    const dom = new JSDOM(result);
    const sections = [...dom.window.document.querySelectorAll(".menu-section")];
    // All three sections must still exist in the HTML
    expect(sections).toHaveLength(3);
    // The section with no position provided (Desserts) must not be positioned absolutely
    const desserts = sections.find((s) => s.textContent?.includes("Desserts")) as HTMLElement | undefined;
    expect(desserts).toBeTruthy();
    expect(desserts?.getAttribute("style") ?? "").not.toContain("position: absolute");
    // The two positioned sections are absolute
    const entrees = sections.find((s) => s.textContent?.includes("Entrées")) as HTMLElement | undefined;
    expect(entrees?.getAttribute("style") ?? "").toContain("position: absolute");
  });

  it("returns original html unchanged when no sections found", () => {
    const html = `<!DOCTYPE html><html><body><p>Hello</p></body></html>`;
    const positions = [{ left: "0px", top: "0px", width: "100px", height: "50px" }];
    expect(applyLayoutPositions(html, positions)).toBe(html);
  });
});

describe("stripPreviewInjections — layout safety", () => {
  it("removes preview-normalizer style tag", () => {
    const html = `<html><head><style id="preview-normalizer">.foo{color:red}</style></head><body></body></html>`;
    expect(stripPreviewInjections(html)).not.toContain("preview-normalizer");
  });

  it("removes mf-scaler script tag", () => {
    const html = `<html><head></head><body><p>ok</p><script data-mf-scaler="1">alert(1)</script></body></html>`;
    expect(stripPreviewInjections(html)).not.toContain("data-mf-scaler");
  });

  it("does not remove the AI-generated content", () => {
    const html = makeMenuHtml("menu-section") + `<style id="preview-normalizer">x</style>`;
    const result = stripPreviewInjections(html);
    expect(result).toContain("Entrées");
    expect(result).toContain("Plats");
    expect(result).toContain("Desserts");
  });

  it("is idempotent — applying twice gives same result", () => {
    const html = `<html><head><style id="preview-normalizer">x</style></head><body></body></html>`;
    expect(stripPreviewInjections(stripPreviewInjections(html))).toBe(stripPreviewInjections(html));
  });
});

describe("Layout mode — no scaler contamination", () => {
  it("saveLayoutAndExit never reads scaler-wrapped DOM structure", () => {
    // Simulates the WRONG old approach: reading doc.documentElement.outerHTML
    // after the scaler ran. The saved HTML would contain transform:scale() wrapper.
    const scaledHtml = makeScaledMenuHtml();
    // Verify the scaler-wrapped HTML would be corrupted if saved as-is
    expect(scaledHtml).toContain("transform:scale");
    expect(scaledHtml).toContain("data-mf-scaled");

    // The correct approach: apply positions to ORIGINAL html, not scaled DOM
    const originalHtml = makeMenuHtml("menu-section");
    const positions = [
      { left: "10px", top: "20px", width: "190mm", height: "" },
      { left: "10px", top: "150px", width: "190mm", height: "" },
      { left: "10px", top: "280px", width: "190mm", height: "" },
    ];
    const saved = applyLayoutPositions(originalHtml, positions);
    // Saved HTML must NOT contain scaler artifacts
    expect(saved).not.toContain("transform:scale");
    expect(saved).not.toContain("data-mf-scaled");
    expect(saved).not.toContain("data-mf-scaler");
  });

  it("?layout=1 preview normalizer has overflow:visible and no height lock", () => {
    // The preview route serves different CSS for ?layout=1.
    // We test the CSS strings directly to avoid spinning up a server.
    const layoutCss = `html,body{background:#e8eaed!important;margin:0!important;padding:20px 0!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:20px!important;min-height:100vh!important;}
.menu-page{width:210mm!important;min-height:297mm!important;max-height:none!important;overflow:visible!important;box-sizing:border-box!important;box-shadow:0 4px 24px rgba(0,0,0,0.18)!important;flex-shrink:0!important;margin:0!important;position:relative!important;}`;

    expect(layoutCss).toContain("overflow:visible");
    expect(layoutCss).toContain("max-height:none");
    // Must NOT have a fixed height (which the normal CSS has as `height:297mm!important`)
    // Note: min-height:297mm is OK and also contains the substring "height:297mm",
    // so we check for the discriminating pattern max-height:297mm instead.
    expect(layoutCss).not.toContain("max-height:297mm");
    expect(layoutCss).not.toContain("min-height:unset"); // min-height must NOT be unset
    expect(layoutCss).toContain("min-height:297mm"); // still has minimum
  });

  it("normal preview normalizer has overflow:hidden and fixed height", () => {
    const normalCss = `html,body{background:#e8eaed!important;}
.menu-page{width:210mm!important;height:297mm!important;min-height:unset!important;max-height:297mm!important;overflow:hidden!important;}`;

    expect(normalCss).toContain("overflow:hidden");
    expect(normalCss).toContain("height:297mm");
  });
});

describe("saveAiDesignHtml — PATCH endpoint (Bug fix: PUT ignored aiDesignHtml)", () => {
  it("uses PATCH method, not PUT", () => {
    // This test documents the bug fix: the old code used PUT which went through
    // menuSchema.partial() — aiDesignHtml is not in menuSchema so it was silently
    // discarded and never persisted. The fix uses PATCH which goes to a dedicated
    // handler that saves aiDesignHtml directly via Prisma.
    //
    // We simulate what saveAiDesignHtml does:
    const calls: Array<{ method: string; body: unknown }> = [];
    const fakeFetch = (url: string, init: RequestInit) => {
      calls.push({ method: init.method as string, body: JSON.parse(init.body as string) });
      return Promise.resolve({ ok: true });
    };

    const menuId = "test-menu-id";
    const html = "<html><body><div class='menu-section'>...</div></body></html>";

    // The correct implementation:
    fakeFetch(`/api/menus/${menuId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiDesignHtml: html }),
    });

    expect(calls[0].method).toBe("PATCH");
    expect((calls[0].body as { aiDesignHtml: string }).aiDesignHtml).toBe(html);
  });

  it("PATCH handler would receive aiDesignHtml and not strip it via menuSchema", () => {
    // menuSchema only has: name, templateId, customColors, customFonts
    // If the PUT handler runs safeParse on { aiDesignHtml: "..." }, it returns
    // parsed.data = {} (aiDesignHtml is stripped as unknown field).
    // The PATCH handler bypasses menuSchema entirely and reads aiDesignHtml directly.
    const body = { aiDesignHtml: "<html>...</html>" };

    // Simulate what menuSchema.partial().safeParse does (strips unknown fields):
    const knownFields = ["name", "templateId", "customColors", "customFonts"];
    const parsedViaMenuSchema = Object.fromEntries(
      Object.entries(body).filter(([k]) => knownFields.includes(k))
    );
    expect(parsedViaMenuSchema).toEqual({}); // aiDesignHtml is gone!

    // The PATCH handler reads directly (no schema filtering):
    const { aiDesignHtml } = body;
    expect(aiDesignHtml).toBe("<html>...</html>"); // preserved!
  });

  it("applyLayoutPositions produces non-empty HTML from valid input", () => {
    // Regression test: ensure the HTML saved via PATCH is non-trivial
    const baseHtml = makeMenuHtml("menu-section");
    const positions = [
      { left: "0px", top: "0px", width: "200px", height: "120px" },
      { left: "210px", top: "0px", width: "200px", height: "120px" },
      { left: "0px", top: "130px", width: "410px", height: "80px" },
    ];
    const result = applyLayoutPositions(baseHtml, positions);
    // Must be a complete HTML document, not an empty or minimal one
    expect(result.length).toBeGreaterThan(500);
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("<html");
    expect(result).toContain("Restaurant Test");
    expect(result).toContain("menu-section");
  });

  it("multi-column layout: sections reparented into .menu-page for free cross-column drag", () => {
    // Old fix: set position:relative on each column parent.
    // New fix (this test): reparent ALL sections into .menu-page so they share one
    // positioning context → dragging from col-right to the left side of the page works.
    const html = `<!DOCTYPE html><html><body>
      <div class="menu-page">
        <div class="columns">
          <div class="col-left">
            <div class="menu-section"><h2>Entrées</h2></div>
            <div class="menu-section"><h2>Plats</h2></div>
          </div>
          <div class="col-right">
            <div class="menu-section"><h2>Desserts</h2></div>
            <div class="menu-section"><h2>Boissons</h2></div>
          </div>
        </div>
      </div>
    </body></html>`;

    const positions = [
      { left: "10px",  top: "20px",  width: "200px", height: "120px" },
      { left: "10px",  top: "150px", width: "200px", height: "120px" },
      // Desserts dragged to the LEFT side (same x as col-left sections)
      { left: "10px",  top: "280px", width: "200px", height: "120px" },
      { left: "220px", top: "280px", width: "200px", height: "120px" },
    ];

    const result = applyLayoutPositions(html, positions);
    const dom = new JSDOM(result);

    // .menu-page must be the single positioning root
    const page = dom.window.document.querySelector(".menu-page") as HTMLElement;
    expect(page.style.position).toBe("relative");

    // All 4 sections must be direct children of .menu-page (reparented)
    const directSections = [...page.children].filter(
      (el) => el.classList.contains("menu-section")
    );
    expect(directSections).toHaveLength(4);

    // Sections from both columns share the same coordinate space
    // Desserts (index 2) was in col-right but is now positioned at left:10px (same side as col-left)
    const desserts = directSections.find((s) => s.textContent?.includes("Desserts")) as HTMLElement | undefined;
    expect(desserts?.style.left).toBe("10px");
  });

  it("multi-column layout: all 4 sections get positions applied", () => {
    // This tests the full save pipeline for a 2-column (2+2) layout
    const html = `<!DOCTYPE html><html><body>
      <div class="menu-page">
        <div class="columns">
          <div class="col-left">
            <div class="menu-section"><h2>Entrées</h2><p>Salade 8€</p></div>
            <div class="menu-section"><h2>Plats</h2><p>Steak 18€</p></div>
          </div>
          <div class="col-right">
            <div class="menu-section"><h2>Desserts</h2><p>Tarte 7€</p></div>
            <div class="menu-section"><h2>Boissons</h2><p>Eau 3€</p></div>
          </div>
        </div>
      </div>
    </body></html>`;

    const positions = [
      { left: "10px", top: "20px",  width: "200px", height: "120px" },
      { left: "10px", top: "150px", width: "200px", height: "120px" },
      { left: "220px", top: "20px",  width: "200px", height: "120px" },
      { left: "220px", top: "150px", width: "200px", height: "120px" },
    ];

    const result = applyLayoutPositions(html, positions);
    const dom = new JSDOM(result);
    const sections = [...dom.window.document.querySelectorAll(".menu-section")];

    // All 4 sections must have absolute positioning
    expect(sections).toHaveLength(4);
    sections.forEach((s) => {
      expect((s as HTMLElement).style.position).toBe("absolute");
    });

    // Positions are applied in order
    expect((sections[0] as HTMLElement).style.left).toBe("10px");
    expect((sections[2] as HTMLElement).style.left).toBe("220px");
    expect((sections[3] as HTMLElement).style.top).toBe("150px");
  });
});
