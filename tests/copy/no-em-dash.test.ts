import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src", "convex", "content/insights"] as const;
const EXT = /\.(ts|tsx|js|jsx|json|md|css)$/;

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "_generated" || name === "node_modules") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXT.test(name)) out.push(full);
  }
  return out;
}

describe("no em dashes in product source", () => {
  it("scans src, convex, and content/insights", () => {
    const files = ROOTS.flatMap((root) => walk(join(process.cwd(), root)));
    expect(files.length).toBeGreaterThan(10);
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (text.includes("\u2014")) hits.push(file);
    }
    expect(hits).toEqual([]);
  });

  it("fails if an em dash is introduced on purpose", () => {
    expect("hello\u2014world").toContain("\u2014");
  });
});
