import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { insightLibraryV1 } from "@/insights/library";

/** Modal + finite verb that English does not allow. */
const BAD_MAY = /\bmay\s+(are|is|am|was|were|can|could|will|would|shall|should)\b/i;

const COPY_ROOTS = [
  "src/copy",
  "src/content",
  "src/insights",
  "src/components",
  "src/app",
  "content/insights",
] as const;

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === "_generated") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|json|yml|yaml|md)$/.test(name)) out.push(full);
  }
  return out;
}

/** The old bug: insert "may" after "You" and lowercase the next word. */
function insertedMay(strength: string): string {
  const rest = strength.replace(/^You\s+/i, "");
  const softCore = `You may ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
  return softCore.endsWith(".") ? softCore : `${softCore}.`;
}

describe("hand-written soft insight lines", () => {
  it("stores a soft strength and a soft watch-out on every trait level", () => {
    expect(insightLibraryV1).toHaveLength(15);
    const keys = insightLibraryV1.map((e) => `${e.traitId}:${e.level}`);
    expect(new Set(keys).size).toBe(15);
    for (const entry of insightLibraryV1) {
      expect(entry.strengthSoft.startsWith("You may ")).toBe(true);
      expect(entry.strengthSoft.endsWith(".")).toBe(true);
      expect(entry.watchOutSoft.endsWith(".")).toBe(true);
      expect(entry.watchOutSoft.length).toBeGreaterThan(20);
      expect(entry.tips.length).toBeGreaterThan(0);
    }
  });

  it("does not build soft lines by inserting may after You", () => {
    const source = readFileSync(
      join(process.cwd(), "src/insights/library.ts"),
      "utf8",
    );
    expect(source).not.toContain("You may ${");
    expect(source).not.toMatch(/strengthSoft:\s*`/);
    for (const entry of insightLibraryV1) {
      expect(entry.strengthSoft).not.toBe(insertedMay(entry.strength));
    }
  });

  it("uses the curious and warm lines as natural English", () => {
    const open = insightLibraryV1.find((e) => e.id === "O-high")!;
    const agree = insightLibraryV1.find((e) => e.id === "A-high")!;
    expect(open.strengthSoft).toBe(
      "You may be curious, learn fast, and like new ideas.",
    );
    expect(agree.strengthSoft).toBe(
      "You may be warm, helpful, and easy to trust.",
    );
  });

  it("scans insight lines and product copy for broken may-phrases", () => {
    const hits: string[] = [];
    for (const entry of insightLibraryV1) {
      const lines = [
        entry.strength,
        entry.strengthSoft,
        entry.watchOut,
        entry.watchOutSoft,
        entry.interview,
        entry.cv,
        ...entry.tips,
      ];
      for (const line of lines) {
        if (BAD_MAY.test(line)) hits.push(`${entry.id}: ${line}`);
      }
    }
    const files = COPY_ROOTS.flatMap((root) =>
      walk(join(process.cwd(), root)),
    );
    expect(files.length).toBeGreaterThan(10);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (BAD_MAY.test(text)) hits.push(file);
    }
    expect(hits).toEqual([]);
  });
});
