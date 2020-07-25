// import { BreakpointState } from '@angular/cdk/layout';

// Angular
import { OnDestroy, EventEmitter, Output, Input } from '@angular/core';

// import { Pipe } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// auth0
import { LocalDataService } from '../../services/local-data.service';

// FreeVote Models
import { PointSelectionResult } from '../../models/point.model';

import {
  PointSelectionTypes, PointTypesEnum, PointFlags, PointSortTypes,
  PointFeedbackFilter, DraftStatusFilter
} from '../../models/enums';

import { Point } from '../../models/point.model';
import { ID } from 'src/app/models/common';

// FreeVote Services
import { AppDataService } from '../../services/app-data.service';
import { PointsService } from '../../services/points.service';
import { Subscription } from 'rxjs';
import { Kvp } from 'src/app/models/kvp.model';

@Component({
  selector: 'app-points', // is router-outlet
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css'],
  preserveWhitespaces: true // [DOESN'T WORK see component css - doesn't work in styles.css???]
  // for space between buttons - https://github.com/angular/material2/issues/11397
})
export class PointsComponent implements OnInit, OnDestroy {

  @Output() applyFilter = new EventEmitter<boolean>();
  @Output() pointSortTypeChanged = new EventEmitter<PointSortTypes>();

  // Subscriptions
  private pointSelection$: Subscription;
  private pointSortType$: Subscription;
  private pointSortAscending$: Subscription;
  private pointFilter$: Subscription;
  private widthSubject$: Subscription;

  // PointSelectionType default is SlashTag
  public pointSelectionType = PointSelectionTypes.SlashTag;

  pointFlag = PointFlags.Any; // Could be Favourite or Important

  slashTagFilter = '';

  // Point selection filters
  showFilters = false;

  // Voter Filter
  filteringMyPoints = false;
  previouslyFilteringMyPoints = false;

  // Draft Status Filter
  showDraftFilter = false;
  previouslyShowingDraftFilter = false;
  draftStatusFilter = DraftStatusFilter.Any;

  showVoterFilter = false;
  previouslyShowingVoterFilter = false;
  byAliasFilter = '';

  // Tag Filter
  anyTag = false;
  previouslyFilteringAnyTag = false;

  // Text Filter
  showTextFilter = false;
  previouslyShowingTextFilter = false;
  pointTextFilter = '';

  // Type Filter
  showTypeFilter = false;
  previouslyShowingTypeFilter = false;
  pointTypeIDFilter = PointTypesEnum.Opinion;
  previousPointTypeIDFilter = PointTypesEnum.Opinion;
  filterQuestions = false; // from parent Tags-Points component
  qa = 'point';
  pointTypes: Kvp[];

  // Date Filter
  // Typescript can help, but javascript still rules ???
  // Important that a new date object is created ???
  showDateFilter = false;
  previouslyShowingDateFilter = false;
  dateFrom = new Date(Date.now()); // Will be updated on selection
  dateTo = new Date(Date.now());

  // Feedback Filter
  showFeedbackFilter = false;
  previouslyShowingFeedbackFilter = false;
  feedbackFilter = PointFeedbackFilter.Any;

  // Favourites Filter
  public filteringFavourites = false;
  public previouslyfilteringFavourites = false;
  public favouritesText = 'favourites';

  get activeFilters(): Boolean {
    return this.filteringMyPoints || this.showVoterFilter || this.showDraftFilter || this.anyTag || this.showTextFilter
      || this.showDateFilter || this.showFeedbackFilter || this.filteringFavourites;
  }

  // Point sort order: Default to Trending
  public pointSortType = PointSortTypes.TrendingActivity;
  public pointSortAscending = false;

  public pointCount: number;
  public pointIDs: ID[] = [];
  public points: Point[] = [];
  public singlePoint = false;

  public error: string;
  public alreadyFetchingPointsFromDB = false;
  public allPointsDisplayed = false;

  // enums in template
  public DraftStatusFilter = DraftStatusFilter;
  public PointFeedbackFilter = PointFeedbackFilter;

  private get lastBatchRow(): number {
    let lastRow = 0;
    if (this.pointIDs && this.pointIDs.length > 0) {
      lastRow = this.pointIDs[this.pointIDs.length - 1].rowNumber;
    }
    return lastRow;
  }

  private get lastPageRow(): number {
    let lastRow = 0;
    if (this.points && this.points.length > 0) {
      lastRow = this.points[this.points.length - 1].rowNumber;
    }
    if (this.points.length > lastRow) { lastRow = this.points.length; } // Defensive if point count from databsae is wrong
    return lastRow;
  }

