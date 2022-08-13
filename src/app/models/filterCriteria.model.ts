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
  sortAscending = false;
  get sortDescending(): boolean {
    return !this.sortAscending;
  }
  savedSortDescending = !this.sortAscending;
}
