/** Central English UI copy (copy/UI v2). No em dashes. */
export const copyEn = {
  brand: "Who Am I?",
  prototypeBanner: "Early version. Your results are a rough guide.",

  // Landing
  promise:
    "Answer 10 short questions and see how you tend to think, feel and work with people. It takes about 2 minutes.",
  youGet:
    "You get: your five traits, your strengths, what to watch out for, and simple tips.",
  start: "Start the test",
  howAccurateLink: "How accurate is this?",
  privacyLink: "Privacy",
  nothingSavedUnless:
    "Nothing is saved unless you say yes at the end.",

  // Questions
  progress: (n: number, total: number) => `Question ${n} of ${total}`,
  back: "← Back",
  likert: [
    "Strongly disagree",
    "Disagree",
    "Not sure",
    "Agree",
    "Strongly agree",
  ] as const,
  answerHint:
    "Answer how you usually are, not how you want to be. There are no right or wrong answers.",
  loadingNext: "Loading next question...",
  workingResults: "Working out your results...",
  takingLonger:
    "This is taking longer than usual. Please wait or try again.",

  // Consent (after Q10)
  consentHeading: "Help us improve the test?",
  consentBody:
    "If you say yes, we save your answers and scores without your name or email. This helps us make the test more accurate.",
  consentAge: "I am 16 or older.",
  consentYes: "Yes, save my answers",
  consentNo: "No, just show my results",
  /** Legacy ConsentBox (unused on landing; kept for compatibility). */
  consentLegend: "Optional storage",
  consentStore:
    "Store my anonymous answers and feedback to improve the test.",
  consentRetake: "Retake later? Keep a session code so I can link a later run.",
  consentDefault: "Nothing is saved unless you say yes at the end.",
  goDeeperDisabled: "Go deeper is not available yet.",
  goDeeperIntro: "A few more questions to make your ranges narrower.",
  startAgain: "Take the test again",
  unclearTrait: "Your answers don't settle this one.",

  // Results
  resultHeading: "Your results",
  resultLead:
    "This shows how you tend to be compared with other people. Use it to learn about yourself, not to judge yourself or others.",
  middleLineNote: "The middle of each line is the average person.",
  savedNot: "Your answers were not saved.",
  savedYes: "Your answers were saved without your name.",
  yourFiveTraits: "Your five traits",
  retakeLegend: "Where a retake would likely land",
  middleLegend: "Middle line = the average person",
  lessCertain: "(less certain)",
  aboutMiddleLong:
    "About in the middle. You can be both, depending on the situation.",
  whatThisMeans: "What this means for you",
  insightsNote:
    "Use these lines in an interview or CV only if you have a real example.",
  yourStrengths: "Your strengths",
  watchOutFor: "Watch out for",
  tryThis: "Try this",
  interviewLabel: "In an interview",
  cvLabel: "On your CV",
  copyResults: "Copy my results",
  copyResultsDone: "Copied",
  takeAgain: "Take the test again",
  tellUsFits: "Tell us if this fits you",
  missingResult: "No completed results on this device yet.",
  sessionCodeStored: "Keep this code to delete your data later:",
  sessionCodeLabel: "Your session code. Shown only once.",
  storageSaving: "Saving your answers...",
  storageFailed: "Could not save. Your results still work on this device.",
  flagNote: "Some answers came very quickly, so your ranges are widened.",

  // How accurate
  howAccurateHeading: "How accurate is this?",
  howAccurateBody: [
    "10 questions can show your general tendencies, but not every detail of who you are. If you take the test again, your results will usually be close, but not the same. The shaded area on each line shows where a retake would likely land.",
    "This is an early version. We are still testing the questions with more people, so treat your results as a rough guide. Please don't use it to choose or reject people for a job.",
    "The questions come from the International Personality Item Pool (ipip.ori.org), which is free for everyone to use.",
  ] as const,

  // Privacy
  privacyHeading: "Privacy",
  privacyBody: [
    "By default, nothing leaves your browser. We do not see your answers.",
    "If you say yes at the end and confirm you are 16 or older, we save: your answers and scores; the version of the test; the type of device (phone, tablet or computer); the day you started (not the time).",
    "We never save your name, email, IP address or anything you type.",
    "After you save, you get a code. Keep it. With this code you can delete your data at any time. We only keep a scrambled version of the code, so we cannot see it.",
    "We delete saved answers after 24 months.",
    "Who runs this: Who Am I? project. Contact: privacy@who-am-i.app",
  ] as const,
  deleteHeading: "Delete my data",
  deleteHint: "Enter the code you got when you saved your results.",
  deleteCodeLabel: "Your code",
  deleteSubmit: "Delete my data",
  deleteDone: "Deleted linked data.",
  deleteNone: "No saved results matched that code.",

  // Feedback
  feedbackBack: "← Your results",
  feedbackHeading: "Does this sound like you?",
  feedbackIntro:
    "Tell us how well each part fits you. Your answers help us improve the test.",
  feedbackNeedSaved:
    "You can only give feedback if you saved your results.",
  feedbackSubmit: "Send feedback",
  feedbackThanks: "Thank you! This helps.",
  feedbackFitLabels: [
    "Not at all",
    "A little",
    "Mostly",
    "Exactly",
  ] as const,
  feedbackShare: "Would you share this test with a friend?",
  feedbackShareYes: "Yes",
  feedbackShareMaybe: "Maybe",
  feedbackShareNo: "No",
  feedbackThisFits: "This fits me:",

  // 404 / errors
  notFoundHeading: "Page not found",
  notFoundBody: "We can't find this page.",
  notFoundHome: "Go to the start",
  errorHeading: "Something went wrong",
  errorBody:
    "Something unexpected happened. Your answers on this device may still be available. Try again or start over.",
  errorRetry: "Try again",

  // Trait display (science name kept in brackets in UI)
  traits: {
    E: {
      title: "Social energy",
      science: "Extraversion",
      left: "Reserved",
      leftDesc: "gets energy from quiet time",
      right: "Outgoing",
      rightDesc: "gets energy from people",
    },
    A: {
      title: "Working with others",
      science: "Agreeableness",
      left: "Direct",
      leftDesc: "says what they think",
      right: "Cooperative",
      rightDesc: "looks for agreement",
    },
    C: {
      title: "Way of working",
      science: "Conscientiousness",
      left: "Flexible",
      leftDesc: "goes with the flow",
      right: "Organised",
      rightDesc: "plans and follows through",
    },
    ES: {
      title: "Handling stress",
      science: "Emotional stability",
      left: "Sensitive",
      leftDesc: "feels things strongly",
      right: "Calm",
      rightDesc: "stays steady under pressure",
    },
    O: {
      title: "Ideas and change",
      science: "Openness",
      left: "Practical",
      leftDesc: "likes what is proven",
      right: "Curious",
      rightDesc: "likes new ideas",
    },
  },
} as const;

/** Optional grey hints under IPIP stems (item text unchanged). */
export const itemHints: Record<string, string> = {
  C02: "(for example, you don't put things back)",
  O02: "(ideas that are not about real, concrete things)",
  E01: "(people notice you at social events)",
  A01: "(other people's problems don't affect you much)",
};
