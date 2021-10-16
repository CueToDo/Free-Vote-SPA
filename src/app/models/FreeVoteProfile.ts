// Post data to API

export class FreeVoteProfile {
  public givenName = '';
  public familyName = '';
  public alias = '';

  public location = '';
  public country = '';
  public city = '';

  public countryId = ''; // for html binding use string
  public cityId = '';

  public profilePicture = '';
  public profilePictureOptionID = ''; // for html binding use string

  public profile = '';
}

// For profile picture option update
export class ProfilePictureOption {
  public profilePictureOptionID = '';
  public socialMediaProfilePicture = '';
}
