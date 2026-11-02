import { copyEn } from "@/copy/en";
import {
  colourSummary,
  type ColourId,
  type ColourSummaryResult,
} from "@/lib/colourSummary";
import type { TraitScore } from "@/engine/types";

function labelFor(id: ColourId): string {
  return copyEn.colourLabels[id];
}

function ColourBody({ result }: { result: ColourSummaryResult }) {
  if (result.kind === "balanced") {
    return <p style={{ color: "var(--ink)" }}>{copyEn.colourBalanced}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      <p style={{ color: "var(--ink)" }}>{labelFor(result.primary)}</p>
      {result.secondary ? (
        <p style={{ color: "var(--muted)" }}>
          {copyEn.colourSecondary}: {labelFor(result.secondary)}
        </p>
      ) : null}
    </div>
  );
}

/** Optional SPEC §11 colour layer. Render only when ENABLE_COLOURS is true. */
export function ColourSummary({ traits }: { traits: TraitScore[] }) {
  const result = colourSummary(traits);
  return (
    <section
      data-testid="colour-summary"
      className="mt-10"
      aria-labelledby="colour-summary-heading"
    >
      <h2
        id="colour-summary-heading"
        className="text-[22px]"
        style={{ color: "var(--ink)" }}
      >
        {copyEn.colourHeading}
      </h2>
      <div className="mt-3">
        <ColourBody result={result} />
      </div>
      <p className="mt-3 text-[15px]" style={{ color: "var(--muted)" }}>
        {copyEn.colourDisclaimer}
      </p>
    </section>
  );
}
