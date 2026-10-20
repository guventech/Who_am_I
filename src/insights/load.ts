import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { insightEntrySchema, insightLibrarySchema } from "./schema";
import type { InsightLibrary } from "./types";

const EN_DIR = join(process.cwd(), "content/insights/en");
const BUNDLE = join(process.cwd(), "content/insights/en.bundle.json");

/** Load all EN insight YAML files (Node / scripts / tests). */
export function loadInsightLibraryFromYaml(
  dir = EN_DIR,
): InsightLibrary {
  const files = readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  const entries = files.map((file) => {
    const raw = parseYaml(readFileSync(join(dir, file), "utf8"));
    return insightEntrySchema.parse(raw);
  });
  return insightLibrarySchema.parse({ entries });
}

/** Load the JSON bundle (same content as YAML; used when fs walk is awkward). */
export function loadInsightLibraryFromBundle(
  path = BUNDLE,
): InsightLibrary {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return insightLibrarySchema.parse(raw);
}
