import { ResultClient } from "./result-client";
import { env } from "@/config/env";

export default function ResultPage() {
  return <ResultClient allowDrafts={env.ALLOW_DRAFT_CONTENT} />;
}
