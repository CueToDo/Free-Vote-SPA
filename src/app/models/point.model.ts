import { PointSupportLevels, PointTypesEnum } from './enums';

export class Point {

  PointID: number;
  VoterIDPoint: number;
  IsPointOwner: boolean;

  PointTypeID: PointTypesEnum;
  PointTypeIDVoter: number;

  PointHTML: string;

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
  FeedbackDate: string; // Date pipe eugh!
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

export class PointEdit {
  PointID: number;
  PointHTML: string;
  SlashTags: string; // However the use inputs them, pass them to the server to decode
  Draft: boolean;
}

export class PointSelectionResult {
  PointsSelected: number;
  FromDate: string;
  ToDate: string;
  Points: Point[];
}

export class WoWWeekInfoVote {
  WeekID: number;
  WeekEndingDate: string;
  PointWoWDateTime: string; // damn dates
}
