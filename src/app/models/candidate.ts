export class Candidate {
  politicianID = 0;
  name = '';
  party = '';
  partyWebsite = '';
  organisationSlug = '';
  elected = false;
  electedOnOrBefore = '';
  image = '';
  publicEmailAddress = '';
  laterConstituency = '';

  // Sitting MP only
  twfyUrl = '';
  ukParliamentUrl = '';
  writeToThemUrl = '';
  personalUrl = '';
}

export class CandidateSearchResult {
  name = '';
  party = '';
  constituency = '';
  lastElectionDate = '';
}
