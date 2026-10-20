import type { SelectedInsights } from "./types";

const NOTE =
  "Only use these lines if you have a real example that backs them up.";

/** Indefinite article for a following word (ASCII vowel heuristic). */
export function aOrAn(word: string): "a" | "an" {
  const first = word.trim().match(/[a-z]/i)?.[0]?.toLowerCase();
  if (!first) return "a";
  return "aeiou".includes(first) ? "an" : "a";
}

/** Replace `a ` / `an ` before a word with the correct article. */
export function withArticle(word: string): string {
  return `${aOrAn(word)} ${word.trim()}`;
}

/**
 * Replace bracket fill-ins in CV lines for on-screen display.
 * Keeps the line usable without literal `[context]` / `[result]`.
 */
export function fillInsightPlaceholders(text: string): string {
  return text
    .replaceAll("[context]", "(your project)")
    .replaceAll("[result]", "(your result)");
}

/** Plain-text export for "Copy my insights as text". */
export function formatInsightsAsText(selected: SelectedInsights): string {
  const lines: string[] = [];
  lines.push("Who Am I? - insights (draft content may be unreviewed)");
  lines.push("");
  lines.push(NOTE);
  lines.push("");

  if (selected.fallback) {
    lines.push("Your results are still broad. More questions can help when available.");
    lines.push("");
  }

  if (selected.strengths.length) {
    lines.push("Strengths to shine with");
    for (const s of selected.strengths) {
      const mark = s.soft ? " ◌ less certain" : "";
      lines.push(`- ${s.title}${mark}`);
      lines.push(`  Interview: ${s.interviewLine}`);
      lines.push(
        `  CV/LinkedIn: ${fillInsightPlaceholders(s.cvLine)}`,
      );
      lines.push(`  Team: ${s.teamLine}`);
    }
    lines.push("");
  }

  if (selected.watchOuts.length) {
    lines.push("Watch-outs");
    for (const w of selected.watchOuts) {
      const mark = w.soft ? " ◌ less certain" : "";
      lines.push(`- ${w.text}${mark}`);
    }
    lines.push("");
  }

  if (selected.improve.length) {
    lines.push("Things to improve");
    for (const i of selected.improve) {
      const mark = i.soft ? " ◌ less certain" : "";
      lines.push(`- ${i.area}${mark}`);
      for (const a of i.actions) lines.push(`  • ${a}`);
    }
    lines.push("");
  }

  if (selected.workWithOthers.length) {
    lines.push("Working best with others");
    for (const w of selected.workWithOthers) {
      const mark = w.soft ? " ◌ less certain" : "";
      lines.push(`- ${w.text}${mark}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
