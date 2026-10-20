import bundle from "../../content/insights/en.bundle.json";
import { env } from "@/config/env";
import { filterInsightLibrary } from "./filter-drafts";
import { insightLibrarySchema } from "./schema";
import type { InsightLibrary } from "./types";

/** Browser-safe insight library (static JSON import). */
export function getInsightLibrary(): InsightLibrary {
  const parsed = insightLibrarySchema.parse(bundle);
  return filterInsightLibrary(parsed, {
    allowDrafts: env.ALLOW_DRAFT_CONTENT,
  });
}
