import type { InsightLibrary } from "./types";

export function filterInsightLibrary(
  library: InsightLibrary,
  opts: { allowDrafts: boolean },
): InsightLibrary {
  if (opts.allowDrafts) return library;
  return {
    entries: library.entries.filter((e) => e.reviewStatus === "reviewed"),
  };
}
