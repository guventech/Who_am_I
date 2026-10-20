import { redirect } from "next/navigation";
import { isStorageEnabled } from "@/config/storage-enabled";
import { ConsentClient } from "./consent-client";

export default function ConsentPage() {
  const storageEnabled = isStorageEnabled();
  if (!storageEnabled) {
    redirect("/result");
  }
  return <ConsentClient storageEnabled={storageEnabled} />;
}
