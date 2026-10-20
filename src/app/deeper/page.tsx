import { notFound } from "next/navigation";
import { isGoDeeperAvailable } from "@/config/go-deeper";
import {
  getItemBank,
  getItemTextEn,
} from "@/content/client-content";
import { DeeperClient } from "./deeper-client";

export default function DeeperPage() {
  const bank = getItemBank();
  const textEn = getItemTextEn();
  if (!isGoDeeperAvailable(bank, textEn)) {
    notFound();
  }
  return <DeeperClient />;
}
