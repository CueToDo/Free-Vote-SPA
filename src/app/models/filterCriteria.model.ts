import {
  PointSelectionTypes,
  PointTypesEnum,
  PointSortTypes,
  MyPointFilter,
  PointFlags,
  PointFeedbackFilter
} from './enums';

export class FilterCriteria {
  updateTopicViewCount = false;

  constituencyID = 0;

  // SelectionType
  single = false;
  pointSelectionType = PointSelectionTypes.TagPoints;

  // Comments on a Point
  pointID = 0;

  // Answers to Questions
  questionID = 0;

  // QuestionPoints
  sharesTagButNotAttached = false;

  // SlashTag
  slashTag = '';
  anyTag = false;

  // Text Filter
  public text = '';

  // MyPointFilter
  myPointFilter = MyPointFilter.AllVoters;

  // Alias Filter
  byAlias = '';

  // Point Type
  pointTypeID = PointTypesEnum.Opinion;

  // Date Filter
  // Typescript can help, but javascript still rules ???
  // Important that a new date object is created ???
  applyDateFilter = false;
  dateFrom = new Date(Date.now()); // Will be updated on selection
  dateTo = new Date(Date.now()); // Will be updated on selection

  // Flagged as Favourite/Important
  favourites = false;
  pointFlag = PointFlags.Any; // Could be Favourite or Important // Currently only Favourites

  // Whether Feedback Given
  feedbackFilter = PointFeedbackFilter.Any;

  // Sort Type
  sortType = PointSortTypes.TrendingActivity;

  // Sort Order
  sortDescending = true;
}

export class PointsFilterFormData {
  constituencyID = 0;
  byAlias = '';
  onTopic = '';
  pointTextFilter = '';
  pointTypeID = PointTypesEnum.Opinion;
  myPointsFilter = MyPointFilter.AllVoters;
  feedbackFilter = PointFeedbackFilter.Any;
  pointFlag = PointFlags.Any;
  fromDate = '';
  toDate = '';
  pointSortOrder = PointSortTypes.DateUpdated;
  sortDescending = true;
  batchSize = 50;
  pageSize = 10;
}
