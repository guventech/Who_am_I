import { copyEn } from "@/copy/en";
import type { TraitScore } from "@/engine/types";
import { scoreToPhrase, scoreToRangeEnd } from "@/lib/score-phrase";

function position(value: number) {
  return ((Math.max(-1, Math.min(1, value)) + 1) / 2) * 100;
}

export function TraitComparison({
  before,
  after,
}: {
  before: TraitScore;
  after: TraitScore;
}) {
  const meta = copyEn.traits[after.traitId];
  function describe(score: TraitScore) {
    return copyEn.comparisonScoreLabel(
      scoreToPhrase(score.slider, meta.left, meta.right),
      scoreToRangeEnd(score.retakeLow, meta.left, meta.right),
      scoreToRangeEnd(score.retakeHigh, meta.left, meta.right),
    );
  }
  return (
    <div
      className="mt-4"
      role="img"
      data-testid="trait-comparison"
      aria-label={copyEn.deeperComparisonLabel(
        meta.title,
        describe(before),
        describe(after),
      )}
    >
      {(
        [
          { label: copyEn.deeperOriginal, score: before, original: true },
          { label: copyEn.deeperUpdated, score: after, original: false },
        ] as const
      ).map((row) => {
        const low = position(Math.min(row.score.retakeLow, row.score.retakeHigh));
        const high = position(Math.max(row.score.retakeLow, row.score.retakeHigh));
        return (
          <div
            key={row.label}
            className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 py-2"
            aria-hidden="true"
          >
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {row.label}
            </span>
            <div
              className="relative h-3 rounded-md"
              style={{ background: "var(--track)" }}
            >
              <span
                className="absolute inset-y-0 rounded-md"
                data-testid={row.original ? "original-range" : "updated-range"}
                style={{
                  left: `${low}%`,
                  width: `${high - low}%`,
                  background: row.original ? "var(--line)" : "var(--band)",
                  border: row.original
                    ? "1px dashed var(--muted)"
                    : "1px solid var(--accent)",
                }}
              />
              <span
                className="absolute top-[-4px] h-5 w-px"
                style={{ left: "50%", background: "var(--mid)" }}
              />
              <span
                className="absolute top-[-3px] h-[18px] w-[18px] -translate-x-1/2 rounded-full"
                data-testid={row.original ? "original-dot" : "updated-dot"}
                style={{
                  left: `${position(row.score.slider)}%`,
                  background: row.original ? "var(--card)" : "var(--accent)",
                  border: row.original
                    ? "2px solid var(--muted)"
                    : "2px solid var(--card)",
                  outline: row.original ? undefined : "1px solid var(--accent)",
                }}
              />
            </div>
          </div>
        );
      })}
      <div
        className="ml-20 mt-1 flex justify-between gap-3 text-sm"
        aria-hidden="true"
        style={{ color: "var(--muted)" }}
      >
        <span>{meta.left}</span>
        <span className="text-right">{meta.right}</span>
      </div>
    </div>
  );
}
