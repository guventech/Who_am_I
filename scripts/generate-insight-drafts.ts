/**
 * Generates EN draft insight YAML (+ JSON bundle for the browser).
 * All entries are reviewStatus: "draft" — human review required before production.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "yaml";
import type { InsightEntry } from "../src/insights/types";

const OUT_DIR = join(process.cwd(), "content/insights/en");
const BUNDLE = join(process.cwd(), "content/insights/en.bundle.json");

type Level = "low" | "mid" | "high";
type Trait = "E" | "A" | "C" | "ES" | "O";

const TRAIT_META: Record<
  Trait,
  { name: string; low: string; mid: string; high: string }
> = {
  E: {
    name: "Extraversion",
    low: "reserved",
    mid: "flexible with social energy",
    high: "outgoing",
  },
  A: {
    name: "Agreeableness",
    low: "direct",
    mid: "balanced between candour and harmony",
    high: "accommodating",
  },
  C: {
    name: "Conscientiousness",
    low: "flexible",
    mid: "able to switch between structure and spontaneity",
    high: "organised",
  },
  ES: {
    name: "Emotional Stability",
    low: "sensitive",
    mid: "responsive without being stuck at either pole",
    high: "calm",
  },
  O: {
    name: "Openness",
    low: "practical",
    mid: "open when it helps, grounded when it matters",
    high: "curious",
  },
};

function traitEntry(
  trait: Trait,
  level: Level,
  variant: "firm" | "soft",
): InsightEntry {
  const meta = TRAIT_META[trait];
  const label = meta[level];
  const soft = variant === "soft";
  const may = soft ? "may " : "";
  const ifFits = soft ? " (if this fits you)" : "";
  const id = `${trait}-${level}-${variant}`;

  const strengthTitle =
    level === "mid"
      ? `${meta.name}: situational flexibility`
      : `${meta.name}: ${label} strength`;

  return {
    id,
    key: `${trait}:${level}`,
    variant,
    reviewStatus: "draft",
    version: 1,
    strengths: [
      {
        title: strengthTitle,
        interviewLine: soft
          ? `If this fits you: tell a story where being ${label} helped a real outcome.`
          : `Tell me about a time when being ${label} clearly helped the outcome.`,
        cvLine: soft
          ? `May bring a ${label} approach to [context], supporting [result].`
          : `Brought a ${label} approach to [context], supporting [result].`,
        teamLine: soft
          ? `I may show up as ${label} depending on the situation.`
          : `I tend to show up as ${label} in day-to-day work.`,
      },
    ],
    watchOuts:
      level === "mid"
        ? []
        : [
            soft
              ? `can come across as uneven when others expect a steadier ${meta.name.toLowerCase()} style${ifFits}`
              : `can come across as too ${label} when the situation needs the opposite pole`,
          ],
    improve: [
      {
        area: level === "mid" ? "Choosing a pole on purpose" : `Balancing ${label} energy`,
        actions: [
          soft
            ? `Once this week, notice when a ${label} response helped — jot one line after the meeting.`
            : `This week, pick one meeting and decide in advance whether a ${label} or opposite-pole move serves the goal.`,
          `Ask a trusted colleague: "When does my ${meta.name.toLowerCase()} style help you, and when does it get in the way?"`,
          soft
            ? `If it fits, try one small opposite-pole behaviour for 15 minutes and note what changed.`
            : `Schedule a 15-minute practice of the opposite pole (quiet focus / outreach / structure / openness) midweek.`,
        ],
      },
    ],
    workWithOthers: soft
      ? `You ${may}prefer working in a ${label} way${ifFits}. Say what you need early, and invite people at the opposite pole to name what helps them.`
      : `You often prefer a ${label} style. Name that preference early, and ask opposite-pole colleagues what they need to work well with you.`,
    tradeOff: soft
      ? `A ${label} lean can help in some contexts and cost energy in others — check which applies today.`
      : `Leaning ${label} helps in some rooms and costs recovery or coverage in others; the trade-off is real.`,
  };
}

function comboEntry(
  key: string,
  title: string,
  variant: "firm" | "soft",
  bits: {
    strengthHint: string;
    watch: string;
    improveArea: string;
    work: string;
    tradeOff: string;
  },
): InsightEntry {
  const soft = variant === "soft";
  return {
    id: `combo-${key.replace(/[+:]/g, "-")}-${variant}`,
    key,
    variant,
    reviewStatus: "draft",
    version: 1,
    strengths: [
      {
        title: soft ? `${title} (less certain)` : title,
        interviewLine: soft
          ? `If this fits: describe a moment that showed ${bits.strengthHint}.`
          : `Describe a moment that showed ${bits.strengthHint}.`,
        cvLine: soft
          ? `May combine ${bits.strengthHint} to deliver [result].`
          : `Combined ${bits.strengthHint} to deliver [result].`,
        teamLine: soft
          ? `I may bring a ${title.toLowerCase()} style when the work needs it.`
          : `I often bring a ${title.toLowerCase()} style to group work.`,
      },
    ],
    watchOuts: [
      soft
        ? `${bits.watch} (if this pattern fits you)`
        : bits.watch,
    ],
    improve: [
      {
        area: bits.improveArea,
        actions: [
          soft
            ? `This week, if it fits, ask one teammate where your ${title.toLowerCase()} style landed well.`
            : `This week, ask one teammate where your ${title.toLowerCase()} style landed well — and where it overshot.`,
          `Before your next high-stakes conversation, write one sentence on the outcome you want and one on the relationship you want to protect.`,
          `Block 20 minutes after that conversation to note what you would keep or change.`,
        ],
      },
    ],
    workWithOthers: soft ? `${bits.work} Check whether this fits before leaning on it.` : bits.work,
    tradeOff: bits.tradeOff,
  };
}

const COMBOS: {
  key: string;
  title: string;
  bits: {
    strengthHint: string;
    watch: string;
    improveArea: string;
    work: string;
    tradeOff: string;
  };
}[] = [
  {
    key: "E:high+A:low",
    title: "Persuasive challenger",
    bits: {
      strengthHint: "outgoing energy plus candid challenge",
      watch: "can come across as forceful when others needed more warmth first",
      improveArea: "Challenge with care",
      work: "You like open debate. Pair a clear point with one question that invites the other person's view.",
      tradeOff: "Candour wins clarity; without pacing, it can cool the room.",
    },
  },
  {
    key: "E:high+A:high",
    title: "Connector",
    bits: {
      strengthHint: "bringing people in and keeping goodwill",
      watch: "can come across as conflict-avoidant when a hard call was needed",
      improveArea: "Warmth with a spine",
      work: "You thrive when people feel included. Name tensions early so harmony does not hide a real disagreement.",
      tradeOff: "Connection builds trust; over-smoothing can delay needed decisions.",
    },
  },
  {
    key: "C:high+O:low",
    title: "Reliable executor",
    bits: {
      strengthHint: "structure and practical follow-through",
      watch: "can come across as rigid when a novel approach would have helped",
      improveArea: "Structure that still learns",
      work: "You deliver when plans are clear. Leave one slot in the plan for a better idea from someone more exploratory.",
      tradeOff: "Reliability ships work; closed plans can miss a better route.",
    },
  },
  {
    key: "O:high+C:low",
    title: "Idea generator",
    bits: {
      strengthHint: "fresh options without premature lock-in",
      watch: "can come across as scattered when others needed a finish line",
      improveArea: "Ideas that land",
      work: "You open possibilities. Pair each new idea with an owner and a next tiny step.",
      tradeOff: "Exploration finds options; without closure, momentum leaks.",
    },
  },
  {
    key: "E:high+O:high",
    title: "Energetic explorer",
    bits: {
      strengthHint: "enthusiasm for new people and new ideas",
      watch: "can come across as restless when depth or follow-through was needed",
      improveArea: "Exploration with depth",
      work: "You energise new starts. Pick one thread to stay with for two weeks before opening another.",
      tradeOff: "Spark creates motion; without depth, results stay thin.",
    },
  },
];

function fallbackEntry(): InsightEntry {
  return {
    id: "fallback-mid",
    key: "fallback:mid",
    variant: "firm",
    reviewStatus: "draft",
    version: 1,
    strengths: [
      {
        title: "Flexible sketch — go deeper to sharpen",
        interviewLine:
          "Your answers did not settle clear poles yet. Use stories from recent weeks rather than a fixed label.",
        cvLine:
          "Adaptable across situations — refine specifics after a deeper pass.",
        teamLine:
          "I am still mapping what stays steady for me; I can share preferences as they become clearer.",
      },
    ],
    watchOuts: [],
    improve: [
      {
        area: "Sharpen the sketch",
        actions: [
          "When Go deeper is available, continue for a tighter read on each trait.",
          "Meanwhile, note two situations this week where your style clearly helped — and one where it did not.",
        ],
      },
    ],
    workWithOthers:
      "Without a clear pole yet, ask teammates what they need from you and share what helps you focus.",
    tradeOff:
      "A short sketch stays broad on purpose; depth costs more questions but narrows the ranges.",
  };
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const entries: InsightEntry[] = [];
  const traits: Trait[] = ["E", "A", "C", "ES", "O"];
  const levels: Level[] = ["low", "mid", "high"];
  const variants: ("firm" | "soft")[] = ["firm", "soft"];

  for (const trait of traits) {
    for (const level of levels) {
      for (const variant of variants) {
        entries.push(traitEntry(trait, level, variant));
      }
    }
  }
  for (const c of COMBOS) {
    for (const variant of variants) {
      entries.push(comboEntry(c.key, c.title, variant, c.bits));
    }
  }
  entries.push(fallbackEntry());

  // One YAML file per entry (immutable ids)
  for (const e of entries) {
    const path = join(OUT_DIR, `${e.id}.yaml`);
    writeFileSync(path, stringify(e), "utf8");
  }

  const bundle = { entries };
  writeFileSync(BUNDLE, JSON.stringify(bundle, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${entries.length} draft insight entries to ${OUT_DIR} and ${BUNDLE}`,
  );
}

main();
