import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  loadItemBank,
  loadItemTextEn,
  loadModelVersion,
} from "../../src/engine/load-content";

describe("content integrity", () => {
  it("every active item has English text", () => {
    const bank = loadItemBank();
    const en = loadItemTextEn();
    for (const item of bank.items) {
      if (item.status === "retired") continue;
      expect(en[item.id], `missing text for ${item.id}`).toBeTypeOf("string");
      expect(en[item.id]!.length).toBeGreaterThan(0);
    }
  });

  it("item hashes match English text (immutability)", () => {
    const model = loadModelVersion();
    const en = loadItemTextEn();
    for (const [id, hash] of Object.entries(model.itemHashes)) {
      const text = en[id];
      expect(text, `hash for unknown id ${id}`).toBeDefined();
      const actual = createHash("sha256").update(text!, "utf8").digest("hex");
      expect(actual).toBe(hash);
    }
  });

  it("bankStatus is dev-uncalibrated and placeholders are labelled", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    expect(model.bankStatus).toBe("dev-uncalibrated");
    expect(bank.placeholderNote.toLowerCase()).toContain("placeholder");
  });
});
