import { PointSupportLevels } from './enums';

export class Point {

  PointID: number;
  VoterIDPoint: number;
  IsPointOwner: boolean;

  PointTypeID: number;
  PointTypeIDVoter: number;

  PointText: string;

  Draft: boolean;
  Source: string;
  URL: string;
  Archived: boolean;
  DateTimeUpdated: string;

  Sequence: number;
  LastRowNumber: number;
  LastRow: boolean;

  FeedbackGiven: boolean;
  FeedbackID: number;
  SupportLevelID: PointSupportLevels;
  Comment: string;
  FeedbackDate: string;
  FeedbackIsUpdatable: boolean;
  WoWVote: boolean;

  Attached: boolean;

  Adoptable: boolean;
  Unadoptable: boolean;

  TotalFeedback: number;
  NetSupport: number;
  PerCentInFavour: number;

  Support: number;
  Opposition: number;
  Abstentions: number;
  Reports: number;

  IsInOpenedSurvey: boolean;
  IsInClosedSurvey: boolean;
  IsQuestionAnswer: boolean;

  SlashTags: string[];
}


export class PointSelectionResult {
  PointsSelected: number;
  FromDate: string;
  ToDate: string;
  Points: Point[];
}
