import type { TraitId } from "@/engine/types";

export type InsightVariant = "firm" | "soft";
export type ReviewStatus = "draft" | "reviewed";

export type InsightStrength = {
  title: string;
  interviewLine: string;
  cvLine: string;
  teamLine: string;
};

export type InsightImprove = {
  area: string;
  actions: string[];
};

export type InsightEntry = {
  id: string;
  key: string;
  variant: InsightVariant;
  reviewStatus: ReviewStatus;
  version: number;
  strengths: InsightStrength[];
  watchOuts: string[];
  improve: InsightImprove[];
  workWithOthers: string;
  tradeOff: string;
};

export type InsightLibrary = {
  entries: InsightEntry[];
};

export type SelectedStrength = InsightStrength & {
  entryId: string;
  soft: boolean;
};

export type SelectedWatchOut = {
  text: string;
  entryId: string;
  soft: boolean;
};

export type SelectedImprove = InsightImprove & {
  entryId: string;
  soft: boolean;
};

export type SelectedWorkWith = {
  text: string;
  entryId: string;
  soft: boolean;
};

export type SelectedInsights = {
  shownEntryIds: string[];
  strengths: SelectedStrength[];
  watchOuts: SelectedWatchOut[];
  improve: SelectedImprove[];
  workWithOthers: SelectedWorkWith[];
  tradeOffsByTrait: Partial<Record<TraitId, string>>;
  fallback: boolean;
  goDeeperPrompt: boolean;
};
