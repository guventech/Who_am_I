/**
 * One-shot generator for DEV PLACEHOLDER bank + EN text + model skeleton.
 * Parameters are NOT calibrated — see WHO_AM_I brief Appendix B.
 */
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const THRESHOLDS: [number, number, number, number] = [-1.8, -0.7, 0.4, 1.5];
const A = 1.2;

type Trait = "E" | "A" | "C" | "ES" | "O";

const TEXTS: Record<Trait, { text: string; reverse: boolean }[]> = {
  E: [
    { text: "Am the life of the party", reverse: false },
    { text: "Don't talk a lot", reverse: true },
    { text: "Feel comfortable around people", reverse: false },
    { text: "Keep in the background", reverse: true },
    { text: "Start conversations", reverse: false },
    { text: "Have little to say", reverse: true },
    { text: "Talk to a lot of different people at parties", reverse: false },
    { text: "Don't like to draw attention to myself", reverse: true },
    { text: "Don't mind being the center of attention", reverse: false },
    { text: "Am quiet around strangers", reverse: true },
  ],
  A: [
    { text: "Feel little concern for others", reverse: true },
    { text: "Am interested in people", reverse: false },
    { text: "Insult people", reverse: true },
    { text: "Sympathize with others' feelings", reverse: false },
    { text: "Am not interested in other people's problems", reverse: true },
    { text: "Have a soft heart", reverse: false },
    { text: "Am not really interested in others", reverse: true },
    { text: "Take time out for others", reverse: false },
    { text: "Feel others' emotions", reverse: false },
    { text: "Make people feel at ease", reverse: false },
  ],
  C: [
    { text: "Am always prepared", reverse: false },
    { text: "Leave my belongings around", reverse: true },
    { text: "Pay attention to details", reverse: false },
    { text: "Make a mess of things", reverse: true },
    { text: "Get chores done right away", reverse: false },
    {
      text: "Often forget to put things back in their proper place",
      reverse: true,
    },
    { text: "Like order", reverse: false },
    { text: "Shirk my duties", reverse: true },
    { text: "Follow a schedule", reverse: false },
    { text: "Am exacting in my work", reverse: false },
  ],
  ES: [
    { text: "Get stressed out easily", reverse: true },
    { text: "Am relaxed most of the time", reverse: false },
    { text: "Worry about things", reverse: true },
    { text: "Seldom feel blue", reverse: false },
    { text: "Am easily disturbed", reverse: true },
    { text: "Get upset easily", reverse: true },
    { text: "Change my mood a lot", reverse: true },
    { text: "Have frequent mood swings", reverse: true },
    { text: "Get irritated easily", reverse: true },
    { text: "Often feel blue", reverse: true },
  ],
  O: [
    { text: "Have a rich vocabulary", reverse: false },
    { text: "Have difficulty understanding abstract ideas", reverse: true },
    { text: "Have a vivid imagination", reverse: false },
    { text: "Am not interested in abstract ideas", reverse: true },
    { text: "Have excellent ideas", reverse: false },
    { text: "Do not have a good imagination", reverse: true },
    { text: "Am quick to understand things", reverse: false },
    { text: "Use difficult words", reverse: false },
    { text: "Spend time reflecting on things", reverse: false },
    { text: "Am full of ideas", reverse: false },
  ],
};

const ANCHORS = new Set([
  "E01",
  "E03",
  "A02",
  "A04",
  "C01",
  "C03",
  "ES02",
  "ES04",
  "O03",
  "O05",
]);

