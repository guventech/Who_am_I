/**
 * One-shot content patch for REVIEW_phase6 M1/M5/M6.
 * - Activate X01 as FIXED_FIRST
 * - Retire H01–H06 placeholders; add HH01–HH06 IPIP-HEXACO (exact text from ipip.ori.org)
 * - Add DEEPER_BUDGET_MIN / FIXED_FIRST_ITEM_ID; document DEEPER_SD_TARGET
 * - Recompute itemHashes; rebuild fixed form
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildFixedFormOrder } from "../src/engine/select-fixed";
import type { Item, ItemBank, ModelVersion } from "../src/engine/types";

const root = process.cwd();
const bankPath = join(root, "content/items/bank.dev.json");
const enPath = join(root, "content/items/en.json");
const modelPath = join(root, "content/model/model-v0-dev.json");
const deeperPath = join(root, "content/model/model-v0-dev-deeper.json");

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** Exact strings from https://ipip.ori.org/newhexaco_pi_key.htm (Honesty-Humility). */
const HH_ITEMS: {
  id: string;
  text: string;
  keyed: 1 | -1;
}[] = [
  {
    id: "HH01",
    text: "Don't pretend to be more than I am.",
    keyed: 1,
  },
  {
    id: "HH02",
    text: "Would never take things that aren't mine.",
    keyed: 1,
  },
  {
    id: "HH03",
    text: "Would not enjoy being a famous celebrity.",
    keyed: 1,
  },
  {
    id: "HH04",
    text: "Don't think that I'm better than other people.",
    keyed: 1,
  },
  {
    id: "HH05",
    text: "Use flattery to get ahead.",
    keyed: -1,
  },
  {
    id: "HH06",
    text: "Cheat to get ahead.",
    keyed: -1,
  },
];

const bank = JSON.parse(readFileSync(bankPath, "utf8")) as ItemBank;
const en = JSON.parse(readFileSync(enPath, "utf8")) as Record<string, string>;
const model = JSON.parse(readFileSync(modelPath, "utf8")) as ModelVersion;
const deeper = JSON.parse(readFileSync(deeperPath, "utf8")) as ModelVersion;

for (const item of bank.items) {
  if (item.id === "X01") {
    item.status = "active";
    item.isAnchor = true;
  }
  if (/^H0[1-6]$/.test(item.id)) {
    item.status = "retired";
  }
}

const retiredIds = new Set(["H01", "H02", "H03", "H04", "H05", "H06"]);
bank.items = bank.items.filter((i) => !HH_ITEMS.some((h) => h.id === i.id));

for (const h of HH_ITEMS) {
  const item: Item = {
    id: h.id,
    pool: "deeper",
    primaryTrait: "H",
    loadings: { H: 1.2 },
    thresholds: [-1.8, -0.7, 0.4, 1.5],
    keyed: h.keyed,
    isAnchor: false,
    status: "active",
    source: "ipip-hexaco",
    sourceVerified: true,
    version: 1,
  };
  bank.items.push(item);
  en[h.id] = h.text;
}

for (const id of retiredIds) {
  // Keep retired placeholder text out of production display; mark clearly.
  if (en[id]?.includes("placeholder") || !en[id]) {
    delete en[id];
  }
}

const hashes: Record<string, string> = {};
for (const item of bank.items) {
  const text = en[item.id];
  if (text) hashes[item.id] = sha256(text);
}

function patchConfig(m: ModelVersion, opts: { sd: number; note?: string }) {
  m.config.FIXED_FIRST_ITEM_ID = "X01";
  m.config.DEEPER_BUDGET_MIN = 12;
  m.config.DEEPER_BUDGET_MAX = 20;
  m.config.DEEPER_SD_TARGET = opts.sd;
  m.itemHashes = hashes;
  // Loosen unclear threshold for uncalibrated bank (S7: sim-report 48% → aim <30%).
  m.config.UNCLEAR_WIDTH = 1.35;
}

patchConfig(model, { sd: 0.35 });
// Dev bank: 0.65 so 7-node grid + placeholder params can hit the stop rule (see REPORT.md).
patchConfig(deeper, { sd: 0.65 });

model.fixedFormOrder = buildFixedFormOrder(bank, model, 10);

writeFileSync(bankPath, JSON.stringify(bank, null, 2) + "\n");
writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
writeFileSync(modelPath, JSON.stringify(model, null, 2) + "\n");
writeFileSync(deeperPath, JSON.stringify(deeper, null, 2) + "\n");

console.log("X01 active/anchor; H01-H06 retired; HH01-HH06 added");
console.log("fixedFormOrder:", model.fixedFormOrder.join(", "));
console.log("FIXED_FIRST:", model.config.FIXED_FIRST_ITEM_ID);
console.log("DEEPER_BUDGET_MIN:", model.config.DEEPER_BUDGET_MIN);
