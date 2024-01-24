export class Constituency {
  // Geographical
  postcode = '';
  countryID = '';
  country = '';
  cityID = '';
  city = '';

  // Constituency ID and Name
  constituencyID = 0; // Parent ConstituencyID for election dates
  gss = ''; // Returns latest GSS, not any historical
  wa1gss = '';
  mapItConstituencyID = 0;
  constituency = ''; // Constituency Name after any boundary changes
  constituencyPrevGen = '';
  constituencyDisplay = '';

  // Boundary Changes
  boundaryReview = -1;
  nameChangeOnNext = false;
  nameChangeThisReview = false;
  defunctNextReview = false;
  newThisReview = false;
  changeFromPrevGen = '';

  // Elected Westminster Politician
  electionDate = '';
  politicianID = 0;
  politician = '';
  electedOnOrBefore = '';
  party = '';
  partyWebsite = '';
  politicianImage = '';
  politicianTwfyUrl = '';
  politicianTwfyMemberID = '';
  politicianWebsite = '';

  // Local Politics - Placeholders only - not reflected in API after removal of VotingArea class
  councilID = '';
  council = '';
  wardID = '';
  ward = '';
  mapItWardID = '';
}
