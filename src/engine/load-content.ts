import { readFileSync } from "node:fs";
import { join } from "node:path";
import { itemBankSchema, modelVersionSchema } from "./schema";
import type { ItemBank, ModelVersion } from "./types";

const ROOT = join(process.cwd());

export function loadItemBank(
  path = join(ROOT, "content/items/bank.dev.json"),
): ItemBank {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return itemBankSchema.parse(raw) as ItemBank;
}

export function loadModelVersion(
  path = join(ROOT, "content/model/model-v0-dev.json"),
): ModelVersion {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return modelVersionSchema.parse(raw) as ModelVersion;
}

export function loadDeeperModelVersion(
  path = join(ROOT, "content/model/model-v0-dev-deeper.json"),
): ModelVersion {
  return loadModelVersion(path);
}

export function loadItemTextEn(
  path = join(ROOT, "content/items/en.json"),
): Record<string, string> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, string>;
}
