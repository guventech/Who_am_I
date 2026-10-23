import type { AnsweredItem } from "@/engine/types";
import type { ScoredSession } from "@/engine/score";

/** Short-lived worker keeps scoring off the UI thread and releases its grid afterward. */
export function scoreInBrowser(answered: AnsweredItem[]): Promise<ScoredSession> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./scoring.worker.ts", import.meta.url), {
      type: "module",
    });
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("scoring_timeout"));
    }, 20_000);
    function finish() {
      window.clearTimeout(timer);
      worker.terminate();
    }
    worker.onmessage = (
      event: MessageEvent<{ scored?: ScoredSession; error?: string }>,
    ) => {
      finish();
      if (event.data.scored) resolve(event.data.scored);
      else reject(new Error("scoring_failed"));
    };
    worker.onerror = () => {
      finish();
      reject(new Error("scoring_failed"));
    };
    worker.postMessage(answered);
  });
}
