export enum PointSelectionTypes {
  // Not used in database

  TagPoints = 0, // Standard selection
  Filtered = 1, // Custom selection
  QuestionPoints = 2,
  Point = 3, // Individual Point
  Comments = 4

  // WoW
  // POTW = 4,
  // POTWVote = 5,
  // WoWAdmin = 6,

  // TagSurvey = 7,
  // CDMPProposal = 8
}

export enum PointSortTypes {
  DateDescend = -1, // For new point at top of selection - sortDescending = true
  NoChange = 0,
  DateUpdated = 1, // ToDo: Allows users to "bump" points
  TrendingActivity = 2,
  AllTimePopularity = 3,
  Random = 4
}

export enum PointSupportLevels {
  Support = 1,
  Oppose = -1,
  None = 0, // None given or deleted
  StandAside = -8, // ~ Neutral
  Report = -9
}

export enum PointTypesEnum {
  NotSelected = -1,
  RhetoricalQuestion = 1,
  Fact = 2,
  Meaning = 4,
  Action = 9,
  Opinion = 10,
  Prediction = 12,
  Quote = 13,
  Assumption = 14,
  Anecdote = 15,
  Belief = 16,
  CommonSense = 17,
  Definition = 18,
  SurveyQuestionSingle = 19,
  SurveyQuestionMulti = 20,
  SurveyQuestionRank = 21,
  RecommendedReading = 22,
  RecommendedViewing = 23,
  Tweet = 24,
  ReportOrSurvey = 25,
  RecommendedListening = 26,
  Petition = 27,
  Question = 28,
  CommentOrEditorial = 29,
  NewsReport = 30,
  Observation = 32
}

export enum Tabs {
  notSelected = 0,
  // Tags
  slashTags = 1,

  // Points
  tagPoints = 2,

  // Questions, Answers
  questionList = 3,
  questionAnswers = 4
}

export enum TagCloudTypes {
  Trending /* Stick to the one "order" */,
  Recent /* Personally viewed whether national or local */
}

export enum PointFlags {
  Any = 0,
  Favourite = 1,
  Important = 2
}

export enum MyPointFilter {
  AllVoters = 0,
  MyPublished = 1,
  MyDrafts = 2,
  AllMine = 3,
  Specific = 4
}

export enum PointFeedbackFilter {
  Any = 0,
  Yes = 1,
  No = 2,
  Confirmation = 3
}

export enum OrganisationTypes {
  Any = 22,
  CampaignGroup = 1,
  Party = 2
}

// Numeric enum
export enum GeographicalExtentID {
  GlobalOrganisation = 1,
  Union = 7,
  National = 2,
  Regional = 3,
  City = 4,
  Local = 5,
  PrivateOrganisation = 6
}

// https://stackoverflow.com/questions/50784444/add-description-attribute-to-enum-and-read-this-description-in-typescript
// but, but, but ... wtf?
// javascript can have numeric and string enums
// We get strings from a dropdowns, so ...
export const GeographicalExtent = new Map<string, string>([
  [GeographicalExtentID.GlobalOrganisation.toString(), 'Global'],
  [GeographicalExtentID.Union.toString(), 'Union'],
  [GeographicalExtentID.National.toString(), 'National'],
  [GeographicalExtentID.Regional.toString(), 'Regional'],
  [GeographicalExtentID.City.toString(), 'City'],
  [GeographicalExtentID.Local.toString(), 'Local'],
  [GeographicalExtentID.PrivateOrganisation.toString(), 'Private']
]);

export enum GroupDecisionBasisOption {
  SimpleMajority = 1,
  SuperMajority = 2,
  Unanimous = 3
}

export const DecisionBasisOption = new Map<string, string>([
  [GroupDecisionBasisOption.SimpleMajority.toString(), 'Simple Majority'],
  [GroupDecisionBasisOption.SuperMajority.toString(), 'Super Majority'],
  [GroupDecisionBasisOption.Unanimous.toString(), 'Unanimous']
]);

export enum IssuePhases {
  Unpublished = 0,
  Prioritise = 1,
  DiscussAndDecide = 2,
  Closed = 3
}

export enum IssueStatuses {
  None = -1,
  PrioritisationYetToStart = 1, /// Only Issue Owner can see these, includes draft issues
  Prioritisation = 2,
  Discussion = 4,
  ProposalVoting = 5,
  Closed = 6
}

export enum ProposalStatuses {
  None = -1,
  Question = 0,
  VotingYetToStart = 1,
  VotingInProgress = 2,
  ProposalAccepted = 3,
  ProposalNotAccepted = 4
}

export enum PorQTypes {
  Proposal = 1,
  Question = 2,
  Perspective = 3,
  ProPer = 4 // Proposal Or Perspective
}

export enum MeetingIntervals {
  Weekly = 1,
  MonthlyByDate = 2,
  Variable = 3,
  MonthlyByWeekNumber = 4
}

export enum PoliticalParties {
  AlliancePartyOfNorthernIreland = 222,
  BrexitParty = 2091,
  BritainFirst = 292,
  BritishNationalParty = 223,
  ConservativeAndUnionistParty = 627,
  DemocraticUnionistParty = 738,
  GreenParty = 2012,
  Independent = 354,
  LabourAndCooperativeParty = 1304,
  LabourParty = 641,
  LiberalDemocrats = 140,
  PlaidCymru = 1269,
  ReformUK = 2018,
  ScottishGreenParty = 836,
  ScottishNationalParty = 884,
  SocialDemocraticAndLabourParty = 989,
  SocialDemocraticParty = 960,
  SinnFein = 529,
  TheOfficialMonsterRavingLoonyParty = 709,
  UKIndependenceParty = 2036,
  UlsterUnionistParty = 1088,
  WorkersPartyOfBritain = 2035
}
