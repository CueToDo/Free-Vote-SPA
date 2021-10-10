// Post data to API

export class FreeVoteProfile {
  public alias = '';

  public country = '';
  public city = '';

  public countryId = ''; // for html binding use string
  public cityId = '';

  public profilePicture = '';
  public profilePictureOptionID = ''; // for html binding use string
}

// For profile picture option update
export class ProfilePictureOption {
  public profilePictureOptionID = '';
  public socialMediaProfilePicture = '';
}
