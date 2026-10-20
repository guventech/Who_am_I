import { describe, expect, it } from "vitest";
import { computeQualityFlags } from "../../src/engine/flags";
import type { AnsweredItem } from "../../src/engine/types";

function make(values: number[], rtMs: number[]): AnsweredItem[] {
  return values.map((value, order) => ({
    itemId: `I${order}`,
    value: value as 1 | 2 | 3 | 4 | 5,
    rtMs: rtMs[order] ?? 2000,
    order,
  }));
}

describe("quality flags", () => {
  it("flags fast responding", () => {
    const flags = computeQualityFlags(
      make([1, 2, 3, 4, 5, 1, 2, 3, 4, 5], [500, 500, 500, 2000, 2000, 2000, 2000, 2000, 2000, 2000]),
    );
    expect(flags.fast).toBe(true);
  });

  it("flags straight-lining", () => {
    const flags = computeQualityFlags(
      make([3, 3, 3, 3, 3, 3, 3, 3, 2, 1], Array(10).fill(2000)),
    );
    expect(flags.straightline).toBe(true);
  });
});
