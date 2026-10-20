import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function strip(s: string): string {
  return s.replace(/\u2014/g, " - ");
}

const files = [
  "content/insights/en.bundle.json",
  "content/items/bank.dev.json",
  "src/content/copy.en.ts",
];

for (const f of files) {
  const p = join(process.cwd(), f);
  const t = readFileSync(p, "utf8");
  if (t.includes("\u2014")) writeFileSync(p, strip(t));
}

for (const name of readdirSync("content/insights/en")) {
  if (!name.endsWith(".yaml")) continue;
  const p = join("content/insights/en", name);
  const t = readFileSync(p, "utf8");
  if (t.includes("\u2014")) writeFileSync(p, strip(t));
}

console.log("stripped em dashes");
