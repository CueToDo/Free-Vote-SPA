// Angular
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs';

// Models, enums
import {
  PointSelectionTypes,
  PointTypesEnum,
  PointFlags,
  PointSortTypes,
  PointFeedbackFilter,
  DraftStatusFilter
} from 'src/app/models/enums';

// FreeVote Services
import { LocalDataService } from '../../services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { Kvp } from 'src/app/models/kvp.model';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';

// Components
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-points-filter', // is router-outlet
  templateUrl: './points-filter.component.html',
  styleUrls: ['./points-filter.component.css'],
  preserveWhitespaces: true // [DOESN'T WORK see component css - doesn't work in styles.css???]
  // for space between buttons - https://github.com/angular/material2/issues/11397
})
export class PointsFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() applyFilter = new EventEmitter<FilterCriteria>();
  @Output() pointSortTypeChanged = new EventEmitter<PointSortTypes>();

  // Point selection filters
  @Input() showFilters = false;
  public filter = new FilterCriteria();

  // Subscriptions
  private widthSubject$: Subscription | undefined;

  public favouritesText = 'favourites';

  pointTypes: Kvp[] = [];

  // enums in template
  public DraftStatusFilter = DraftStatusFilter;
  public PointFeedbackFilter = PointFeedbackFilter;

  // https://stackoverflow.com/questions/34947154/angular-2-viewchild-annotation-returns-undefined
  // just use hidden insead of ngIf
  // @ViewChild('PointsList') pointsList!: PointsListComponent;
  // @ViewChild('QuestionsList') questionsList!: QuestionsListComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    public appData: AppDataService
  ) {}

  ngOnInit(): void {
    this.filter.byAlias = this.localData.ActiveAliasForFilter;

    this.appData
      .PointTypes()
      .subscribe(pointTypes => (this.pointTypes = pointTypes));

    this.widthSubject$ = this.appData.DisplayWidth$.subscribe(width => {
      if (width === 0) {
        this.favouritesText = 'favs';
      } else {
        this.favouritesText = 'favourites';
      }
    });
  }

  ngAfterViewInit(): void {
    /* Anything that references child components pointsList or questionsList
    (inc any calls to this.Select() which invokes SelectQuestions or SelectPoints on the child components)
    inc any subscription initialisations
    must be in AfterViewInit */

    // Also, there’s no need to unsubscribe from the paramMap.
    // The ActivatedRoute dies with the routed component and so
    // the subscription dies with it.
    this.activatedRoute.paramMap.subscribe(params => {
      let tag = false;
      let alias = false;

      let titleParam = params.get('title');
      let tagParam = params.get('tag');
      let aliasParam = params.get('alias');

      console.log('Tag', tagParam, 'Title', titleParam, 'Alias', aliasParam);

      if (!titleParam) {
        titleParam = '';
      }
      if (!tagParam) {
        tagParam = '';
      }
      if (!aliasParam) {
        aliasParam = '';
      }

      if (tagParam) {
        this.filter.anyTag = false;
        this.filter.pointSelectionType = PointSelectionTypes.TagPoints;
        this.filter.slashTag = tagParam;
        tag = true;
      }

      if (aliasParam) {
        this.filter.pointSelectionType = PointSelectionTypes.Filtered;
        this.filter.byAlias = aliasParam;
        if (!this.filter.slashTag) {
          this.filter.anyTag = true;
        }
        this.showFilters = true;
        this.filter.applyAliasFilter = true;
        alias = true;
      }

      if (tag && !alias) this.filter.applyFilter = false;

      if (tag || alias) {
        this.filter.single = false;
        this.filter.updateTopicViewCount = true; // We have a new tag
      }

      // Todo Really here?
      // this.SetAppComponentRoute();

      // Pass to parent tags-and-points component
      // tags-and-points component could also suscribe to paramMap,
      // but only need child or parent to do this, not both
    });
  }

  // Communicated from TagsPoints - filter criteria
  // Communicated from Tags Component - hide filters
  ClearPointFilters() {
    let showFilters = false;
    this.showFilters = showFilters;

    if (showFilters) {
      this.filter.pointSelectionType = PointSelectionTypes.Filtered;
      this.filter.pointTypeID = this.filter.previousPointTypeID;

      // Reapply previous filters
      this.filter.myPoints = this.filter.previouslyFilteringMyPoints;
      this.filter.applyDraftFilter = this.filter.previouslyFilteringDraft;
      this.filter.applyAliasFilter =
        this.filter.previouslyFilteringByAlias &&
        !this.filter.myPoints &&
        !!this.filter.byAlias;
      this.filter.applyFavouritesFilter =
        this.filter.previouslyFilteringFavourites;
      this.filter.anyTag = this.filter.previouslyFilteringAnyTag;
      this.filter.applyTextFilter = this.filter.previouslyFilteringByText;
      this.filter.applyTypeFilter = this.filter.previouslyFilteringByType;
      this.filter.applyDateFilter = this.filter.previouslyFilteringByDate;
      this.filter.applyFeedbackFilter =
        this.filter.previouslyFilteringByFeedback;

      // If there aren't any active filters, then Filtered Select is same as Tag Select
      // Only reselect points if we now have active filters
      if (this.filter.HasFilter()) {
        this.FilterUpdated();
      }
    } else {
      this.filter.pointSelectionType = PointSelectionTypes.TagPoints;
      this.filter.pointTypeID = PointTypesEnum.NotSelected;

      // Remove Filters if no longer showing
      this.filter.previouslyFilteringMyPoints = this.filter.myPoints;
      this.filter.previouslyFilteringDraft = this.filter.applyDraftFilter;
      this.filter.previouslyFilteringByAlias = this.filter.applyAliasFilter;
      this.filter.previouslyFilteringFavourites =
        this.filter.applyFavouritesFilter;
      this.filter.previouslyFilteringAnyTag = this.filter.anyTag;
      this.filter.previouslyFilteringByText = this.filter.applyTextFilter;
      this.filter.previouslyFilteringByType = this.filter.applyTypeFilter;
      this.filter.previouslyFilteringByDate = this.filter.applyDateFilter;
      this.filter.previouslyFilteringByFeedback =
        this.filter.applyFeedbackFilter;

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
        this.FilterUpdated();
      }
    }
  }

  FilterUpdated(): void {
    this.applyFilter.emit(this.filter);
  }

  MyFilter(): void {
    if (this.filter.myPoints) {
      this.filter.applyAliasFilter = false;
    }
    this.filter.applyDraftFilter = this.filter.myPoints;
    // this.SetAppComponentRoute();
    this.FilterUpdated();
  }

  VoterFilter(): void {
    let changeAlias = false;

    if (!this.filter.byAlias) {
      this.filter.byAlias = '';
    } // ensure compare empty with empty not nulls
    if (!this.localData.PreviousAliasSelected) {
      this.localData.PreviousAliasSelected = '';
    }

    if (this.filter.applyAliasFilter) {
      this.filter.myPoints = false;
      this.localData.RestoreAliasFilter();
      changeAlias =
        this.filter.byAlias !== this.localData.PreviousAliasSelected;
      this.filter.byAlias = this.localData.PreviousAliasSelected; // Will always have a value whereas Active may be empty
    } else {
      // Not filtering on Alias
      changeAlias = !!this.filter.byAlias; // we were filtering, now we're not
      this.filter.byAlias = '';
      this.localData.ClearAliasFilter();
    }

    if (changeAlias) {
      this.FilterUpdated();
    }

    // this.SetAppComponentRoute();
  }

  SelectPointsByVoter(): void {
    this.localData.ActiveAliasForFilter = this.filter?.byAlias || '';

    if (this.filter?.slashTag) {
      this.localData.PreviousSlashTagSelected = this.filter.slashTag;
    }

    // Communicate Change to App Component
    this.filter.updateTopicViewCount = false;
    this.FilterUpdated();
  }

  FilterOnTag(): void {
    this.FilterUpdated();
  }

  FilterOnText(): void {
    // Whether we're now filtering on text or not, only reselect points if there is a filter
    if (!!this.filter.text) {
      this.FilterUpdated();
    }
  }

  // Check whether we're filtering on type
  FilterOnType(): void {
    if (this.filter.applyTypeFilter) {
      this.filter.pointTypeID = this.filter.previousPointTypeID;
    } else {
      this.filter.pointTypeID = PointTypesEnum.NotSelected;
    }
    this.FilterUpdated();
  }

  // Filter by Type from Tags-And-Points (Select Questions)
  // public FilterPointsOrQuestions(selectPQ: SelectPQ): void {
  //   this.filter.selectPQ = selectPQ;

  //   this.Select();
  // }

  PointTypeFilterChange(): void {
    this.filter.previousPointTypeID = this.filter.pointTypeID;
    this.FilterUpdated();
  }

  // Allow mat-checkbox click event to read checked value
  // https://github.com/angular/components/issues/13156
  FilterOnDates(checkbox: MatCheckbox): void {
    if (checkbox.checked) {
      if (this.filter.sortType !== PointSortTypes.DateUpdated) {
        this.filter.sortType = PointSortTypes.DateUpdated;
        this.pointSortTypeChanged.next(this.filter.sortType);
      }
    }
    this.FilterUpdated(); // Always Descending initially
  }

  FilterOnFeedback(): void {
    if (this.filter.applyFeedbackFilter) {
      this.filter.feedbackFilter = PointFeedbackFilter.No;
    } else {
      this.filter.feedbackFilter = PointFeedbackFilter.Any;
    }
    this.FilterUpdated();
  }

  // From Template
  FilterFavs(checkbox: MatCheckbox): void {
    this.FilterFavourites(checkbox.checked);
  }

  // From ngOnInit Subscription
  FilterFavourites(filter: boolean): void {
    if (filter) {
      this.filter.pointFlag = PointFlags.Favourite;
    } else {
      this.filter.pointFlag = PointFlags.Any;
    }

    this.FilterUpdated();
  }

  public HasFilter(): boolean {
    return this.filter.HasFilter();
  }

  public HasSavedFilter(): boolean {
    return this.filter.HasSavedFilter();
  }

  // SetAppComponentRoute(): void {
  //   // Don't call from SelectPoints() (which may be called from a subscription triggered externally)
  //   let route = '';

  //   const slashTagSlash = this.filter.anyTag ? '/' : this.filter.slashTag + '/';

  //   if (this.filter.myPoints) {
  //     route = `${slashTagSlash}by/${this.localData.freeVoteProfile.alias}`;
  //   } else if (this.filter.applyAliasFilter && !!this.filter.byAlias) {
  //     route = `${slashTagSlash}by/${this.filter.byAlias}`;
  //   } else {
  //     route = `${this.filter.slashTag}`;
  //     console.log('Filter SetAppComponentRoute<', route, '>');
  //   }
  //   console.log('Setting route in filter<', route, '>');
  //   this.appData.RouteParamChange$.next(route);
  // }

  ngOnDestroy(): void {
    this.widthSubject$?.unsubscribe();
  }
}