  public nextPagePointsCount(): number {
    return this.pointIDs
      .filter(val => val.rowNumber > this.lastPageRow)
      .slice(0, 10).length;
  }


  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    public appData: AppDataService,
    private pointsService: PointsService
  ) { }

  ngOnInit() {

    this.byAliasFilter = this.localData.ActiveAliasForFilter;

    this.appData.PointTypes().subscribe(
      pointTypes => this.pointTypes = pointTypes
    );

    // Also, there’s no need to unsubscribe from the paramMap.
    // The ActivatedRoute dies with the routed component and so
    // the subscription dies with it.
    this.activatedRoute.paramMap.subscribe(params => {

      let tag = false;
      let alias = false;
      const titleParam = params.get('title');
      const tagParam = params.get('tag');
      const aliasParam = params.get('alias');

      if (tagParam) {
        this.anyTag = false;
        this.pointSelectionType = PointSelectionTypes.SlashTag;
        this.slashTagFilter = `/${tagParam}`;
        tag = true;
      }

      if (aliasParam) {
        this.pointSelectionType = PointSelectionTypes.Filtered;
        this.byAliasFilter = aliasParam;
        if (!this.slashTagFilter) { this.anyTag = true; }
        this.showFilters = true;
        this.showVoterFilter = true;
        alias = true;
      }


      if (titleParam) {
        this.singlePoint = true;
        this.SelectSpecificPoint(tagParam, titleParam);
      } else if (tag || alias) {
        this.singlePoint = false;
        this.SelectPoints();
      }

      if (tag && !alias) {
        this.applyFilter.emit(false); // Pass to parent tags-points component
        // tags-points component could also suscribe to paramMap,
        // but only need child or parent to do this, not both
      }
    });

    this.pointSelection$ = this.appData.ReSelectPoints$
      .subscribe(
        (pointSortType: PointSortTypes) => {
          this.slashTagFilter = this.localData.PreviousSlashTagSelected; // Set by the Point-Edit Component
          this.SetAppComponentTitle();
          if (pointSortType !== PointSortTypes.NoChange) {
            if (pointSortType === PointSortTypes.DateDescend) {
              this.pointSortType = PointSortTypes.DateCreated;
              this.pointSortAscending = false; // Ensure new point at top
            } else {
              this.pointSortType = pointSortType;
            }
          }
          this.SelectPoints();
        }
      );

    this.pointSortType$ = this.appData.PointSortType$.subscribe(
      (pointSortType: PointSortTypes) => {
        if (this.pointCount > 1) {
          // Don't go to server to re-sort if only 1 point selected
          this.newSortType(pointSortType);
        }
      }
    );

    this.pointSortAscending$ = this.appData.PointSortAscending$.subscribe(
      (ascending: boolean) => {
        this.pointSortAscending = ascending;
        this.SelectPoints();
      }
    );

    // Communicated from TagsPoints - filter criteria
    // Communicated from Tags Component - hide filters
    this.pointFilter$ = this.appData.PointsFiltered$.subscribe(
      (showFilters: boolean) => {

        this.error = ''; // clear any filter error if tags-points removes filter

        this.showFilters = showFilters;

        if (showFilters) {
          this.pointSelectionType = PointSelectionTypes.Filtered;
          this.pointTypeIDFilter = this.previousPointTypeIDFilter;

          // Reapply previous filters
          this.filteringMyPoints = this.previouslyFilteringMyPoints;
          this.showDraftFilter = this.previouslyShowingDraftFilter;
          this.showVoterFilter = this.previouslyShowingVoterFilter && !this.filteringMyPoints && !!this.byAliasFilter;
          this.filteringFavourites = this.previouslyfilteringFavourites;
          this.anyTag = this.previouslyFilteringAnyTag;
          this.showTextFilter = this.previouslyShowingTextFilter;
          this.showTypeFilter = this.previouslyShowingTypeFilter;
          this.showDateFilter = this.previouslyShowingDateFilter;
          this.showFeedbackFilter = this.previouslyShowingFeedbackFilter;

          // If there aren't any active filters, then Filtered Select is same as Tag Select
          // Only reselect points if we now have active filters
          if (this.HasFilter()) {
            this.SelectPoints();
          }
        } else {

          this.pointSelectionType = PointSelectionTypes.SlashTag;
          this.pointTypeIDFilter = PointTypesEnum.NotSelected;

          // Remove Filters if no longer showing
          this.previouslyFilteringMyPoints = this.filteringMyPoints;
          this.previouslyShowingDraftFilter = this.showDraftFilter;
          this.previouslyShowingVoterFilter = this.showVoterFilter;
          this.previouslyfilteringFavourites = this.filteringFavourites;
          this.previouslyFilteringAnyTag = this.anyTag;
          this.previouslyShowingTextFilter = this.showTextFilter;
          this.previouslyShowingTypeFilter = this.showTypeFilter;
          this.previouslyShowingDateFilter = this.showDateFilter;
          this.previouslyShowingFeedbackFilter = this.showFeedbackFilter;

          this.filteringMyPoints = false;
          this.showDraftFilter = false;
          this.showVoterFilter = false;
          this.filteringFavourites = false;
          this.anyTag = false;
          this.showTextFilter = false;
          this.showTypeFilter = false;
          this.showDateFilter = false;
          this.showFeedbackFilter = false;

          // If weren't any active filters, then Tag Select is same as Filtered Select
          // Only reselect points if there were previous active filters
          if (this.HasSavedFilter()) {
            this.SelectPoints();
          }
        }


        this.SetAppComponentTitle();
      }
    );


    this.widthSubject$ = this.appData.DisplayWidth$.subscribe(
      width => { if (width === 0) { this.favouritesText = 'favs'; } else { this.favouritesText = 'favourites'; } }
    );

  }

  public HasFilter(): boolean {
    return this.filteringMyPoints
      || this.showDraftFilter
      || this.showVoterFilter && !!this.byAliasFilter
      || this.filteringFavourites
      || this.showTextFilter && !!this.pointTextFilter
      || this.showTypeFilter
      || this.showDateFilter
      || this.showFeedbackFilter;
  }

  public HasSavedFilter(): boolean {
    return this.previouslyFilteringMyPoints
      || this.previouslyShowingDraftFilter
      || this.previouslyShowingVoterFilter && !!this.byAliasFilter
      || this.previouslyfilteringFavourites
      || this.previouslyShowingTextFilter && !!this.pointTextFilter
      || this.previouslyShowingTypeFilter
      || this.previouslyShowingDateFilter
      || this.previouslyShowingFeedbackFilter;
  }

  MyFilter() {
    if (this.filteringMyPoints) {
      this.showVoterFilter = false;
    }
    this.showDraftFilter = this.filteringMyPoints;
    this.SetAppComponentTitle();
    this.SelectPoints();
  }

  VoterFilter() {
    let changeAlias = false;

    if (!this.byAliasFilter) { this.byAliasFilter = ''; } // ensure compare empty with empty not nulls
    if (!this.localData.PreviousAliasSelected) { this.localData.PreviousAliasSelected = ''; }

    if (this.showVoterFilter) {
      this.filteringMyPoints = false;
      this.localData.RestoreAliasFilter();
      changeAlias = this.byAliasFilter !== this.localData.PreviousAliasSelected;
      this.byAliasFilter = this.localData.PreviousAliasSelected; // Will always have a value whereas Active may be empty
    } else {
      // Not filtering on Alias
      changeAlias = !!this.byAliasFilter; // we were filtering, now we're not
      this.byAliasFilter = '';
      this.localData.ClearAliasFilter();
    }

    if (changeAlias) {
      this.SelectPoints();
    }

    this.SetAppComponentTitle();
  }

  FilterOnTag() {
    this.SetAppComponentTitle();
    this.SelectPoints();
  }

  FilterOnText() {
    // Whether we're now filtering on text or not, only reselect points if there is a filter
    if (this.pointTextFilter) {
      this.SelectPoints();
    }
  }

  // Check whether we're filtering on type
  FilterOnType() {
    if (this.showTypeFilter) {
      this.pointTypeIDFilter = this.previousPointTypeIDFilter;
    } else {
      this.pointTypeIDFilter = PointTypesEnum.NotSelected;
    }
    this.SelectPoints();
  }

  // Filter by Type from Tags-Points (Select Questions)
  public FilterQuestions(filterQuestions: boolean) {

    this.filterQuestions = filterQuestions;

    if (filterQuestions) {
      this.qa = 'question';
      this.points = [];
    } else {
      this.qa = 'point';
      this.SelectPoints();
    }

  }

  PointTypeFilterChange() {
    this.previousPointTypeIDFilter = this.pointTypeIDFilter;
    this.SelectPoints();
  }

  FilterOnDates(event$) {

    if (event$.checked) {
      if (this.pointSortType !== PointSortTypes.DateCreated) {
        this.pointSortType = PointSortTypes.DateCreated;
        this.pointSortTypeChanged.next(this.pointSortType);
      }
    }
    this.SelectPoints(); // Always Descending initially
  }

  FilterOnFeedback() {
    if (this.showFeedbackFilter) {
      this.feedbackFilter = PointFeedbackFilter.No;
    } else {
      this.feedbackFilter = PointFeedbackFilter.Any;
    }
    this.SelectPoints();
  }

  // From Template
  FilterFavs($event) {
    this.FilterFavourites($event.checked);
  }

  // From ngOnInit Subscription
  FilterFavourites(filter: Boolean) {

    if (filter) {
      this.pointFlag = PointFlags.Favourite;
    } else {
      this.pointFlag = PointFlags.Any;
    }

    this.SelectPoints();
  }

  SetAppComponentTitle() {
    // Don't call from SelectPoints() (which may be called from a subscription triggered externally)
    let title = '';

    const slashTagSlash = this.anyTag ? '/' : this.slashTagFilter + '/';

    if (this.filteringMyPoints) {
      title = `${slashTagSlash}by/${this.localData.freeVoteProfile.alias}`;
    } else if (this.showVoterFilter && !!this.byAliasFilter) {
      title = `${slashTagSlash}by/${this.byAliasFilter}`;
    } else {
      title = `${this.slashTagFilter}`;
    }
    this.appData.RouteParamChange$.next(title);
  }


  OnTopicSearch(): string {
    let onTopic = '';
    if (!this.anyTag) {
      if (!!this.slashTagFilter) { this.slashTagFilter = this.localData.PreviousSlashTagSelected; }
      onTopic = this.localData.SlashTagToTopic(this.slashTagFilter);
    }
    return onTopic;
  }

  SelectPointsByVoter() {

    this.localData.ActiveAliasForFilter = this.byAliasFilter;

    if (!!this.slashTagFilter) { this.localData.PreviousSlashTagSelected = this.slashTagFilter; }

    // Communicate Change to App Component

    this.SelectPoints();
  }

  SelectPoints() {

    if (!this.alreadyFetchingPointsFromDB) {

      this.alreadyFetchingPointsFromDB = true;
      this.pointCount = 0;
      this.points = [];
      this.error = '';

      switch (this.pointSelectionType) {
        case PointSelectionTypes.Filtered:

          let aliasFilter = '';
          if (this.showVoterFilter) {
            aliasFilter = this.byAliasFilter;
          }

          let textFilter = '';
          if (this.showTextFilter) { textFilter = this.pointTextFilter; }

          let pointTypeID = PointTypesEnum.NotSelected;
          if (this.showTypeFilter) { pointTypeID = this.pointTypeIDFilter; }

          let dateFrom: Date;
          let dateTo: Date;

          // Switch dates if dateFrom > dateTo
          if (this.showDateFilter) {
            dateFrom = this.dateFrom;
            dateTo = this.dateTo;
            if (this.appData.Date1IsLessThanDate2(dateTo, dateFrom)) {
              const dateSwitch = dateFrom;
              dateFrom = dateTo;
              dateTo = dateSwitch;
              this.dateFrom = dateFrom;
              this.dateTo = dateTo;
            }
          }

          this.pointsService.GetFirstBatchFiltered(
            this.filteringMyPoints, aliasFilter, this.OnTopicSearch(),
            this.draftStatusFilter, this.feedbackFilter, this.pointFlag, textFilter,
            pointTypeID, dateFrom, dateTo,
            this.pointSortType, this.pointSortAscending)
            .subscribe(
              {
                next: psr => this.DisplayPoints(psr),
                error: err => {
                  this.error = err.error.detail;
                  this.alreadyFetchingPointsFromDB = false;
                }
              });
          break;
        default:
          // Infinite Scroll: Get points in batches
          this.slashTagFilter = this.localData.PreviousSlashTagSelected; // how does this relate to getting from route param?
          if (this.slashTagFilter) {
            this.pointsService.GetFirstBatchForTag(this.slashTagFilter, this.pointSortType, this.pointSortAscending)
              .subscribe(
                {
                  next: psr => this.DisplayPoints(psr),
                  error: err => {
                    this.error = err.error.detail;
                    this.alreadyFetchingPointsFromDB = false;
                  }
                });
          }
          break;
      }

    }
  }

  public SelectSpecificPoint(slashTag: string, pointTitle: string) {

    this.alreadyFetchingPointsFromDB = true;

    this.pointsService.GetSpecificPoint(slashTag, pointTitle)
      .subscribe(
        {
          next: psr => this.DisplayPoints(psr),
          error: err => {
            this.error = err.error.detail;
            this.alreadyFetchingPointsFromDB = false;
          }
        }
      );
  }

  DisplayPoints(psr: PointSelectionResult) {

    this.alreadyFetchingPointsFromDB = false;


    if (psr.pointCount > 0) {
      // If we don't have dateFrom and fromDate is returned, OR
      // returned date is LESS than original, use returned date
      if (!this.dateFrom && psr.fromDate || this.appData.Date1IsLessThanDate2(psr.fromDate, this.dateFrom)) {
        this.dateFrom = new Date(psr.fromDate);
      }

      // If we don't have dateTo and toDate is returned, OR
      // returned date is GREATER than original, use returned date
      if (!this.dateTo && psr.toDate || this.appData.Date1IsLessThanDate2(this.dateTo, psr.toDate)) {
        this.dateTo = new Date(psr.toDate);
      }
    }

    // Batch
    this.pointCount = psr.pointCount;
    this.pointIDs = psr.pointIDs;
    this.points = psr.points;

    this.NewPointsDisplayed();

  }

  // SelectedPoints() {

  //   this.pointsService.SelectedPoints(1) // No longer using page number
  //     // ToDo return myPoints in infinitescroll format
  //     .then(
  //       response => {
  //         // https://www.hostingadvice.com/how-to/javascript-add-to-array/#concat
  //         // The concat() method returns a new combined array comprised of
  //         // the array on which it is called,
  //         // joined with the array (or arrays) from its argument.
  //         this.points = this.points.concat(response.points);
  //       });
  // }


  newSortType(pointSortType: PointSortTypes) {

    // ReversalOnly means we can allow the database to update rownumbers on previously selected points
    const reversalOnly = this.pointSortType === pointSortType;
    this.pointSortType = pointSortType;
    this.alreadyFetchingPointsFromDB = true;

    this.pointsService.NewPointSelectionOrder(pointSortType, reversalOnly)
      .subscribe(
        response => {
          this.alreadyFetchingPointsFromDB = false;

          // pointCount is not updated for re-ordering
          this.pointIDs = response.pointIDs;
          this.points = response.points;
          this.NewPointsDisplayed();
        });
  }


  onPointDeleted(id: number) {
    // this.SelectPoints(); No need to reselect.
    // Already deleted from server, now remove from the array
    // https://love2dev.com/blog/javascript-remove-from-array/
    this.points = this.points.filter(value => {
      return value.pointID !== id;
    });
    this.pointCount--; // decrement before calling NewPointsDisplayed which updates allPointsDisplayed
    this.NewPointsDisplayed();
  }


  // https://stackblitz.com/edit/free-vote-infinite-scroll
  fetchMorePoints() {

    if (!this.alreadyFetchingPointsFromDB) {

      // ToDo infinite scroll for MyPoints this.SelectedPoints();

      // https://stackoverflow.com/questions/38824349/how-to-convert-an-object-to-an-array-of-key-value-pairs-in-javascript
      // Construct array of next 10 points ids to be selected
      const pids: ID[] = this.pointIDs
        .filter(val => val.rowNumber > this.lastPageRow)
        .slice(0, 10); // excludes end index;

      // Pass back next 10 PointIDs to be fetched for display
      // already filtered above - this is what we need to fetch now
      if (pids && pids.length > 0) {

        // Get new PAGE of points
        this.alreadyFetchingPointsFromDB = true;
        this.allPointsDisplayed = false;

        this.pointsService.GetPage(pids).subscribe(response => {
          this.points = this.points.concat(response.points);
          this.NewPointsDisplayed();
        });

      } else if (this.lastBatchRow < this.pointCount && this.lastPageRow < this.pointCount) {
        // More defensive coding if DB givesd incorrect page count

        // Get another BATCH of points

        this.alreadyFetchingPointsFromDB = true;
        this.allPointsDisplayed = false;

        this.pointsService.GetNextBatch(this.pointSortType, this.lastBatchRow + 1)
          .subscribe(
            response => {

              // New Batch
              this.pointIDs = response.pointIDs;
              this.points = this.points.concat(response.points);
              this.NewPointsDisplayed();
            }
          );
        // }

      }
    }
  }

  NewPointsDisplayed() {
    this.alreadyFetchingPointsFromDB = false;
    this.allPointsDisplayed = (this.points.length >= this.pointCount);
    this.appData.PointsSelected$.next();
  }

  ngOnDestroy() {
    this.pointSelection$.unsubscribe();
    this.pointSortType$.unsubscribe();
    this.pointSortAscending$.unsubscribe();
    this.pointFilter$.unsubscribe();
    this.widthSubject$.unsubscribe();
  }

}
