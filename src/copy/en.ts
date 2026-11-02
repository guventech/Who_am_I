/** Central English UI copy (copy/UI v2). No em dashes. */
export const copyEn = {
  brand: "Who Am I?",
  brandAttribution: "A personal project by Guven Bircan",
  brandReturn: "Back to Bircans",
  resultsLocalOnly:
    "Your results stay in this browser session. We do not save new answers or results on our servers.",
  legacyDeleteLabel: "I saved data in an earlier version",
  prototypeBanner: "Early version. Your results are a rough guide.",

  // Landing
  promise:
    "Answer 10 short questions and see how you tend to think, feel and work with people. It takes about 2 minutes.",
  youGet:
    "You get: your five traits, your strengths, what to watch out for, and simple tips.",
  start: "Start the test",
  landingExpectation: "This is a rough guide for self-reflection, not a diagnosis.",
  howAccurateLink: "How accurate is this?",
  privacyLink: "Privacy",
  nothingSavedUnless:
    "Nothing is sent or stored on our side unless you say yes at the end.",

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
  loading: "Loading...",
  loadingNext: "Loading next question...",
  workingResults: "Working out your results...",
  scoringFailed:
    "We could not work out your results. Your answers are still here. Please try again.",
  takingLonger: "This is taking longer than usual. Please wait or try again.",
  noSessionHeading: "No test in progress",
  noSessionBody: "Start from the home page to answer the questions.",
  noSessionCta: "Go to the start",

  // Consent (after Q10)
  consentHeading: "Help us improve the test?",
  consentBody:
    "If you say yes, we save your answers and scores without your name or email. This helps us make the test more accurate.",
  consentStorageNote: "Nothing is sent or stored on our side unless you say yes.",
  consentAge: "I am 16 or older.",
  consentYes: "Yes, save my answers",
  consentNo: "No, just show my results",
  /** Legacy ConsentBox (unused on landing; kept for compatibility). */
  consentLegend: "Optional storage",
  consentStore: "Store my anonymous answers and feedback to improve the test.",
  consentRetake: "Retake later? Keep a session code so I can link a later run.",
  consentDefault: "Nothing is sent or stored on our side unless you say yes at the end.",
  goDeeperDisabled: "Go deeper is not available yet.",
  goDeeperIntro:
    "About 10 more questions. Adds Honesty-Humility and may narrow some ranges.",
  goDeeperCta: "Go deeper",
  goDeeperHint: "About 10 more questions. Adds Honesty-Humility.",
  startAgain: "Take the test again",
  unclearTrait: "Your answers don't settle this one.",

  // Results
  resultHeading: "Your results",
  resultLead:
    "This is a rough guide for self-reflection. Use it to notice patterns in yourself, not to judge yourself or other people.",
  scoresNote: "Early version. Not yet checked with real people.",
  middleLineNote: "The middle of each line is the middle of the scale.",
  savedNot: "Your answers were not saved on our side.",
  saveUnconfirmed: "We could not confirm whether your answers were saved.",
  savedYes: "Your answers were saved without your name.",
  yourFiveTraits: "Your five traits",
  yourSixTraits: "Your six traits",
  colourHeading: "Colour summary",
  colourDisclaimer:
    "Colours simplify two of your sliders. They are not a validated typology. People are not their colour.",
  colourBalanced: "Balanced, no dominant colour",
  colourSecondary: "Secondary",
  colourLabels: {
    red: "Red: driven, decisive, direct",
    yellow: "Yellow: enthusiastic, sociable, persuasive",
    green: "Green: supportive, patient, harmonious",
    blue: "Blue: precise, analytical, careful",
  } as const,
  retakeLegend: "Shaded band: where a retake might land (early estimate)",
  middleLegend: "Middle line = the middle of the scale",
  lessCertain: "(less certain)",
  aboutMiddleLong: "About in the middle. You can be both, depending on the situation.",
  whatThisMeans: "What this means for you",
  insightsNote:
    "These interview and CV lines are wording ideas. Adapt them only if they match a real example from your own life. They are not proof of who you are.",
  notForJudgingOthers:
    "Fine for your own reflection. Not for judging, choosing or rejecting other people.",
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
  storageFailed:
    "We could not confirm the save. Your results still work on this device. Try again to recover your code.",
  storageRetry: "Try saving again",
  flagNote: "Some answers came very quickly, so your ranges are widened.",
  copyCaveat:
    "Early version. Rough guide for self-reflection. Not for judging, choosing or rejecting other people.",

  // How accurate
  howAccurateHeading: "How accurate is this?",
  howAccurateBody: [
    "10 questions can show general tendencies, but not every detail of who you are. If you take the test again, your results may shift. The shaded area on each line is an early estimate of where a retake might land. It has not yet been checked with real retakes.",
    "This is an early version. Fine for thinking about yourself. Not for judging, choosing or rejecting other people.",
    "The questions come from the International Personality Item Pool (ipip.ori.org), which is free for everyone to use.",
  ] as const,

  // Privacy
  privacyHeading: "Privacy",
  privacyBody: [
    "Your answers and results stay in this browser session. We do not send them to a database or save new results on our servers.",
    "Closing this browser tab normally clears the session. If you want to keep your results, use Copy my results and save the text yourself.",
    "The website host still processes ordinary page requests to deliver the site and prevent misuse. Your quiz answers are not included in those requests.",
    "If you saved data in an earlier version, your existing code can still be used to request deletion below. Previously saved answers retain their original 24-month deletion period.",
    "Who runs this: Guven Bircan, a personal Bircans project. Visit bircans.com for contact details.",
  ] as const,
  deleteHeading: "Delete my data",
  deleteHint: "Enter the code you got when you saved your results.",
  deleteCodeLabel: "Your code",
  deleteSubmit: "Delete my data",
  deleteDone: "Deleted linked data.",
  deleteNone: "No saved results matched that code.",
  deleteFailed:
    "We could not delete your data. Check your code and connection, then try again.",

  // Feedback
  feedbackBack: "← Your results",
  feedbackHeading: "Does this sound like you?",
  feedbackIntro:
    "Tell us how well each part fits you. Your answers help us improve the test.",
  feedbackNeedSaved: "You can only give feedback if you saved your results.",
  feedbackSubmit: "Send feedback",
  feedbackThanks: "Thank you! This helps.",
  feedbackFitLabels: ["Not at all", "A little", "Mostly", "Exactly"] as const,
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
    H: {
      title: "Honesty and humility",
      science: "Honesty-Humility",
      left: "Self-promoting",
      leftDesc: "status-oriented",
      right: "Modest",
      rightDesc: "fairness-oriented",
    },
  },
} as const;

