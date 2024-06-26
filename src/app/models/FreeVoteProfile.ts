// Post data to API

export class FreeVoteProfile {
  public sessionID = '';
  public email = '';
  public voterID = '';

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
  public constituency = '';
  public constituencyID = 0; // Not saved to localData

  // Local Politics
  public ward = '';
  public council = '';
  public wardID = ''; // Not saved to localData

  // Personal
  public profilePicture = '';
  public profilePictureOptionID = ''; // for html binding use string

  public profile = '';
}

export class ProfileEditFormData {
  public alias = '';
  public firstName = '';
  public lastName = '';
  public postcode = '';
  public countryID = 0;
  public cityID = 0;
  public constituencyID = 0;
  public wardID = 0;
}

// For profile picture option update
export class ProfilePictureOption {
  public profilePictureOptionID = '';
  public socialMediaProfilePicture = '';
}
