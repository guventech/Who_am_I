"use client";

import { useState } from "react";
import { copyEn } from "@/copy/en";

type Props = {
  text: string;
};

export function CopyInsightsButton({ text }: Props) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 2000);
        });
      }}
    >
      {done ? copyEn.copyResultsDone : copyEn.copyResults}
    </button>
  );
}
