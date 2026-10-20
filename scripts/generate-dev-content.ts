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

for (let i = 1; i <= 6; i++) {
  const id = `H${String(i).padStart(2, "0")}`;
  const text = `[H-H item placeholder ${i}]`;
  items.push({
    id,
    pool: "deeper",
    primaryTrait: "E",
    loadings: { E: A },
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

// Prior cov order E,A,C,ES,O
const priorCov = [
  1, 0.2, 0.15, 0.25, 0.25, 0.2, 1, 0.2, 0.2, 0.1, 0.15, 0.2, 1, 0.25, 0, 0.25,
  0.2, 0.25, 1, 0.1, 0.25, 0.1, 0, 0.1, 1,
];

const bank = {
  version: 0,
  placeholderNote:
    "DEV PLACEHOLDER item parameters — not calibrated. Do not treat scores as valid.",
  items,
};

const model = {
  id: "model-v0-dev",
  bankStatus: "dev-uncalibrated",
  traits: [
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
  ],
  priorCov,
  normSampleId: "provisional-standard-normal",
  normsLabel: "provisional norms",
  normMean: [0, 0, 0, 0, 0],
  normSd: [1, 1, 1, 1, 1],
  itemHashes: hashes,
  fixedFormOrder: [] as string[],
  config: {
    RETAKE_BAND_MULTIPLIER: 1.41,
    UNCLEAR_WIDTH: 1.0,
    P_LEVEL_FIRM: 0.7,
    LEVEL_CUT: 0.4,
    DEEPER_SD_TARGET: 0.35,
    FLAG_BAND_FACTOR: 1.25,
    ACCURACY_CLAIMS: {
      corrWithLongTest: null,
      retest: null,
    },
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
console.log("Wrote bank.dev.json, en.json, model-v0-dev.json (fixedFormOrder empty — run build-fixed-form)");
