import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildFixedFormOrder } from "../src/engine/select-fixed";
import { loadItemBank, loadModelVersion } from "../src/engine/load-content";

const modelPath = join(process.cwd(), "content/model/model-v0-dev.json");
const bank = loadItemBank();
const model = loadModelVersion();
const order = buildFixedFormOrder(bank, model, 10);

if (order.length !== 10) {
  console.error(`Expected 10 items, got ${order.length}`);
  process.exit(1);
}

model.fixedFormOrder = order;
writeFileSync(modelPath, JSON.stringify(model, null, 2) + "\n");
console.log("fixedFormOrder:", order.join(", "));
