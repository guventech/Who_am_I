import { getItemBank, getModelVersion } from "@/content/client-content";
import { scoreSession } from "@/engine/score";
import type { AnsweredItem } from "@/engine/types";

const bank = getItemBank();
const model = getModelVersion();
self.onmessage = (event: MessageEvent<AnsweredItem[]>) => {
  try {
    self.postMessage({ scored: scoreSession(bank, model, event.data) });
  } catch {
    self.postMessage({ error: "scoring_failed" });
  }
};
