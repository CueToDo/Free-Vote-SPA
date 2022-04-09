// Post data to API

export class FreeVoteProfile {
  public givenName = '';
  public familyName = '';
  public alias = '';

  // Location
  public location = '';
  public country = '';
  public city = '';

  public countryId = ''; // for html binding use string
  public cityId = '';

  // Voting
  public constituency = '';
  public council = '';
  public ward = '';

  public constituencyID = '';
  public wardID = ''; // From which councilID is known

  // Personal
  public profilePicture = '';
  public profilePictureOptionID = ''; // for html binding use string

  public profile = '';
}

// For profile picture option update
export class ProfilePictureOption {
  public profilePictureOptionID = '';
  public socialMediaProfilePicture = '';
}

export class VotingArea {
  countryID = '';
  cityID = '';
  constituencyID = '';
  councilID = '';
  wardID = '';

  country = '';
  city = '';
  constituency = '';
  council = '';
  ward = '';
}
