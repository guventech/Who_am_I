/** English UI copy. Source: brief Appendix A (default user-facing copy). */
export const copyEn = {
  brand: "Who Am I?",
  promise:
    "10 questions, about 2 minutes. A sketch of how you tend to be, not a diagnosis.",
  duration: "10 questions, about 2 minutes",
  honesty: "A sketch, not a measurement.",
  start: "Start",
  howAccurateLink: "How accurate is this?",
  prototypeBanner: "Prototype - scores not calibrated",
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
    "Guidance for reflection and development — not a diagnosis, not an assessment of ability, and not for hiring or selection.",
  positionWording:
    "Your position compared with others in our sample (0 = in the middle).",
  unclearTrait:
    "Your answers don't settle this one. Go deeper to sharpen it.",
  flagNote:
    "Some answers came very quickly, so your ranges are widened.",
  resultHeading: "Your sketch",
  goDeeperSoon: "Go deeper (coming later)",
  howAccurateHeading: "How accurate is this?",
  howAccurateIntro:
    "Short tests like this can sketch tendencies, but they are not a full measurement. Ranges on your result show uncertainty — where a retake will usually land.",
  howAccurateCaveats: [
    "Ten items are a sketch, not a portrait.",
    "Scores are compared with a sample (provisional norms until calibration).",
    "This is for reflection and development, not hiring or selection.",
    "If a trait is marked unclear, answers did not settle it — go deeper when that round is available.",
    "While the item bank is uncalibrated, treat every number as a prototype.",
  ] as const,
  noAccuracyNumbers:
    "We do not show agreement or retest figures until they are supplied by the calibrated model config.",
  homeToTest: "Start the 10-question sketch.",
  missingResult: "No completed sketch on this device yet.",
  startAgain: "Start again",
  yourSliders: "Five traits",
} as const;
