import { describe, it, expect } from "vitest";
import fs from "fs";

describe("edge runtime compatibility", () => {
  it("middleware.ts does not exist (auth handled in pages)", () => {
    const exists = fs.existsSync("src/middleware.ts");
    expect(exists).toBe(false);
  });

  it("auth.ts does not import crypto directly", () => {
    const content = fs.readFileSync("src/lib/auth.ts", "utf-8");
    expect(content).not.toContain("from \"crypto\"");
    expect(content).not.toContain("require(\"crypto\")");
  });

  it("dashboard page checks auth and redirects", () => {
    const content = fs.readFileSync(
      "src/app/(dashboard)/dashboard/page.tsx",
      "utf-8"
    );
    expect(content).toContain("await auth()");
    expect(content).toContain("redirect");
    expect(content).toContain("/login");
  });
});
