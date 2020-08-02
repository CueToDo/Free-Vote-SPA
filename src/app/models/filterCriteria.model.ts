import { PointSelectionTypes, PointTypesEnum, PointSortTypes, DraftStatusFilter, PointFlags, PointFeedbackFilter } from './enums';

export class FilterCriteria {

    pointSelectionType = PointSelectionTypes.SlashTag;

    single = false;

    // SlashTag
    slashTag: string;
    anyTag = false;
    previouslyFilteringAnyTag = false;

    // Alias Filter
    applyAliasFilter: boolean;
    byAlias = '';
    previouslyFilteringByAlias = false;

    // Text Filter
    applyTextFilter: boolean;
    previouslyFilteringByText = false;
    text: string;

    // Point Type
    questions = false; // from Tags-Points component
    applyTypeFilter = false;
    previouslyFilteringByType = false;
    pointTypeID = PointTypesEnum.Opinion;
    previousPointTypeID = PointTypesEnum.Opinion;

    // Date Filter
    // Typescript can help, but javascript still rules ???
    // Important that a new date object is created ???
    applyDateFilter: boolean;
    previouslyFilteringByDate = false;
    dateFrom = new Date(Date.now()); // Will be updated on selection
    dateTo = new Date(Date.now()); // Will be updated on selection

    // Flagged as Favourite/Important
    applyFavouritesFilter: boolean;
    favourites = false;
    previouslyFilteringFavourites = false;
    pointFlag = PointFlags.Any; // Could be Favourite or Important // Currently only Favourites

    // My Points or Questions
    myPoints: boolean;
    previouslyFilteringMyPoints = false;

    // Draft Status Filter
    applyDraftFilter = false;
    previouslyFilteringDraft = false;
    draftStatus = DraftStatusFilter.Any;

    // Whether Feedback Given
    applyFeedbackFilter: boolean;
    previouslyFilteringByFeedback = false;
    feedbackFilter = PointFeedbackFilter.Any;

    // Result Sort
    sortType = PointSortTypes.TrendingActivity;
    sortAscending = false;

    get activeFilters(): Boolean {
        return this.myPoints || this.applyAliasFilter || this.applyDraftFilter || this.anyTag || this.applyTextFilter
            || this.applyDateFilter || this.applyFeedbackFilter || this.favourites;
    }

    public HasFilter(): boolean {
        return this.myPoints
            || this.applyDraftFilter
            || this.applyAliasFilter && !!this.byAlias
            || this.applyFavouritesFilter
            || this.applyTextFilter && !!this.text
            || this.applyTypeFilter
            || this.applyDateFilter
            || this.applyFeedbackFilter;
    }

    public HasSavedFilter(): boolean {
        return this.previouslyFilteringMyPoints
            || this.previouslyFilteringDraft
            || this.previouslyFilteringByAlias && !!this.byAlias
            || this.previouslyFilteringFavourites
            || this.previouslyFilteringByText && !!this.text
            || this.previouslyFilteringByType
            || this.previouslyFilteringByDate
            || this.previouslyFilteringByFeedback;
    }
}
