// Post data to API

export class FreeVoteProfile {
  public givenName = '';
  public familyName = '';
  public alias = '';

  // Geographical
  public postcode = '';
  public location = '';
  public countryId = ''; // for html binding use string
  public country = '';
  public cityId = '';
  public city = '';

  // National Politics
  public constituencyID = '';
  public constituency = '';
  public mapItConstituencyID = '';

  public politician = '';
  public politicianUrl = '';
  public politicianImage = '';
  public politicianTwfyMemberID = '';

  // Local Politics
  public wardID = ''; // From which councilID is known
  public ward = '';
  public mapItWardID = '';
  public council = '';

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
  postcode = '';
  countryID = '';
  country = '';
  cityID = '';
  city = '';

  constituencyID = '';
  constituency = '';
  mapItConstituencyID = '';

  politician = '';
  politicianImage = '';
  politicianTwfyUrl = '';
  politicianTwfyMemberID = '';

  wardID = '';
  ward = '';
  mapItWardID = '';
  councilID = '';
  council = '';
}
