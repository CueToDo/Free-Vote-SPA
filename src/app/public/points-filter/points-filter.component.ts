// Angular
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Material
import { MatCheckbox } from '@angular/material/checkbox';

// rxjs
import { Subscription } from 'rxjs';

// Models, enums
import {
  PointTypesEnum,
  PointFlags,
  PointSortTypes,
  PointFeedbackFilter,
  MyPointFilter
} from 'src/app/models/enums';
import { Kvp } from 'src/app/models/kvp.model';

// FreeVote Services
import { AppService } from 'src/app/services/app.service';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';
import { LocalDataService } from 'src/app/services/local-data.service';
import { LookupsService } from 'src/app/services/lookups.service';

@Component({
  selector: 'app-points-filter', // is router-outlet
  templateUrl: './points-filter.component.html',
  styleUrls: ['./points-filter.component.css'],
  preserveWhitespaces: true // [DOESN'T WORK see component css - doesn't work in styles.css???]
  // for space between buttons - https://github.com/angular/material2/issues/11397
})
export class PointsFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pointTextFilter', { static: true }) pointTextFilter:
    | ElementRef
    | undefined;

  // 2-way bind filter criteria
  @Input() public filter = new FilterCriteria();
  @Output() public filterChange = new EventEmitter<FilterCriteria>();

  @Output() pointSortTypeChanged = new EventEmitter<PointSortTypes>();
  @Output() cancelSearch = new EventEmitter();

  // Subscriptions
  private widthSubject$: Subscription | undefined;

  public favouritesText = 'favourites';

  pointTypes: Kvp[] = [];

  advanced = false;

  // enums in template
  public MyPointFilter = MyPointFilter;
  public PointFeedbackFilter = PointFeedbackFilter;

  constructor(
    public appService: AppService,
    public localData: LocalDataService,
    private lookupsService: LookupsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.filter.byAlias = this.localData.ActiveAliasForFilter;

    this.lookupsService
      .PointTypes()
      .subscribe(pointTypes => (this.pointTypes = pointTypes));

    this.widthSubject$ = this.appService.DisplayWidth$.subscribe(width => {
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
      let tagParam = params.get('tag');
      let aliasParam = params.get('alias');

      if (tagParam) {
        this.filter.anyTag = false;
        this.localData.SlashTagSelected = tagParam;
      }

      if (aliasParam) {
        this.filter.byAlias = aliasParam;
        if (!this.localData.SlashTagSelected) {
          this.filter.anyTag = true; // ToDo needs work
        }
      }
    });
  }

  // Communicated from TagsPoints - filter criteria
  // Communicated from Tags Component - hide filters
  ClearPointFilters() {
    this.filter.myPointFilter = MyPointFilter.AllVoters;
    this.filter.pointTypeID = PointTypesEnum.NotSelected;
    this.filter.anyTag = false;
    this.filter.text = '';
    this.filterChange.emit(this.filter);
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
    this.localData.ActiveAliasForFilter = this.filter?.byAlias || '';
    this.filterChange.emit();
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

  Cancel() {
    this.ClearPointFilters();
    this.cancelSearch.emit();
  }

  ngOnDestroy(): void {
    this.widthSubject$?.unsubscribe();
  }
}
