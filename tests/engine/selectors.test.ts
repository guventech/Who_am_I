import { describe, expect, it } from "vitest";
import { createRng } from "../../src/engine/math";
import { AdaptiveSelector } from "../../src/engine/select-adaptive";
import { FixedSelector, shuffleFixedForm } from "../../src/engine/select-fixed";
import { loadItemBank, loadModelVersion } from "../../src/engine/load-content";
import type { SessionState } from "../../src/engine/types";
import { TRAIT_IDS } from "../../src/engine/types";

describe("selectors", () => {
  it("fixed selector returns 10 unique items covering all traits", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    expect(model.fixedFormOrder.length).toBe(10);

    const selector = new FixedSelector();
    const rng = createRng(1);
    const state: SessionState = { seed: 99, answered: [], usedItemIds: [] };
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) {
      const id = selector.next(state, bank, model, rng);
      expect(id).toBeTruthy();
      ids.push(id!);
      state.answered.push({ itemId: id!, value: 3, rtMs: 2000, order: i });
      state.usedItemIds.push(id!);
    }
    expect(new Set(ids).size).toBe(10);
    expect(selector.next(state, bank, model, rng)).toBeNull();

    const byId = new Map(bank.items.map((i) => [i.id, i]));
    const traits = new Set(ids.map((id) => byId.get(id)!.primaryTrait));
    for (const t of TRAIT_IDS) expect(traits.has(t)).toBe(true);
  });

  it("shuffleFixedForm never has 3 consecutive same primary", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const byId = new Map(bank.items.map((i) => [i.id, i]));
    for (let seed = 0; seed < 20; seed++) {
      const order = shuffleFixedForm(model.fixedFormOrder, bank, seed);
      for (let i = 2; i < order.length; i++) {
        const a = byId.get(order[i - 2]!)!.primaryTrait;
        const b = byId.get(order[i - 1]!)!.primaryTrait;
        const c = byId.get(order[i]!)!.primaryTrait;
        expect(!(a === b && b === c)).toBe(true);
      }
    }
  });

  it("adaptive Q1 is deterministic at prior", () => {
    const bank = loadItemBank();
    const model = loadModelVersion();
    const a = new AdaptiveSelector();
    const b = new AdaptiveSelector();
    const state: SessionState = { seed: 1, answered: [], usedItemIds: [] };
    const id1 = a.next(state, bank, model, createRng(1));
    const id2 = b.next(state, bank, model, createRng(999));
    expect(id1).toBe(id2);
  });
});
