import { ID } from './common';

// Models, enums
import { Tag } from './tag.model';
import { PointSupportLevels, PointTypesEnum } from './enums';

export class PointEdit {
  // However the user inputs them, pass them to the server to decode
  constituencyID = 0;
  pointID = 0;
  questionID = 0;
  pointTitle = ''; // PointSlug constructed in API from Title
  pointHTML = '';
  csvImageIDs = '';
  parentPointID = -1;
  pointTypeID = PointTypesEnum.NotSelected;

  soundCloudTrackID = '';
  tags: Tag[] = [];
  draft = false;
}

export class PointEditFormData {
  PointID = -1;
  ConstituencyID = -1;
  QuestionID = 0;
  PointTitle = '';
  PointHTML = '';
  csvImageIDs = '';
  isAnswer = false;
  isComment = false;
  ParentPointID = -1;
  PointTypeID = PointTypesEnum.Opinion;
  Draft = false;
  TagsList: Tag[] = [];
}

// Always use camelCase properties
// https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_Serialization_CamelCasePropertyNamesContractResolver.htm
export class PointSelectionResult {
  // My server and client code agreed these should be capitalised,
  // but after updating to VS Angular project, framework intervenes and insists lower case
  pointCount = 0;

  pointIDs: ID[] = [];
  fromDate = '';
  toDate = '';

  points: Point[] = [];
}

export class PointFeedback {
  woWWeekEndingDate = new Date(); // Does not need to be formatted
  feedbackDate = ''; // Date pipe eugh!
  feedbackGiven = false;
  feedbackID = 0;
  supportLevelID = PointSupportLevels.None;
  pointModified = false; // has the point been modified after feedback was given?
  woWVote = false;
  comment = '';
  feedbackIsUpdatable = false;
  isFavourite = false;
}

export class PointFeedbackFormData {
  pointID = 0;
  pointSupportLevel = PointSupportLevels.None;
  comment = '';
  feedbackAnon = false;
}

export class PointWoWFormData {
  pointID = 0;
  wow = false;
  feedbackAnon = false;
}

export class WoWWeekInfoVoteNotNeeded {
  woWWeekID = 0;
  woWWeekEndingDate = new Date(); //  Does not need to be formatted
}

// Don't even think of making public properties Pascal Case

export class Point {
  constituencyID = 0;
  pointID = 0;
  parentPointID = 0;
  questionID = 0;
  voterIDPoint = 0;
  isPointOwner = false;

  pointTitle = '';
  pointSlug = '';
  pointHTML = '';
  csvPointImages = '';
  csvPointImagesEmbedded = '';
  preview = '';
  previewImage = '';
  csvImageIDs = '';
  draft = false;

  pointTypeID = PointTypesEnum.Opinion;
  pointTypeIDVoter = 0;

  dateTimeCreated = '';
  dateTimeUpdated = ''; // How many times am I going to attempt to make this a Date to use DateTime Pipe
  soundCloudTrackID = '';
  tags: Tag[] = [];

  // Additional link info from site meta data
  linkAddress = '';
  linkTitle = '';
  linkDescription = '';
  linkImage = '';
  showPreview = true;
  isNewSource = false;

  archived = false;

  rowNumber = 0;
  lastRowNumber = 0;
  lastRow = false;

  pointFeedback = new PointFeedback();

  isFavourite = false;
  isImportant = false;
  localInterest = false;

  attached = false;
  adoptable = false;
  unadoptable = false;

  totalFeedback = 0;
  netSupport = 0;
  perCentInFavour = 0;

  support = 0;
  opposition = 0;
  abstentions = 0;
  reports = 0;

  isInOpenedSurvey = false;
  isInClosedSurvey = false;
  isQuestionAnswer = false;
}
