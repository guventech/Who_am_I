import { copyEn } from "@/copy/en";
import type { TraitId, TraitScore } from "@/engine/types";
import { formatScoreNumber, isLessCertain, scoreToPhrase } from "@/lib/score-phrase";

type Props = {
  traitId: TraitId;
  score: TraitScore;
};

function pct(v: number): number {
  return ((v + 1) / 2) * 100;
}

export function TraitCard({ traitId, score }: Props) {
  const meta = copyEn.traits[traitId as keyof typeof copyEn.traits];
  if (!meta) return null;

  const less = isLessCertain(score.retakeLow, score.retakeHigh);
  const phrase = scoreToPhrase(score.slider, meta.left, meta.right);
  const left = Math.min(pct(score.retakeLow), pct(score.retakeHigh));
  const width = Math.abs(pct(score.retakeHigh) - pct(score.retakeLow));
  const dot = pct(Math.max(-1, Math.min(1, score.slider)));

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--card)", borderColor: "var(--line)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
          {meta.title}{" "}
          <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>
            ({meta.science})
          </span>
        </h3>
      </div>
      <p className="mt-1 font-semibold" style={{ color: "var(--ink)" }}>
        {phrase}.{" "}
        <span className="text-[13px] font-normal" style={{ color: "var(--muted)" }}>
          {formatScoreNumber(score.slider)}
        </span>
        {less ? (
          <span className="ml-1 text-[13px] font-medium" style={{ color: "var(--less)" }}>
            {copyEn.lessCertain}
          </span>
        ) : null}
      </p>

      <div
        className="relative mt-3 mb-2 h-3 w-full rounded-md"
        style={{ background: "var(--track)" }}
        role="img"
        aria-label={`${meta.title}: ${phrase}`}
      >
        <div
          className="absolute top-0 h-3 rounded-md"
          style={{
            left: `${left}%`,
            width: `${Math.max(2, width)}%`,
            background: "var(--band)",
          }}
        />
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "-4px",
            width: 2,
            height: 20,
            background: "var(--mid)",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            left: `${dot}%`,
            top: -5,
            width: 22,
            height: 22,
            marginLeft: -11,
            background: "var(--accent)",
            border: "3px solid #fff",
            boxShadow: "0 1px 3px #0004",
          }}
        />
      </div>

      <div
        className="flex justify-between gap-4 text-sm"
        style={{ color: "#3e4c59" }}
      >
        <span className="max-w-[45%]">
          <b className="block" style={{ color: "var(--ink)" }}>
            {meta.left}
          </b>
          {meta.leftDesc}
        </span>
        <span className="max-w-[45%] text-right">
          <b className="block" style={{ color: "var(--ink)" }}>
            {meta.right}
          </b>
          {meta.rightDesc}
        </span>
      </div>
    </div>
  );
}
