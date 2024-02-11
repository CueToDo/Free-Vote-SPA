export class Candidate {
  // Election
  electionID = 0;
  electionDate = '';

  // IDs
  politicianID = 0;
  dc_person_id = 0;
  twfy_memberid = 0;

  // Person
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
  personalWebsite = '';
  publicEmailAddress = '';
  twfyUrl = '';
  whoCanIVoteForUrl = '';

  // Party
  partyID = 0;
  party = '';
  partyWebsite = '';
  organisationSlug = '';

  // Sitting MP only
  // twfyUrl = '';
  ukParliamentUrl = '';
  writeToThemUrl = '';

  // Edit
  updated = false;
}
