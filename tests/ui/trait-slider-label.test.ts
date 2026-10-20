import { describe, expect, it } from "vitest";
import { traitSliderAriaLabel } from "@/lib/trait-slider-label";

describe("traitSliderAriaLabel", () => {
  it("names trait, signed value, poles, and retake range", () => {
    const label = traitSliderAriaLabel({
      traitName: "Extraversion",
      slider: 0.75,
      poleLow: "Reserved",
      poleHigh: "Outgoing",
      retakeLow: 0.45,
      retakeHigh: 0.95,
      confidence: "firm",
    });
    expect(label).toContain("Extraversion");
    expect(label).toContain("+0.75");
    expect(label).toContain("Reserved");
    expect(label).toContain("Outgoing");
    expect(label).toContain("+0.45");
    expect(label).toContain("+0.95");
  });

  it("marks unclear traits", () => {
    const label = traitSliderAriaLabel({
      traitName: "Openness",
      slider: 0.1,
      poleLow: "Practical",
      poleHigh: "Curious",
      retakeLow: -0.5,
      retakeHigh: 0.6,
      confidence: "unclear",
    });
    expect(label.toLowerCase()).toContain("unclear");
  });
});
