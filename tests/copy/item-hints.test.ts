import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { itemHints } from "@/copy/en";
import { formatItemStem } from "@/lib/item-display";

const en = JSON.parse(
  readFileSync(join(process.cwd(), "content/items/en.json"), "utf8"),
) as Record<string, string>;

const FIXED = [
  "X01",
  "C01",
  "A01",
  "O01",
  "ES01",
  "O02",
  "C02",
  "A02",
  "E01",
  "ES02",
] as const;

const HH = ["HH01", "HH02", "HH03", "HH04", "HH05", "HH06"] as const;

describe("item hints", () => {
  it("covers every English stem used in the bank text file", () => {
    for (const id of Object.keys(en)) {
      expect(itemHints[id], `missing hint for ${id}`).toBeTruthy();
      expect(itemHints[id]).toMatch(/^\(/);
      expect(itemHints[id]).toMatch(/\)$/);
      expect(itemHints[id]).not.toMatch(/—/);
    }
  });

  it("formats fixed-form and H-H stems as full I-sentences", () => {
    for (const id of [...FIXED, ...HH]) {
      const stem = formatItemStem(en[id]!);
      expect(stem.startsWith("I ")).toBe(true);
      expect(stem.endsWith(".")).toBe(true);
    }
  });
});
