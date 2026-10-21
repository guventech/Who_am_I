import { describe, expect, it } from "vitest";
import { copyEn } from "@/copy/en";
import { formatResultsPlainText } from "@/insights/select-v1";
import { INSIGHTS_VERSION } from "@/insights/library";

describe("honesty and clarity copy v3", () => {
  it("keeps CV and interview labels", () => {
    expect(copyEn.interviewLabel).toBe("In an interview");
    expect(copyEn.cvLabel).toBe("On your CV");
  });

  it("frames CV lines as wording ideas, not proof", () => {
    expect(copyEn.insightsNote.toLowerCase()).toContain("wording ideas");
    expect(copyEn.insightsNote.toLowerCase()).toContain("not proof");
  });

  it("clarifies not for judging others, fine for self-reflection", () => {
    expect(copyEn.notForJudgingOthers.toLowerCase()).toContain(
      "own reflection",
    );
    expect(copyEn.notForJudgingOthers.toLowerCase()).toContain("not for judging");
    expect(copyEn.howAccurateBody.join(" ").toLowerCase()).toContain(
      "not for judging",
    );
  });

  it("avoids average-person and usually-close retake claims", () => {
    const blob = [
      copyEn.resultLead,
      copyEn.middleLegend,
      copyEn.retakeLegend,
      ...copyEn.howAccurateBody,
    ].join(" ");
    expect(blob.toLowerCase()).not.toContain("average person");
    expect(blob.toLowerCase()).not.toContain("compared with other people");
    expect(blob.toLowerCase()).not.toContain("will usually be close");
    expect(copyEn.middleLegend.toLowerCase()).toContain("middle of the scale");
    expect(copyEn.retakeLegend).toBe(
      "Shaded band: where a retake might land (early estimate)",
    );
    expect(copyEn.scoresNote).toBe(
      "Early version. Not yet checked with real people.",
    );
  });

  it("uses accurate session vs server storage wording", () => {
    expect(copyEn.nothingSavedUnless).toContain(
      "Nothing is sent or stored on our side",
    );
    expect(copyEn.consentStorageNote).toBe(
      "Nothing is sent or stored on our side unless you say yes.",
    );
    expect(copyEn.consentBody).not.toContain(
      "Nothing is sent or stored on our side",
    );
    expect(copyEn.privacyBody[0]).toContain("browser session");
    expect(copyEn.privacyBody.join(" ")).toContain("privacy@who-am-i.app");
  });

  it("says rough guide for self-reflection only on landing and results", () => {
    expect(copyEn.landingExpectation.toLowerCase()).toContain(
      "rough guide for self-reflection",
    );
    expect(copyEn.resultLead.toLowerCase()).toContain(
      "rough guide for self-reflection",
    );
    expect(copyEn.scoresNote.toLowerCase()).not.toContain(
      "rough guide for self-reflection",
    );
    expect(copyEn.howAccurateBody.join(" ").toLowerCase()).not.toContain(
      "rough guide for self-reflection",
    );
    expect(copyEn.landingExpectation.toLowerCase()).toContain("not a diagnosis");
  });

  it("copied results include caveat and no decimal scores", () => {
    const text = formatResultsPlainText(
      [
        {
          title: "Social energy",
          phrase: "A bit more outgoing",
          lessCertain: true,
        },
      ],
      {
        version: INSIGHTS_VERSION,
        shownEntryIds: [],
        strengths: [
          {
            entryId: "E-high",
            strength: "You bring energy",
            interview: "example",
            cv: "example",
            soft: false,
          },
        ],
        watchOuts: [],
      },
    );
    expect(text).toContain(copyEn.copyCaveat);
    expect(text).toContain("A bit more outgoing");
    expect(text).not.toMatch(/[+-]?\d+\.\d+/);
    expect(text).toContain("Interview:");
    expect(text).toContain("CV:");
  });
});
