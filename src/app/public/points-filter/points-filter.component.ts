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
  MyPointFilter
} from 'src/app/models/enums';
import { Kvp } from 'src/app/models/kvp.model';

// FreeVote Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { LookupsService } from 'src/app/services/lookups.service';
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
  // Point selection filters
  @Input() showFilters = false;

  // 2-way bind filter criteria
  @Input() public filter = new FilterCriteria();
  @Output() public filterChange = new EventEmitter<FilterCriteria>();

  @Output() pointSortTypeChanged = new EventEmitter<PointSortTypes>();

  // Subscriptions
  private widthSubject$: Subscription | undefined;

  public favouritesText = 'favourites';

  pointTypes: Kvp[] = [];

  advanced = false;

  // enums in template
  public MyPointFilter = MyPointFilter;
  public PointFeedbackFilter = PointFeedbackFilter;

  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    public appData: AppDataService,
    private lookupsService: LookupsService
  ) {}

  ngOnInit(): void {
    this.filter.byAlias = this.localData.ActiveAliasForFilter;
    this.filter.pointSelectionType = PointSelectionTypes.Filtered;

    this.lookupsService
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

      if (tagParam) {
        this.filter.anyTag = false;
        this.filter.slashTag = tagParam;
        tag = true;
      } else {
        tagParam = '';
      }

      if (aliasParam) {
        this.filter.byAlias = aliasParam;
        if (!this.filter.slashTag) {
          this.filter.anyTag = true;
        }
        aliasParam = '';
        this.showFilters = true;
        alias = true;
      }

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
    this.showFilters = false;

    this.filter.myPointFilter = MyPointFilter.AllVoters;
    this.filter.pointTypeID = PointTypesEnum.NotSelected;

    this.filter.anyTag = false;
  }

  // MyFilter(): void {
  //   if (this.filter.myPoints) {
  //     this.showAliasFilter = false;
  //   }
  // }

  VoterFilter(): void {
    // ensure compare empty with empty not nulls
    if (!this.filter.byAlias) {
      this.filter.byAlias = '';
    }
    if (!this.localData.PreviousAliasSelected) {
      this.localData.PreviousAliasSelected = '';
    }

    if (true) {
      // RestoreAliasFilter
      this.filter.myPointFilter = MyPointFilter.AllVoters;
      this.localData.RestoreAliasFilter();
      this.filter.byAlias = this.localData.PreviousAliasSelected; // Will always have a value whereas Active may be empty
    } else {
      // ClearAliasFilter
      this.filter.byAlias = '';
      this.localData.ClearAliasFilter();
    }
  }

  SelectPoints(): void {
    // Nah
    this.localData.ActiveAliasForFilter = this.filter?.byAlias || '';

    // Same Topic - move elsewhere
    this.filter.updateTopicViewCount = false;

    this.filterChange.emit();
  }

  // Filter by Type from Tags-And-Points (Select Questions)
  // public FilterPointsOrQuestions(selectPQ: SelectPQ): void {
  //   this.filter.selectPQ = selectPQ;

  //   this.Select();
  // }

  // Allow mat-checkbox click event to read checked value
  // https://github.com/angular/components/issues/13156
  FilterOnDates(checkbox: MatCheckbox): void {
    if (checkbox.checked) {
      if (this.filter.sortType !== PointSortTypes.DateUpdated) {
        this.filter.sortType = PointSortTypes.DateUpdated;
        this.pointSortTypeChanged.emit(this.filter.sortType);
      }
    }
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
  }

  ngOnDestroy(): void {
    this.widthSubject$?.unsubscribe();
  }
}
