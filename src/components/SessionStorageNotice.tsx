"use client";

import { useSyncExternalStore } from "react";
import { copyEn } from "@/copy/en";
import {
  subscribeSession,
  getSessionStorageStatus,
  getServerStorageStatus,
} from "@/session/session-store";

export function SessionStorageNotice() {
  const status = useSyncExternalStore(
    subscribeSession,
    getSessionStorageStatus,
    getServerStorageStatus,
  );
  if (status === "available") return null;
  return (
    <div
      role="status"
      className="border-b px-5 py-3 text-sm"
      style={{
        background: "var(--banner-bg)",
        color: "var(--ink)",
        borderColor: "var(--line)",
      }}
    >
      <p className="page">
        {status === "unavailable" ? copyEn.storageUnavailable : copyEn.storageInvalid}
      </p>
    </div>
  );
}