/**
 * Grey hints under IPIP / HEXACO stems (item text under each id is unchanged).
 * Keep short, plain, and in parentheses.
 */
export const itemHints: Record<string, string> = {
  // Core fixed form (and shared pool)
  X01: "(new people, not only friends you already know)",
  X02: "(when things do not go as planned)",
  X03: "(a lively debate about ideas, not a personal fight)",
  X04: "(you step in when the group is stuck)",
  X05: "(you say so when you disagree)",
  X06: "(curious about ideas even with no clear use yet)",
  X07: "(you stay steady when someone criticises you)",
  X08: "(you plan ahead more than you decide on the spot)",
  X09: "(other people come before your own plans)",
  X10: "(you keep strong feelings private in public)",
  E01: "(people notice you at social events)",
  E02: "(you speak little in groups)",
  E03: "(you feel fine with people around you)",
  E04: "(you stay out of the spotlight)",
  E05: "(you are the one who begins the chat)",
  E06: "(you rarely have much to say)",
  E07: "(at parties you talk with many different people)",
  E08: "(you prefer not to be noticed)",
  E09: "(you are fine when all eyes are on you)",
  E10: "(with people you do not know yet)",
  A01: "(other people's problems don't affect you much)",
  A02: "(you like getting to know people)",
  A03: "(you say harsh or rude things to people)",
  A04: "(you feel with people when they hurt)",
  A05: "(other people's problems do not hold your interest)",
  A06: "(you are gentle and kind-hearted)",
  A07: "(other people do not really interest you)",
  A08: "(you make time to help other people)",
  A09: "(you pick up how other people feel)",
  A10: "(people feel relaxed with you)",
  C01: "(you are ready before you need to be)",
  C02: "(for example, you don't put things back)",
  C03: "(small details matter to you)",
  C04: "(things often end up messy around you)",
  C05: "(you do chores without putting them off)",
  C06: "(you often leave things out of place)",
  C07: "(you like things neat and organised)",
  C08: "(you avoid jobs you are meant to do)",
  C09: "(you stick to a plan or timetable)",
  C10: "(you are careful and picky about your work)",
  ES01: "(small pressure gets to you quickly)",
  ES02: "(you feel calm most days)",
  ES03: "(you keep thinking about what might go wrong)",
  ES04: "(you rarely feel sad or down)",
  ES05: "(small things throw you off)",
  ES06: "(you get upset over small things)",
  ES07: "(your mood shifts a lot)",
  ES08: "(your feelings go up and down often)",
  ES09: "(little things make you irritable)",
  ES10: "(you often feel sad or down)",
  O01: "(you know and use many words)",
  O02: "(ideas that are not about real, concrete things)",
  O03: "(you picture things clearly in your mind)",
  O04: "(ideas that are not about real, concrete things)",
  O05: "(you often come up with strong ideas)",
  O06: "(you do not picture things easily)",
  O07: "(you grasp new things fast)",
  O08: "(you use uncommon or hard words)",
  O09: "(you spend time thinking things through)",
  O10: "(you have many ideas)",
  // Honesty-Humility (go deeper)
  HH01: "(you do not put on a false image of yourself)",
  HH02: "(you would not steal or take what is not yours)",
  HH03: "(fame and being a celebrity do not appeal to you)",
  HH04: "(you do not see yourself as above other people)",
  HH05: "(you praise people mainly to get something from them)",
  HH06: "(you break rules to win or get ahead)",
};
