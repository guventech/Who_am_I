import { copyEn } from "@/content/copy.en";
import type { LevelConfidence, TraitMeta, TraitScore } from "@/engine/types";
import {
  formatSignedSlider,
  traitSliderAriaLabel,
} from "@/lib/trait-slider-label";

type Props = {
  trait: TraitMeta;
  score: TraitScore;
};

const WIDTH = 320;
const HEIGHT = 56;
const PAD = 16;
const AXIS_Y = 28;

function xOf(slider: number): number {
  const t = (slider + 1) / 2;
  return PAD + t * (WIDTH - PAD * 2);
}

export function TraitSlider({ trait, score }: Props) {
  const unclear = score.confidence === "unclear";
  const lowX = xOf(Math.max(-1, Math.min(1, score.retakeLow)));
  const highX = xOf(Math.max(-1, Math.min(1, score.retakeHigh)));
  const pointX = xOf(Math.max(-1, Math.min(1, score.slider)));
  const bandWidth = Math.max(2, highX - lowX);
  const patternId = `band-hatch-${trait.id}`;

  const aria = traitSliderAriaLabel({
    traitName: trait.name,
    slider: score.slider,
    poleLow: trait.poleLow,
    poleHigh: trait.poleHigh,
    retakeLow: score.retakeLow,
    retakeHigh: score.retakeHigh,
    confidence: score.confidence,
  });

  return (
    <section
      className={`flex flex-col gap-2 ${unclear ? "opacity-70" : ""}`}
      aria-label={aria}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-slate-900">{trait.name}</h3>
        <span className="font-mono text-sm tabular-nums text-slate-700">
          {formatSignedSlider(score.slider)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-14 w-full max-w-md"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern
            id={patternId}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="#64748b"
              strokeWidth="1.5"
              opacity="0.55"
            />
          </pattern>
        </defs>

        {/* Retake band: fill + hatch + outline (not colour-only) */}
        <rect
          x={lowX}
          y={AXIS_Y - 10}
          width={bandWidth}
          height={20}
          fill={`url(#${patternId})`}
          opacity={unclear ? 0.45 : 0.7}
        />
        <rect
          x={lowX}
          y={AXIS_Y - 10}
          width={bandWidth}
          height={20}
          fill="#94a3b8"
          opacity={0.25}
          stroke="#475569"
          strokeWidth={1.5}
        />

        {/* Axis */}
        <line
          x1={PAD}
          y1={AXIS_Y}
          x2={WIDTH - PAD}
          y2={AXIS_Y}
          stroke="#334155"
          strokeWidth={2}
        />
        {/* Centre tick */}
        <line
          x1={xOf(0)}
          y1={AXIS_Y - 8}
          x2={xOf(0)}
          y2={AXIS_Y + 8}
          stroke="#334155"
          strokeWidth={2}
        />
        {/* End ticks */}
        <line
          x1={PAD}
          y1={AXIS_Y - 5}
          x2={PAD}
          y2={AXIS_Y + 5}
          stroke="#334155"
          strokeWidth={2}
        />
        <line
          x1={WIDTH - PAD}
          y1={AXIS_Y - 5}
          x2={WIDTH - PAD}
          y2={AXIS_Y + 5}
          stroke="#334155"
          strokeWidth={2}
        />

        {/* Point marker */}
        <circle
          cx={pointX}
          cy={AXIS_Y}
          r={7}
          fill={unclear ? "#94a3b8" : "#0f172a"}
          stroke="#f8fafc"
          strokeWidth={2}
        />
      </svg>

      <div className="flex justify-between gap-4 text-xs leading-snug text-slate-600">
        <span className="max-w-[45%]">{trait.poleLow}</span>
        <span className="max-w-[45%] text-right">{trait.poleHigh}</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-700">
        {levelBlurb(score.level, score.confidence, trait)}
      </p>
    </section>
  );
}

function levelBlurb(
  level: TraitScore["level"],
  confidence: LevelConfidence,
  trait: TraitMeta,
): string {
  if (confidence === "unclear") return copyEn.unclearTrait;
  if (level === "low") return `Tends toward ${shortPole(trait.poleLow)}.`;
  if (level === "high") return `Tends toward ${shortPole(trait.poleHigh)}.`;
  return "In between / depends on the situation.";
}

function shortPole(pole: string): string {
  return pole.split("—")[0]?.trim() ?? pole;
}
