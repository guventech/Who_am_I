/**
 * Format bank item text for the Likert UI.
 * IPIP stems omit "I"; original X items already include it.
 */
export function formatItemStem(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const withoutTrailing = trimmed.replace(/[.!?]+$/u, "");
  if (/^i\b/i.test(withoutTrailing)) {
    const body = withoutTrailing.replace(/^i\s+/i, "");
    const capped = body.charAt(0).toLowerCase() + body.slice(1);
    return `I ${capped}.`;
  }
  const capped =
    withoutTrailing.charAt(0).toLowerCase() + withoutTrailing.slice(1);
  return `I ${capped}.`;
}
