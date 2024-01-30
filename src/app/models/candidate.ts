export class Candidate {
  // Election
  electionID = 0;
  electionDate = '';

  // Person
  politicianID = 0;
  name = '';
  image = '';

  isCurrentMP = false;
  elected = false;
  electedOnOrBefore = '';
  laterConstituency = '';

  // Contact/More Info
  publicEmailAddress = '';
  twfyUrl = '';
  whoCanIVoteForUrl = '';
  politicianWebsite = '';
  personalUrl = '';

  // Party
  party = '';
  partyWebsite = '';
  organisationSlug = '';

  // Sitting MP only
  // twfyUrl = '';
  ukParliamentUrl = '';
  writeToThemUrl = '';
}

// Used to search for Westminster Election candidates by name
export class CandidateSearchResult {
  name = '';
  party = '';
  constituency = '';
  constituencyNewName = '';
  lastElectionDate = '';
}