const CROSS: {
  id: string;
  text: string;
  primary: Trait;
  secondary?: Trait;
}[] = [
  { id: "X01", text: "I feel at ease meeting new people.", primary: "E", secondary: "ES" },
  { id: "X02", text: "I stay calm when plans fall apart.", primary: "ES", secondary: "C" },
  { id: "X03", text: "I enjoy a good argument about ideas.", primary: "O", secondary: "A" },
  { id: "X04", text: "I take charge when a group is stuck.", primary: "E", secondary: "C" },
  { id: "X05", text: "I speak up when I disagree with someone.", primary: "E", secondary: "A" },
  { id: "X06", text: "I like exploring ideas for their own sake.", primary: "O" },
  { id: "X07", text: "I stay composed when I am criticised.", primary: "ES", secondary: "A" },
  { id: "X08", text: "I plan ahead rather than decide on the spot.", primary: "C", secondary: "O" },
  {
    id: "X09",
    text: "I put other people's needs before my own plans.",
    primary: "A",
    secondary: "C",
  },
  { id: "X10", text: "I keep my feelings in check around others.", primary: "ES", secondary: "E" },
];

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

const items: unknown[] = [];
const en: Record<string, string> = {};
const hashes: Record<string, string> = {};

for (const trait of ["E", "A", "C", "ES", "O"] as Trait[]) {
  TEXTS[trait].forEach((row, i) => {
    const id = `${trait}${String(i + 1).padStart(2, "0")}`;
    const keyed = row.reverse ? -1 : 1;
    const loadings: Record<string, number> = { [trait]: keyed * A };
    items.push({
      id,
      pool: "core",
      primaryTrait: trait,
      loadings,
      thresholds: THRESHOLDS,
      keyed,
      isAnchor: ANCHORS.has(id),
      status: "active",
      source: "ipip",
      sourceVerified: false,
      version: 1,
    });
    en[id] = row.text;
    hashes[id] = sha256(row.text);
  });
}

for (const x of CROSS) {
  const loadings: Record<string, number> = { [x.primary]: A };
  if (x.secondary) loadings[x.secondary] = 0.3;
  items.push({
    id: x.id,
    pool: "core",
    primaryTrait: x.primary,
    loadings,
    thresholds: THRESHOLDS,
    keyed: 1,
    isAnchor: false,
    status: "candidate",
    source: "original",
    sourceVerified: false,
    version: 1,
    secondaryEstimated: false,
  });
  en[x.id] = x.text;
  hashes[x.id] = sha256(x.text);
}

// Honesty-Humility placeholders (pool deeper, candidate — not shippable).
for (let i = 1; i <= 6; i++) {
  const id = `H${String(i).padStart(2, "0")}`;
  const text = `[H-H item placeholder ${i}]`;
  items.push({
    id,
    pool: "deeper",
    primaryTrait: "H",
    loadings: { H: A },
    thresholds: THRESHOLDS,
    keyed: 1,
    isAnchor: false,
    status: "candidate",
    source: "original",
    sourceVerified: false,
    version: 1,
  });
  en[id] = text;
  hashes[id] = sha256(text);
}

// Prior cov order E,A,C,ES,O (DEV PLACEHOLDER)
const priorCov5 = [
  1, 0.2, 0.15, 0.25, 0.25, 0.2, 1, 0.2, 0.2, 0.1, 0.15, 0.2, 1, 0.25, 0, 0.25,
  0.2, 0.25, 1, 0.1, 0.25, 0.1, 0, 0.1, 1,
];

/** Extend 5×5 prior with H (DEV PLACEHOLDER correlations — not calibrated). */
function extendPriorWithH(prior5: number[]): number[] {
  // H correlations vs E,A,C,ES,O — modest placeholders only.
  const hCorr = [0.05, 0.25, 0.15, 0.1, 0.05];
  const prior6 = new Array(36).fill(0) as number[];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      prior6[i * 6 + j] = prior5[i * 5 + j]!;
    }
    prior6[i * 6 + 5] = hCorr[i]!;
    prior6[5 * 6 + i] = hCorr[i]!;
  }
  prior6[5 * 6 + 5] = 1;
  return prior6;
}

const bank = {
  version: 0,
  placeholderNote:
    "DEV PLACEHOLDER item parameters — not calibrated. Do not treat scores as valid.",
  items,
};

