import { describe, expect, it } from "vitest";
import { deeperChanges } from "@/lib/deeper-changes";
import { copyEn } from "@/copy/en";
import type { TraitScore } from "@/engine/types";

function trait(
  slider: number,
  low: number,
  high: number,
  traitId: TraitScore["traitId"] = "E",
): TraitScore {
  return {
    traitId,
    slider,
    theta: slider,
    sd: 0.5,
    level: "mid",
    confidence: "firm",
    retakeLow: low,
    retakeHigh: high,
    credibleLow: low,
    credibleHigh: high,
    pLow: 0.2,
    pMid: 0.6,
    pHigh: 0.2,
  };
}

describe("actual before and after descriptions", () => {
  it("only reports narrower ranges when they became narrower", () => {
    expect(deeperChanges([trait(0.3, -0.7, 0.7)], [trait(0.35, -0.4, 0.4)])).toEqual([
      copyEn.deeperTraitSimilar("Social energy", "narrower"),
    ]);
  });
  it("reports wider ranges and changed descriptions honestly", () => {
    expect(deeperChanges([trait(0.1, -0.4, 0.4)], [trait(0.3, -0.7, 0.7)])).toEqual([
      copyEn.deeperTraitChanged("Social energy", "A bit more outgoing", "wider"),
    ]);
  });
  it("ignores numerical noise, missing traits and an already existing H trait", () => {
    const lines = deeperChanges(
      [trait(0.3, -0.5, 0.5), trait(0.3, -0.5, 0.5, "H")],
      [trait(0.31, -0.505, 0.505), trait(0.3, -0.5, 0.5, "H")],
    );
    expect(lines).toEqual([
      copyEn.deeperTraitSimilar("Social energy", "similar to before"),
    ]);
    expect(lines.join(" ")).not.toContain("narrower");
  });
  it("announces H only when newly added", () => {
    expect(deeperChanges([], [trait(0.3, -0.5, 0.5, "H")])).toEqual([
      copyEn.deeperAddedH,
    ]);
    expect(deeperChanges([], [])).toEqual([]);
  });
});
