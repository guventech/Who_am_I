import { describe, expect, it } from "vitest";
import { loadItemBank, loadModelVersion } from "@/engine/load-content";
import { sampleResponse } from "@/engine/grm";
import { itemById } from "@/engine/grid";
import { cholesky, createRng, matVec } from "@/engine/math";
import { scoreSession } from "@/engine/score";
import { shuffleFixedForm } from "@/engine/select-fixed";
import { CORE_TRAIT_IDS, type AnsweredItem } from "@/engine/types";
import { copyEn } from "@/copy/en";
import {
  formatScoreNumber,
  isLessCertain,
  LESS_CERTAIN_RANGE_WIDTH,
  scoreToPhrase,
  scoreToRangeEnd,
} from "@/lib/score-phrase";

describe("scoreToPhrase", () => {
  it("maps band edges without population claims or decimals", () => {
    expect(scoreToPhrase(-0.6, "Reserved", "Outgoing")).toBe(
      "Clearly more reserved",
    );
    expect(scoreToPhrase(-0.2, "Reserved", "Outgoing")).toBe(
      "A bit more reserved",
    );
    expect(scoreToPhrase(0.2, "Reserved", "Outgoing")).toBe(
      "A bit more outgoing",
    );
    expect(scoreToPhrase(0.6, "Reserved", "Outgoing")).toBe(
      "Clearly more outgoing",
    );
    expect(scoreToPhrase(0, "Reserved", "Outgoing")).toContain(
      "About in the middle",
    );
    expect(scoreToPhrase(0.42, "Reserved", "Outgoing")).not.toMatch(/\d/);
  });

  it("uses a natural comparative for every trait pole", () => {
    const expected: Array<[number, string, string, string]> = [
      [-0.8, "Reserved", "Outgoing", "Clearly more reserved"],
      [-0.3, "Reserved", "Outgoing", "A bit more reserved"],
      [0.3, "Reserved", "Outgoing", "A bit more outgoing"],
      [0.8, "Reserved", "Outgoing", "Clearly more outgoing"],
      [-0.8, "Direct", "Cooperative", "Clearly more direct"],
      [-0.3, "Direct", "Cooperative", "A bit more direct"],
      [0.3, "Direct", "Cooperative", "A bit more cooperative"],
      [0.8, "Direct", "Cooperative", "Clearly more cooperative"],
      [-0.8, "Flexible", "Organised", "Clearly more flexible"],
      [-0.3, "Flexible", "Organised", "A bit more flexible"],
      [0.3, "Flexible", "Organised", "A bit more organised"],
      [0.8, "Flexible", "Organised", "Clearly more organised"],
      [-0.8, "Sensitive", "Calm", "Clearly more sensitive"],
      [-0.3, "Sensitive", "Calm", "A bit more sensitive"],
      [0.3, "Sensitive", "Calm", "A bit calmer"],
      [0.8, "Sensitive", "Calm", "Clearly calmer"],
      [-0.8, "Practical", "Curious", "Clearly more practical"],
      [-0.3, "Practical", "Curious", "A bit more practical"],
      [0.3, "Practical", "Curious", "A bit more curious"],
      [0.8, "Practical", "Curious", "Clearly more curious"],
    ];
    for (const [s, left, right, phrase] of expected) {
      expect(scoreToPhrase(s, left, right)).toBe(phrase);
    }
    const awkward =
      /\bmore (calm|warm|cool|kind|nice|quiet|shy|bold|clear|simple|soft|firm|fair|cold)\b/i;
    for (const trait of Object.values(copyEn.traits)) {
      for (const s of [-1, -0.4, 0.4, 1]) {
        const phrase = scoreToPhrase(s, trait.left, trait.right);
        expect(phrase).not.toMatch(awkward);
      }
    }
  });
});

describe("scoreToRangeEnd", () => {
  it("uses pole words, not lower or higher", () => {
    expect(scoreToRangeEnd(-0.3, "Reserved", "Outgoing")).toBe(
      "a bit more reserved",
    );
    expect(scoreToRangeEnd(0, "Reserved", "Outgoing")).toBe("about the middle");
    expect(scoreToRangeEnd(0.7, "Sensitive", "Calm")).toBe("clearly calmer");
    expect(scoreToRangeEnd(0.42, "Reserved", "Outgoing")).not.toMatch(
      /lower|higher/i,
    );
  });
});

describe("formatScoreNumber", () => {
  it("never shows negative zero", () => {
    expect(formatScoreNumber(-0)).toBe("0.00");
    expect(formatScoreNumber(0)).toBe("0.00");
    expect(formatScoreNumber(-0.0001)).toBe("0.00");
    expect(formatScoreNumber(-0.004)).toBe("0.00");
    expect(formatScoreNumber(0.004)).toBe("0.00");
    expect(formatScoreNumber(-0.06)).toBe("-0.06");
    expect(formatScoreNumber(0.83)).toBe("+0.83");
    expect(formatScoreNumber(-0.5)).toBe("-0.50");
  });
});

describe("isLessCertain", () => {
  it("uses LESS_CERTAIN_RANGE_WIDTH above a typical retake width", () => {
    expect(LESS_CERTAIN_RANGE_WIDTH).toBe(1.4);
    expect(isLessCertain(-0.7, 0.7)).toBe(false); // width 1.4
    expect(isLessCertain(-0.701, 0.701)).toBe(true); // width 1.402
    // Widths around the fixed-form sim mean (~1.17) stay untagged.
    expect(isLessCertain(-0.58, 0.59)).toBe(false);
  });

  it("tags a minority of traits on typical fixed-form answers", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const L = cholesky(model.priorCov, 5);
    const rng = createRng(42);
    const people = 8;
    let tagged = 0;
    let total = 0;
    for (let i = 0; i < people; i++) {
      const z = [0, 0, 0, 0, 0].map(() => {
        const u1 = Math.max(rng.next(), 1e-12);
        const u2 = rng.next();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      });
      const theta = matVec(L, z, 5);
      const order = shuffleFixedForm(model.fixedFormOrder, bank, 1000 + i);
      const answered: AnsweredItem[] = order.map((id, idx) => ({
        itemId: id,
        value: sampleResponse(itemById(bank, id), theta, rng.next()),
        rtMs: 1500 + rng.int(2000),
        order: idx,
      }));
      const scored = scoreSession(bank, model, answered);
      const core = scored.traits.filter((t) =>
        (CORE_TRAIT_IDS as readonly string[]).includes(t.traitId),
      );
      for (const trait of core) {
        total++;
        if (isLessCertain(trait.retakeLow, trait.retakeHigh)) tagged++;
      }
    }
    expect(total).toBe(people * 5);
    expect(tagged / total).toBeGreaterThan(0);
    expect(tagged / total).toBeLessThan(0.5);
  }, 30_000);

  it("does not tag every trait when varied answers are fast", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const values = [1, 5, 2, 4, 3, 5, 1, 4, 2, 3] as const;
    const answered: AnsweredItem[] = model.fixedFormOrder.map((id, idx) => ({
      itemId: id,
      value: values[idx]!,
      rtMs: 400,
      order: idx,
    }));
    const scored = scoreSession(bank, model, answered);
    expect(scored.flags.fast).toBe(true);
    const core = scored.traits.filter((t) =>
      (CORE_TRAIT_IDS as readonly string[]).includes(t.traitId),
    );
    const tagged = core.filter((t) =>
      isLessCertain(t.retakeLow, t.retakeHigh),
    );
    expect(tagged.length).toBeGreaterThan(0);
    expect(tagged.length).toBeLessThan(core.length);
  });
});