const coreTraits = [
  {
    id: "E",
    name: "Extraversion",
    poleLow: "Reserved — recharges alone",
    poleHigh: "Outgoing — energised by people",
  },
  {
    id: "A",
    name: "Agreeableness",
    poleLow: "Direct — candid",
    poleHigh: "Accommodating — cooperative",
  },
  {
    id: "C",
    name: "Conscientiousness",
    poleLow: "Flexible — spontaneous",
    poleHigh: "Organised — disciplined",
  },
  {
    id: "ES",
    name: "Emotional Stability",
    poleLow: "Sensitive — reactive",
    poleHigh: "Calm — even-keeled",
  },
  {
    id: "O",
    name: "Openness",
    poleLow: "Practical — conventional",
    poleHigh: "Curious — imaginative",
  },
] as const;

const sharedConfig = {
  RETAKE_BAND_MULTIPLIER: 1.41,
  UNCLEAR_WIDTH: 1.35,
  P_LEVEL_FIRM: 0.7,
  LEVEL_CUT: 0.4,
  DEEPER_SD_TARGET: 0.35,
  DEEPER_BUDGET_MIN: 12,
  DEEPER_BUDGET_MAX: 20,
  FIXED_FIRST_ITEM_ID: "X01",
  FLAG_BAND_FACTOR: 1.25,
  ACCURACY_CLAIMS: {
    corrWithLongTest: null as null,
    retest: null as null,
  },
};

const model = {
  id: "model-v0-dev",
  bankStatus: "dev-uncalibrated" as const,
  traits: [...coreTraits],
  priorCov: priorCov5,
  normSampleId: "provisional-standard-normal",
  normsLabel: "provisional norms",
  normMean: [0, 0, 0, 0, 0],
  normSd: [1, 1, 1, 1, 1],
  itemHashes: hashes,
  fixedFormOrder: [] as string[],
  config: {
    ...sharedConfig,
    GRID_NODES_PER_DIM: 11,
  },
};

const deeperModel = {
  id: "model-v0-dev-deeper",
  bankStatus: "dev-uncalibrated" as const,
  traits: [
    ...coreTraits,
    {
      id: "H",
      name: "Honesty-Humility",
      poleLow: "Self-promoting — status-oriented",
      poleHigh: "Modest — fairness-oriented",
    },
  ],
  priorCov: extendPriorWithH(priorCov5),
  normSampleId: "provisional-standard-normal",
  normsLabel: "provisional norms",
  normMean: [0, 0, 0, 0, 0, 0],
  normSd: [1, 1, 1, 1, 1, 1],
  itemHashes: hashes,
  /** Deeper round uses adaptive selection; fixed form unused. */
  fixedFormOrder: [] as string[],
  config: {
    ...sharedConfig,
    /**
     * Brief default is 0.35 after calibration. With DEV |a|=1.2 placeholders,
     * 20 deeper items typically leave SD ≈ 0.5–0.6 — use a reachable DEV stop.
     */
    DEEPER_SD_TARGET: 0.65,
    /** 7^6 ≈ 118k points — comparable to 11^5 for the core model. */
    GRID_NODES_PER_DIM: 7,
  },
};

mkdirSync(join(ROOT, "content/items"), { recursive: true });
mkdirSync(join(ROOT, "content/model"), { recursive: true });
writeFileSync(join(ROOT, "content/items/bank.dev.json"), JSON.stringify(bank, null, 2) + "\n");
writeFileSync(join(ROOT, "content/items/en.json"), JSON.stringify(en, null, 2) + "\n");
writeFileSync(
  join(ROOT, "content/model/model-v0-dev.json"),
  JSON.stringify(model, null, 2) + "\n",
);
writeFileSync(
  join(ROOT, "content/model/model-v0-dev-deeper.json"),
  JSON.stringify(deeperModel, null, 2) + "\n",
);
console.log(
  "Wrote bank.dev.json, en.json, model-v0-dev.json, model-v0-dev-deeper.json (run build-fixed-form for core order)",
);
