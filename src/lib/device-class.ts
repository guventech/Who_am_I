import type { DeviceClass } from "@/storage/types";

export function coarseDeviceClass(): DeviceClass {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 600) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
