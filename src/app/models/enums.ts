export enum SignInStatuses {
  AlreadyAuthenticated = -1, // Does not prevent user logging in: User may already be authenticated but require higher permissions

  EmailNotProvided = 1,
  EmailFormatNotValid = 2,
  EmailNotRegistered = 3,
  EmailNotVerified = 4,

  PasswordNotProvided = 10,
  PasswordTooShort = 11,
  PasswordTooLong = 12,

  TokenSent = 20, // Upon Request
  TokenNotProvided = 21, // Sign In with Token
  TokenNotValid = 22, // Token validation

  SignInSuccess = 30,
  SignInFailure = 31,
  AccountLocked = 32,
  SignedOut = 33, // SPA only

  RegistrationSuccess = 40,
  RegistrationFailure = 41,
  RequestToJoinNotYetApproved = 42,

  IPAddressBlocked = 50,
  IPAddressValid = 51,

  ErrorOccurred = 99
}

export enum PointSelectionTypes {
  // Not used in database
  Tag,
  TagSurvey,
  CDMPProposal,

  POTW,
  POTWVote,
  WoWAdmin,

  MyPoints,
  FavouritePoints,
  Point,

  Group,
  Popular
}

export enum PointSupportLevels {
  Support = 1,
  Oppose = -1,
  None = 0, // None given or deleted
  StandAside = -8, // ~ Neutral
  Report = -9
}

export enum PointTypesEnum {
  NotSelected = -1,
  RhetoricalQuestion = 1,
  Fact = 2,
  Meaning = 4,
  Action = 9,
  Opinion = 10,
  Prediction = 12,
  Quote = 13,
  Assumption = 14,
  Anecdote = 15,
  Belief = 16,
  Commonsense = 17,
  Definition = 18,
  SurveyQuestionSingle = 19,
  SurveyQuestionMulti = 20,
  SurveyQuestionRank = 21,
  RecommendedReading = 22,
  RecommendedViewing = 23,
  Tweet = 24
}
