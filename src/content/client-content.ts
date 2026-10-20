import bankRaw from "../../content/items/bank.dev.json";
import textEnRaw from "../../content/items/en.json";
import modelRaw from "../../content/model/model-v0-dev.json";
import deeperModelRaw from "../../content/model/model-v0-dev-deeper.json";
import { itemBankSchema, modelVersionSchema } from "@/engine/schema";
import type { ItemBank, ModelVersion } from "@/engine/types";

/** Browser-safe content load (static JSON imports; no fs). */
export function getItemBank(): ItemBank {
  return itemBankSchema.parse(bankRaw) as ItemBank;
}

export function getModelVersion(): ModelVersion {
  return modelVersionSchema.parse(modelRaw) as ModelVersion;
}

export function getDeeperModelVersion(): ModelVersion {
  return modelVersionSchema.parse(deeperModelRaw) as ModelVersion;
}

export function getItemTextEn(): Record<string, string> {
  return textEnRaw as Record<string, string>;
}
