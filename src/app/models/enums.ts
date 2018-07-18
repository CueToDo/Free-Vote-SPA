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
