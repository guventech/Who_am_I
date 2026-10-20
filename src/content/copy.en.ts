/** English UI copy. Source: brief Appendix A (default user-facing copy). */
export const copyEn = {
  brand: "Who Am I?",
  promise:
    "10 questions, about 2 minutes. A sketch of how you tend to be, not a diagnosis.",
  duration: "10 questions, about 2 minutes",
  honesty: "A sketch, not a measurement.",
  start: "Start",
  howAccurateLink: "How accurate is this?",
  prototypeBanner: "Prototype: scores are not calibrated yet",
  progress: (n: number, total: number) => `${n} of ${total}`,
  back: "Back",
  likert: [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ] as const,
  disclaimer:
    "For reflection and growth. Not a diagnosis, not a test of ability, and not for hiring or selection.",
  positionWording:
    "Compared with other people who took the test (0 is the middle).",
  unclearTrait:
    "Your answers don't settle this one. Go deeper to sharpen it.",
  flagNote:
    "Some answers came very quickly, so your ranges are widened.",
  resultHeading: "Your sketch",
  goDeeper: "Go deeper",
  goDeeperDisabled:
    "Go deeper is not available yet. It needs a checked set of Honesty-Humility questions.",
  goDeeperHeading: "Go deeper",
  goDeeperIntro:
    "A few more questions to make your ranges narrower and add a sixth trait: Honesty-Humility.",
  yourSlidersDeeper: "Traits (including Honesty-Humility)",
  howAccurateHeading: "How accurate is this?",
  howAccurateIntro:
    "Short tests like this can sketch tendencies, but they are not a full measurement. The ranges on your result show where a retake will usually land.",
  howAccurateCaveats: [
    "Ten items are a sketch, not a portrait.",
    "Scores are compared with a sample (provisional norms until calibration).",
    "This is for reflection and development, not hiring or selection.",
    "If a trait is marked unclear, your answers did not settle it.",
    "While the item bank is uncalibrated, treat every number as a prototype.",
  ] as const,
  noAccuracyNumbers:
    "We will show accuracy figures once we have tested the questions with enough people.",
  homeToTest: "Start the 10-question sketch.",
  missingResult: "No completed sketch on this device yet.",
  startAgain: "Start again",
  yourSliders: "Five traits",
  insightsHeading: "Personal insights",
  insightsExamplesNote:
    "Only use these lines if you have a real example that backs them up.",
  insightsStrengths: "Strengths to shine with",
  insightsWatchOuts: "Watch-outs",
  insightsImprove: "Things to improve",
  insightsWorkWith: "Working best with others",
  insightsGoDeeper:
    "Your answers don't settle clear poles yet. Go deeper when that round is available to sharpen this sketch.",
  softMarker: "◌ less certain",
  copyInsights: "Copy my insights as text",
  copyInsightsDone: "Copied",
  llmRewordStub: "Reword with AI (coming later)",
  consentLegend: "Optional storage",
  consentStore:
    "Store my anonymous answers and feedback to improve the test.",
  consentAge: "I confirm I am 16 or older.",
  consentRetake: "Retake later? Keep a session code so I can link a later run.",
  consentDefault:
    "By default, the test runs only in your browser and nothing is sent to us.",
  privacyLink: "Privacy",
  feedbackLink: "Feedback",
  deleteData: "Delete my data",
  sessionCodeLabel:
    "Your session code. It is shown only once, so save it to delete or retake.",
  sessionCodeStored: "Answers stored anonymously. Keep this code:",
  storageSkipped: "Nothing was stored (client-only).",
  storageSaving: "Saving anonymous answers…",
  storageFailed: "Could not store answers. Your result still works offline.",
  feedbackHeading: "Feedback",
  feedbackIntro:
    "These ratings show how much the sketch feels right to you. They do not measure accuracy.",
  feedbackOverall: "Overall, how much does this sketch fit you?",
  feedbackTraitFit: "How much is this you?",
  feedbackTraitOff: "Is this off?",
  feedbackTooHigh: "Too high",
  feedbackAboutRight: "About right",
  feedbackTooLow: "Too low",
  feedbackSubmit: "Submit feedback",
  feedbackThanks: "Thank you. Your feedback is saved.",
  feedbackNeedConsent: "Feedback is only available when you consented to storage.",
  feedbackNeedCode: "Complete a stored session first to leave feedback.",
  feedbackChooseOverall: "Choose a rating",
  privacyHeading: "Privacy (draft)",
  privacyBody: [
    "By default, the test runs only in your browser and nothing is sent to us.",
    "If you consent and confirm you are 16 or older, we store one anonymous payload on completion: responses, scores, quality flags, model version, coarse device class, and a day-rounded start date. Locale is always English.",
    "We do not store names, emails, IP addresses, precise timestamps, or free text.",
    "A session code is shown once; only a hash of that code is stored. You can use the code to delete linked data or optionally link a retake.",
    "We delete stored answers after 24 months.",
    "Who Am I? is run by the project operator. Contact: privacy@who-am-i.app",
  ] as const,
  ipipAttribution:
    "Questions are adapted from the International Personality Item Pool (ipip.ori.org), which is in the public domain.",
  deleteHeading: "Delete my data",
  deleteHint: "Enter the session code you were shown at the end of a stored run.",
  deleteSubmit: "Delete linked sessions",
  deleteDone: "Deleted linked sessions.",
  deleteNone: "No stored sessions matched that code.",
  deleteCodeLabel: "Session code",
  errorHeading: "Something went wrong",
  errorBody:
    "The sketch hit an unexpected error. Your answers on this device may still be available  -  try again or start over.",
  errorRetry: "Try again",
} as const;
