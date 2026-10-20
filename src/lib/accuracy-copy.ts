import type { ModelConfig } from "@/engine/types";

/**
 * User-facing accuracy sentence. Returns null when claims are empty so the UI
 * never invents numbers (brief: ACCURACY_CLAIMS empty ⇒ omit).
 */
export function accuracySentenceFromClaims(
  claims: ModelConfig["ACCURACY_CLAIMS"],
): string | null {
  const range = claims.corrWithLongTest;
  const retest = claims.retest;
  if (!range && retest == null) return null;

  const parts: string[] = [];
  if (range) {
    parts.push(
      `Agreement with a longer test in our sample is roughly ${fmt(range[0])} to ${fmt(range[1])}.`,
    );
  }
  if (retest != null) {
    parts.push(`Typical retest agreement is about ${fmt(retest)}.`);
  }
  parts.push("Your ranges show where a retake will usually land.");
  return parts.join(" ");
}

function fmt(n: number): string {
  return n.toFixed(2);
}
