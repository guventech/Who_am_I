import { copyEn } from "@/copy/en";
import { colourSummary, type ColourSummaryResult } from "@/lib/colourSummary";
import { colourSummaryCopy } from "@/lib/colour-summary-copy";
import type { TraitScore } from "@/engine/types";

function ColourBody({ result }: { result: ColourSummaryResult }) {
  const text = colourSummaryCopy(result);
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-start gap-2 font-semibold" style={{ color: "var(--ink)" }}>
        {result.kind === "coloured" ? (
          <span
            aria-hidden="true"
            data-testid="colour-dot"
            className="mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full"
            style={{
              background: `var(--colour-${result.primary})`,
              opacity: { light: 0.4, leaning: 0.7, strong: 1 }[result.strength],
            }}
          />
        ) : null}
        <span>{text.headline}</span>
      </p>
      {text.description ? <p>{text.description}</p> : null}
      {text.uncertainty ? (
        <p className="text-[15px]" style={{ color: "var(--muted)" }}>
          {text.uncertainty}
        </p>
      ) : null}
      {result.kind === "coloured" ? (
        <p className="text-[15px]" style={{ color: "var(--muted)" }}>
          {copyEn.colourStrengthExplanation}
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
