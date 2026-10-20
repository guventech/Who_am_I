import { isStorageEnabled } from "@/config/storage-enabled";
import { TestClient } from "./test-client";

export default function TestPage() {
  return <TestClient storageEnabled={isStorageEnabled()} />;
}
