import { copyEn } from "@/copy/en";

/** "(less certain)" with a real space before it, on trait, strength, and watch-out lines. */
export function LessCertainMark() {
  return (
    <span className="text-[13px] font-medium" style={{ color: "var(--less)" }}>
      {` ${copyEn.lessCertain}`}
    </span>
  );
}
