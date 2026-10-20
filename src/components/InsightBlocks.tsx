import type { ReactNode } from "react";
import { copyEn } from "@/content/copy.en";
import { fillInsightPlaceholders } from "@/insights/format-copy";
import type { SelectedInsights } from "@/insights/types";

type Props = {
  insights: SelectedInsights;
};

export function InsightBlocks({ insights }: Props) {
  return (
    <section className="flex flex-col gap-8" aria-label={copyEn.insightsHeading}>
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl text-slate-900">
          {copyEn.insightsHeading}
        </h2>
        <p className="text-sm text-slate-600">{copyEn.insightsExamplesNote}</p>
        {insights.goDeeperPrompt ? (
          <p role="status" className="text-sm font-medium text-slate-800">
            {copyEn.insightsGoDeeper}
          </p>
        ) : null}
      </div>

      {insights.strengths.length > 0 ? (
        <Block title={copyEn.insightsStrengths}>
          <ul className="flex flex-col gap-4">
            {insights.strengths.map((s) => (
              <li key={`${s.entryId}-${s.title}`} className="flex flex-col gap-1">
                <p className="font-medium text-slate-900">
                  {s.title}
                  {s.soft ? (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      {copyEn.softMarker}
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Interview:</span> {s.interviewLine}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">CV/LinkedIn:</span>{" "}
                  <span className="text-slate-500">
                    Fill in your own example:
                  </span>{" "}
                  {fillInsightPlaceholders(s.cvLine)}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Team:</span> {s.teamLine}
                </p>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {insights.watchOuts.length > 0 ? (
        <Block title={copyEn.insightsWatchOuts}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {insights.watchOuts.map((w) => (
              <li key={`${w.entryId}-${w.text}`}>
                {w.text}
                {w.soft ? (
                  <span className="ml-2 text-slate-500">{copyEn.softMarker}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {insights.improve.length > 0 ? (
        <Block title={copyEn.insightsImprove}>
          <ul className="flex flex-col gap-3">
            {insights.improve.map((i) => (
              <li key={`${i.entryId}-${i.area}`}>
                <p className="font-medium text-slate-900">
                  {i.area}
                  {i.soft ? (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      {copyEn.softMarker}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {i.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {insights.workWithOthers.length > 0 ? (
        <Block title={copyEn.insightsWorkWith}>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {insights.workWithOthers.map((w) => (
              <li key={`${w.entryId}-${w.text}`}>
                {w.text}
                {w.soft ? (
                  <span className="ml-2 text-slate-500">{copyEn.softMarker}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}
    </section>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-serif text-lg text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
