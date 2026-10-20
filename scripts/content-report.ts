import { loadInsightLibraryFromYaml } from "../src/insights/load";

const library = loadInsightLibraryFromYaml();
const drafts = library.entries.filter((e) => e.reviewStatus === "draft");
const reviewed = library.entries.filter((e) => e.reviewStatus === "reviewed");

console.log(`Insight library: ${library.entries.length} entries`);
console.log(`  reviewed: ${reviewed.length}`);
console.log(`  draft:    ${drafts.length}`);
console.log("");
if (drafts.length === 0) {
  console.log("No draft entries.");
  process.exit(0);
}
console.log("Draft entries (need human review):");
for (const e of drafts.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(`  - ${e.id}  key=${e.key}  variant=${e.variant}`);
}
