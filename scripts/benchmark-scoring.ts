import { performance } from "node:perf_hooks";
import { loadItemBank, loadModelVersion } from "../src/engine/load-content";
import { scoreSession } from "../src/engine/score";

// Local, synthetic benchmark. Never sends answers or traffic to production.
const bank = loadItemBank();
const model = loadModelVersion();
const answers = model.fixedFormOrder.slice(0, 10).map((itemId, order) => ({
  itemId,
  order,
  value: ((order % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  rtMs: 2000,
}));
const samples: number[] = [];
for (let i = 0; i < 12; i++) {
  const start = performance.now();
  scoreSession(bank, model, answers);
  samples.push(performance.now() - start);
}
const sorted = samples.slice(1).sort((a, b) => a - b);
const memory = process.memoryUsage();
console.log(
  JSON.stringify(
    {
      model: model.id,
      samples: sorted.length,
      coldMs: Math.round(samples[0]!),
      warmMedianMs: Math.round(sorted[Math.floor(sorted.length / 2)]!),
      warmMaxMs: Math.round(sorted[sorted.length - 1]!),
      processRssMiB: Math.round(memory.rss / 1024 ** 2),
      arrayBuffersMiB: +(memory.arrayBuffers / 1024 ** 2).toFixed(1),
      note: "Synthetic local timing; process RSS includes the TS runner. Not Vercel capacity.",
    },
    null,
    2,
  ),
);
