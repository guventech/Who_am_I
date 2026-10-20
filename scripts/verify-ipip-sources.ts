/**
 * Mark sourceVerified:true for IPIP Big-Five Factor Markers (10-item scales)
 * whose EN text matches https://ipip.ori.org/newBigFive5broadKey.htm (checked 2026-10-20).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ItemBank } from "../src/engine/types";

const VERIFIED = new Set(
  [
    "Am the life of the party",
    "Don't talk a lot",
    "Feel comfortable around people",
    "Keep in the background",
    "Start conversations",
    "Have little to say",
    "Talk to a lot of different people at parties",
    "Don't like to draw attention to myself",
    "Don't mind being the center of attention",
    "Am quiet around strangers",
    "Feel little concern for others",
    "Am interested in people",
    "Insult people",
    "Sympathize with others' feelings",
    "Am not interested in other people's problems",
    "Have a soft heart",
    "Am not really interested in others",
    "Take time out for others",
    "Feel others' emotions",
    "Make people feel at ease",
    "Am always prepared",
    "Leave my belongings around",
    "Pay attention to details",
    "Make a mess of things",
    "Get chores done right away",
    "Often forget to put things back in their proper place",
    "Like order",
    "Shirk my duties",
    "Follow a schedule",
    "Am exacting in my work",
    "Get stressed out easily",
    "Am relaxed most of the time",
    "Worry about things",
    "Seldom feel blue",
    "Am easily disturbed",
    "Get upset easily",
    "Change my mood a lot",
    "Have frequent mood swings",
    "Get irritated easily",
    "Often feel blue",
    "Have a rich vocabulary",
    "Have difficulty understanding abstract ideas",
    "Have a vivid imagination",
    "Am not interested in abstract ideas",
    "Have excellent ideas",
    "Do not have a good imagination",
    "Am quick to understand things",
    "Use difficult words",
    "Spend time reflecting on things",
    "Am full of ideas",
  ].map((t) => t.replace(/[.!?]+$/u, "").toLowerCase()),
);

const root = process.cwd();
const bankPath = join(root, "content/items/bank.dev.json");
const enPath = join(root, "content/items/en.json");
const bank = JSON.parse(readFileSync(bankPath, "utf8")) as ItemBank;
const en = JSON.parse(readFileSync(enPath, "utf8")) as Record<string, string>;

let verified = 0;
for (const item of bank.items) {
  if (item.source !== "ipip") continue;
  const text = (en[item.id] ?? "").replace(/[.!?]+$/u, "").toLowerCase();
  if (VERIFIED.has(text)) {
    item.sourceVerified = true;
    verified++;
  }
}

writeFileSync(bankPath, JSON.stringify(bank, null, 2) + "\n");
console.log(`sourceVerified true for ${verified} IPIP items`);
