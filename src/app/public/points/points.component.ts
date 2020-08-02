
// Angular
import { OnDestroy, EventEmitter, Output, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// auth0
import { LocalDataService } from '../../services/local-data.service';

// Models, enums
import {
  PointSelectionTypes, PointTypesEnum, PointFlags, PointSortTypes,
  PointFeedbackFilter, DraftStatusFilter
} from 'src/app/models/enums';

// FreeVote Services
import { AppDataService } from 'src/app/services/app-data.service';
import { Subscription } from 'rxjs';
import { Kvp } from 'src/app/models/kvp.model';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';

// Components
import { PointsListComponent } from '../points-list/points-list.component';
import { QuestionsListComponent } from './../questions-list/questions-list.component';

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

  // Point selection filters
  showFilters = false;

  public filter = new FilterCriteria();

  public favouritesText = 'favourites';

  pointTypes: Kvp[];

  // enums in template
  public DraftStatusFilter = DraftStatusFilter;
  public PointFeedbackFilter = PointFeedbackFilter;

  // https://stackoverflow.com/questions/34947154/angular-2-viewchild-annotation-returns-undefined
  // just use hidden insead of ngIf
  @ViewChild('PointsList') pointsList: PointsListComponent;
  @ViewChild('QuestionsList') questionsList: QuestionsListComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    public appData: AppDataService
  ) { }


  ngOnInit() {

    this.filter.byAlias = this.localData.ActiveAliasForFilter;

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
        this.filter.anyTag = false;
        this.filter.pointSelectionType = PointSelectionTypes.SlashTag;
        this.filter.slashTag = `/${tagParam}`;
        tag = true;
      }

      if (aliasParam) {
        this.filter.pointSelectionType = PointSelectionTypes.Filtered;
        this.filter.byAlias = aliasParam;
        if (!this.filter.slashTag) { this.filter.anyTag = true; }
        this.showFilters = true;
        this.filter.applyAliasFilter = true;
        alias = true;
      }


      if (titleParam) {
        this.filter.single = true;
        this.pointsList.SelectSpecificPoint(tagParam, titleParam);
      } else if (tag || alias) {
        this.filter.single = false;
        this.Select();
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
          this.filter.slashTag = this.localData.PreviousSlashTagSelected; // Set by the Point-Edit Component
          this.SetAppComponentTitle();
          if (pointSortType !== PointSortTypes.NoChange) {
            if (pointSortType === PointSortTypes.DateDescend) {
              this.filter.sortType = PointSortTypes.DateCreated;
              this.filter.sortAscending = false; // Ensure new point at top
            } else {
              this.filter.sortType = pointSortType;
            }
          }
          this.Select();
        }
      );

    this.pointSortType$ = this.appData.PointSortType$.subscribe(
      (pointSortType: PointSortTypes) => {
        if (this.filter.questions) {
          this.questionsList.newSortType(pointSortType);
        } else {
          this.pointsList.newSortType(pointSortType);
        }
      }
    );

    this.pointSortAscending$ = this.appData.PointSortAscending$.subscribe(
      (ascending: boolean) => {
        this.filter.sortAscending = ascending;
        this.Select();
      }
    );

    // Communicated from TagsPoints - filter criteria
    // Communicated from Tags Component - hide filters
    this.pointFilter$ = this.appData.PointsFiltered$.subscribe(
      (showFilters: boolean) => {

        this.showFilters = showFilters;

        if (showFilters) {
          this.filter.pointSelectionType = PointSelectionTypes.Filtered;
          this.filter.pointTypeID = this.filter.previousPointTypeID;

          // Reapply previous filters
          this.filter.myPoints = this.filter.previouslyFilteringMyPoints;
          this.filter.applyDraftFilter = this.filter.previouslyFilteringDraft;
          this.filter.applyAliasFilter = this.filter.previouslyFilteringByAlias
            && !this.filter.myPoints && !!this.filter.byAlias;
          this.filter.applyFavouritesFilter = this.filter.previouslyFilteringFavourites;
          this.filter.anyTag = this.filter.previouslyFilteringAnyTag;
          this.filter.applyTextFilter = this.filter.previouslyFilteringByText;
          this.filter.applyTypeFilter = this.filter.previouslyFilteringByType;
          this.filter.applyDateFilter = this.filter.previouslyFilteringByDate;
          this.filter.applyFeedbackFilter = this.filter.previouslyFilteringByFeedback;

          // If there aren't any active filters, then Filtered Select is same as Tag Select
          // Only reselect points if we now have active filters
          if (this.filter.HasFilter()) {
            this.Select();
          }
        } else {

          this.filter.pointSelectionType = PointSelectionTypes.SlashTag;
          this.filter.pointTypeID = PointTypesEnum.NotSelected;

          // Remove Filters if no longer showing
          this.filter.previouslyFilteringMyPoints = this.filter.myPoints;
          this.filter.previouslyFilteringDraft = this.filter.applyDraftFilter;
          this.filter.previouslyFilteringByAlias = this.filter.applyAliasFilter;
          this.filter.previouslyFilteringFavourites = this.filter.applyFavouritesFilter;
          this.filter.previouslyFilteringAnyTag = this.filter.anyTag;
          this.filter.previouslyFilteringByText = this.filter.applyTextFilter;
          this.filter.previouslyFilteringByType = this.filter.applyTypeFilter;
          this.filter.previouslyFilteringByDate = this.filter.applyDateFilter;
          this.filter.previouslyFilteringByFeedback = this.filter.applyFeedbackFilter;

          this.filter.myPoints = false;
          this.filter.applyDraftFilter = false;
          this.filter.applyAliasFilter = false;
          this.filter.applyFavouritesFilter = false;
          this.filter.anyTag = false;
          this.filter.applyTextFilter = false;
          this.filter.applyTypeFilter = false;
          this.filter.applyDateFilter = false;
          this.filter.applyFeedbackFilter = false;

          // If weren't any active filters, then Tag Select is same as Filtered Select
          // Only reselect points if there were previous active filters
          if (this.filter.HasSavedFilter()) {
            this.Select();
          }
        }


        this.SetAppComponentTitle();
      }
    );


    this.widthSubject$ = this.appData.DisplayWidth$.subscribe(
      width => { if (width === 0) { this.favouritesText = 'favs'; } else { this.favouritesText = 'favourites'; } }
    );

  }

  MyFilter() {
    if (this.filter.myPoints) {
      this.filter.applyAliasFilter = false;
    }
    this.filter.applyDraftFilter = this.filter.myPoints;
    this.SetAppComponentTitle();
    this.Select();
  }

  VoterFilter() {
    let changeAlias = false;

    if (!this.filter.byAlias) { this.filter.byAlias = ''; } // ensure compare empty with empty not nulls
    if (!this.localData.PreviousAliasSelected) { this.localData.PreviousAliasSelected = ''; }

    if (this.filter.applyAliasFilter) {
      this.filter.myPoints = false;
      this.localData.RestoreAliasFilter();
      changeAlias = this.filter.byAlias !== this.localData.PreviousAliasSelected;
      this.filter.byAlias = this.localData.PreviousAliasSelected; // Will always have a value whereas Active may be empty
    } else {
      // Not filtering on Alias
      changeAlias = !!this.filter.byAlias; // we were filtering, now we're not
      this.filter.byAlias = '';
      this.localData.ClearAliasFilter();
    }

    if (changeAlias) {
      this.Select();
    }

    this.SetAppComponentTitle();
  }

  SelectPointsByVoter() {
    this.pointsList.SelectPointsByVoter();
  }

  FilterOnTag() {
    this.SetAppComponentTitle();
    this.Select();
  }

  FilterOnText() {
    // Whether we're now filtering on text or not, only reselect points if there is a filter
    if (!!this.filter.text) {
      this.Select();
    }
  }

  // Check whether we're filtering on type
  FilterOnType() {
    if (this.filter.applyTypeFilter) {
      this.filter.pointTypeID = this.filter.previousPointTypeID;
    } else {
      this.filter.pointTypeID = PointTypesEnum.NotSelected;
    }
    this.Select();
  }

  // Filter by Type from Tags-Points (Select Questions)
  public FilterQuestions(filterQuestions: boolean) {

    this.filter.questions = filterQuestions;

    this.Select();

  }

  PointTypeFilterChange() {
    this.filter.previousPointTypeID = this.filter.pointTypeID;
    this.Select();
  }

  FilterOnDates(event$) {

    if (event$.checked) {
      if (this.filter.sortType !== PointSortTypes.DateCreated) {
        this.filter.sortType = PointSortTypes.DateCreated;
        this.pointSortTypeChanged.next(this.filter.sortType);
      }
    }
    this.Select(); // Always Descending initially
  }

  FilterOnFeedback() {
    if (this.filter.applyFeedbackFilter) {
      this.filter.feedbackFilter = PointFeedbackFilter.No;
    } else {
      this.filter.feedbackFilter = PointFeedbackFilter.Any;
    }
    this.Select();
  }

  // From Template
  FilterFavs($event) {
    this.FilterFavourites($event.checked);
  }

  // From ngOnInit Subscription
  FilterFavourites(filter: Boolean) {

    if (filter) {
      this.filter.pointFlag = PointFlags.Favourite;
    } else {
      this.filter.pointFlag = PointFlags.Any;
    }

    this.Select();
  }

  public HasFilter(): boolean {
    return this.filter.HasFilter();
  }

  public HasSavedFilter(): boolean {
    return this.filter.HasSavedFilter();
  }

  SetAppComponentTitle() {
    // Don't call from SelectPoints() (which may be called from a subscription triggered externally)
    let title = '';

    const slashTagSlash = this.filter.anyTag ? '/' : this.filter.slashTag + '/';

    if (this.filter.myPoints) {
      title = `${slashTagSlash}by/${this.localData.freeVoteProfile.alias}`;
    } else if (this.filter.applyAliasFilter && !!this.filter.byAlias) {
      title = `${slashTagSlash}by/${this.filter.byAlias}`;
    } else {
      title = `${this.filter.slashTag}`;
    }
    this.appData.RouteParamChange$.next(title);
  }

  Select() {
    if (this.filter.questions) {
      this.questionsList.SelectQuestions();
    } else {
      this.pointsList.SelectPoints();
    }
  }

  SelectSpecific() {

  }

  ngOnDestroy() {
    this.pointSelection$.unsubscribe();
    this.pointSortType$.unsubscribe();
    this.pointSortAscending$.unsubscribe();
    this.pointFilter$.unsubscribe();
    this.widthSubject$.unsubscribe();
  }

}
