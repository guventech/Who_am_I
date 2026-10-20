import type { TraitId } from "@/engine/types";

export const INSIGHTS_VERSION = "insights-v1";

export type InsightLevel = "low" | "mid" | "high";

export type InsightEntryV1 = {
  id: string;
  traitId: TraitId;
  level: InsightLevel;
  strength: string;
  /** Soft form when less certain (starts with "You may...") */
  strengthSoft: string;
  interview: string;
  cv: string;
  watchOut: string;
  tips: string[];
};

function entry(
  traitId: TraitId,
  level: InsightLevel,
  strength: string,
  interview: string,
  cv: string,
  watchOut: string,
  tips: string[],
): InsightEntryV1 {
  const rest = strength.replace(/^You\s+/i, "");
  const softCore = `You may ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
  return {
    id: `${traitId}-${level}`,
    traitId,
    level,
    strength,
    strengthSoft: softCore.endsWith(".") ? softCore : `${softCore}.`,
    interview,
    cv,
    watchOut,
    tips,
  };
}

/** Fixed insight library v1: 15 single-trait entries. */
export const insightLibraryV1: InsightEntryV1[] = [
  entry(
    "E",
    "low",
    "You think before you speak and you listen well.",
    '"I listen first. In my last project I picked up a problem others missed because I asked one more question."',
    "Careful listener who works well on focused, independent tasks.",
    "People may not see your ideas because you share them late or not at all.",
    [
      "Say one idea in the first 10 minutes of each meeting.",
      "Send your thoughts in writing after the meeting.",
      "Ask your manager for 1-to-1 time instead of big group talks.",
    ],
  ),
  entry(
    "E",
    "mid",
    "You can work alone or with a group, and you switch easily.",
    '"I am fine leading a meeting and also fine working alone for a full day."',
    "Comfortable both in team settings and in independent work.",
    "You may not tell people which kind of work gives you energy.",
    [
      "Notice which days leave you tired and which leave you full of energy.",
      "Plan your week with a mix of both.",
    ],
  ),
  entry(
    "E",
    "high",
    "You bring energy to a group and you make contacts easily.",
    '"I like to bring people together. I started a weekly meeting that got two teams talking again."',
    "Builds relationships fast and keeps teams connected.",
    "You may talk more than others and leave less room for quieter people.",
    [
      "In meetings, ask a quiet person for their view before you give yours.",
      "Count to three before you answer.",
      "Once a week, do one deep task with no talking.",
    ],
  ),
  entry(
    "A",
    "low",
    "You say what you think, so people know where they stand.",
    '"I give honest feedback. I once stopped a launch because I saw a problem nobody wanted to say."',
    "Gives clear, honest feedback and is not afraid of hard talks.",
    "Your honest words can feel hard to others when they come without warmth.",
    [
      "Start feedback with one thing that works.",
      'Ask "How do you see it?" before you give your view.',
      "Read your emails once more for tone before sending.",
    ],
  ),
  entry(
    "A",
    "mid",
    "You can be kind and you can be firm when it matters.",
    '"I try to keep a good relationship, but I will push back when the result is at risk."',
    "Balances team harmony with clear decisions.",
    "You may not be sure when to give in and when to stand firm.",
    [
      "Before a hard talk, decide your one must-have point.",
      "After, ask yourself if you gave away too much or too little.",
    ],
  ),
  entry(
    "A",
    "high",
    "You are warm, helpful, and people trust you.",
    '"People come to me when there is a conflict. I helped two colleagues agree on a plan both could accept."',
    "Trusted team player who builds agreement and supports colleagues.",
    "You may say yes too often and keep your own opinion to yourself.",
    [
      "Wait one day before you say yes to extra work.",
      'Practise one sentence: "I see it differently, and here is why."',
      "Write your own view down before a meeting so you don't drop it.",
    ],
  ),
  entry(
    "C",
    "low",
    "You adapt fast and stay relaxed when plans change.",
    '"When the plan changed two days before the deadline, I adjusted quickly and we still delivered."',
    "Adapts quickly to change and new priorities.",
    "Details and deadlines can slip when nobody checks.",
    [
      "Use one simple to-do list, every day.",
      "Put deadlines in your calendar the moment you get them.",
      "Ask a colleague to check the final version.",
    ],
  ),
  entry(
    "C",
    "mid",
    "You can plan when needed and change the plan when needed.",
    '"I make a plan, but I don\'t hold on to it when things change."',
    "Organised, with room for flexibility.",
    "Under pressure you may drop planning just when you need it most.",
    [
      "Keep a short checklist for your most important task.",
      "Review your week every Friday for 10 minutes.",
    ],
  ),
  entry(
    "C",
    "high",
    "You are reliable, you plan, and you finish what you start.",
    '"I planned a project with 20 steps and delivered every step on time."',
    "Reliable and well organised, delivers on time with attention to detail.",
    "You may spend too long making things perfect, or find it hard when others are less organised.",
    [
      'Decide what "good enough" means before you start.',
      "Set a time limit for small tasks.",
      "Agree on deadlines with others instead of expecting your own standard.",
    ],
  ),
  entry(
    "ES",
    "low",
    "You notice risks and problems early, and you care about the result.",
    '"I am good at seeing what can go wrong. My risk list saved us from a late delivery."',
    "Spots risks early and prepares carefully.",
    "Worry can take your energy and make small problems feel big.",
    [
      "Write the worry down and one first step to solve it.",
      "Take a short walk before you answer a stressful email.",
      "Talk to one person you trust each week.",
    ],
  ),
  entry(
    "ES",
    "mid",
    "You stay mostly steady, and you still take problems seriously.",
    '"I stay calm in most situations, and I tell my team early when something worries me."',
    "Stays steady under normal pressure and raises concerns early.",
    "Stress may build up slowly without you noticing.",
    [
      "Check your energy at the end of each day (1 to 5).",
      "Plan a real break after a busy week.",
    ],
  ),
  entry(
    "ES",
    "high",
    "You stay calm under pressure and help others calm down.",
    '"When our system went down, I kept the team focused and we fixed it in two hours."',
    "Stays calm and clear under pressure.",
    "Others may think you don't care, or you may miss early warning signs.",
    [
      "Tell people when you are concerned, even if you look calm.",
      'Ask your team "What worries you?" now and then.',
    ],
  ),
  entry(
    "O",
    "low",
    "You are down to earth and focus on what works.",
    '"I prefer proven methods. I made our process simpler and errors went down."',
    "Practical problem solver who makes proven methods work.",
    "You may say no to new ideas too fast.",
    [
      "Before saying no, name one good thing in the idea.",
      "Try one new tool or method each month on a small task.",
    ],
  ),
  entry(
    "O",
    "mid",
    "You like new ideas, but you check if they work in real life.",
    '"I am open to new ideas, and I test them on a small scale first."',
    "Open to new ideas with a practical, results-first mindset.",
    "You may wait too long to choose between the old way and the new way.",
    [
      "Give yourself a deadline to decide.",
      "Run a small test instead of a long discussion.",
    ],
  ),
  entry(
    "O",
    "high",
    "You are curious, you learn fast, and you like new ideas.",
    '"I like learning new things. I taught myself a new tool and showed my team how to use it."',
    "Curious and quick to learn, brings new ideas to the team.",
    "You may start many things and finish fewer.",
    [
      "Write new ideas in one list and pick only one per month.",
      "Finish one thing before you start the next.",
      'Ask "Is this useful now?" before you dive in.',
    ],
  ),
];

export function getInsightEntry(
  traitId: TraitId,
  level: InsightLevel,
): InsightEntryV1 | undefined {
  return insightLibraryV1.find(
    (e) => e.traitId === traitId && e.level === level,
  );
}
