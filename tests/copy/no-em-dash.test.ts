import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("user-facing copy has no em dashes", () => {
  it("src/copy/en.ts", () => {
    const text = readFileSync(join(process.cwd(), "src/copy/en.ts"), "utf8");
    expect(text).not.toContain("\u2014");
  });

  it("src/insights/library.ts", () => {
    const text = readFileSync(
      join(process.cwd(), "src/insights/library.ts"),
      "utf8",
    );
    expect(text).not.toContain("\u2014");
  });
});
