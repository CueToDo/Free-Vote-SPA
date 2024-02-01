export class Candidate {
  // Election
  electionID = 0;
  electionDate = '';

  // Person
  politicianID = 0;
  name = '';
  image = '';

  // Election
  isCurrentMP = false;
  elected = false;
  electedOnOrBefore = '';
  lastElectionDate = '';

  // Constituency
  constituency = '';
  constituencyNewName = '';
  laterConstituency = '';

  // Contact/More Info
  publicEmailAddress = '';
  twfyUrl = '';
  whoCanIVoteForUrl = '';
  politicianWebsite = '';
  personalUrl = '';

  // Party
  partyID = 0;
  party = '';
  partyWebsite = '';
  organisationSlug = '';

  // Sitting MP only
  // twfyUrl = '';
  ukParliamentUrl = '';
  writeToThemUrl = '';
}
