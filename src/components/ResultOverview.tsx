import { copyEn } from "@/copy/en";
import type { TraitScore } from "@/engine/types";
import type { SelectedInsightsV1 } from "@/insights/select-v1";
import { isLessCertain, scoreToPhrase } from "@/lib/score-phrase";
import { LessCertainMark } from "@/components/LessCertainMark";

export function ResultOverview({
  traits,
  insights,
}: {
  traits: TraitScore[];
  insights: SelectedInsightsV1;
}) {
  const highlights = [...traits]
    .sort((a, b) => Math.abs(b.slider) - Math.abs(a.slider))
    .slice(0, 2);
  const action =
    insights.watchOuts.flatMap((w) => w.tips).find((tip) => tip.trim()) ??
    copyEn.oneActionFallback;
  return (
    <section
      className="mt-6"
      aria-labelledby="result-overview-heading"
      data-testid="result-overview"
    >
      <h2 id="result-overview-heading" className="text-[22px]">
        {copyEn.resultOverviewHeading}
      </h2>
      <ul className="mt-3 space-y-2">
        {highlights.map((score) => {
          const meta = copyEn.traits[score.traitId];
          return (
            <li key={score.traitId}>
              <span className="font-semibold">{meta.title}: </span>
              {scoreToPhrase(score.slider, meta.left, meta.right)}.
              {isLessCertain(score.retakeLow, score.retakeHigh) ? (
                <LessCertainMark />
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-l-2 pl-4" style={{ borderColor: "var(--accent)" }}>
        <h3 className="font-semibold">{copyEn.oneActionHeading}</h3>
        <p className="mt-1">{action}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {copyEn.oneActionHint}
        </p>
      </div>
    </section>
  );
}
