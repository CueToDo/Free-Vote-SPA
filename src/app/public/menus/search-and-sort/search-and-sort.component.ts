// Angular
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Model/Enums
import { PointSortTypes, Tabs } from 'src/app/models/enums';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-search-and-sort',
  templateUrl: './search-and-sort.component.html',
  styleUrls: ['./search-and-sort.component.css']
})
export class SearchAndSortComponent implements OnInit {
  // 2 way bindings with parent

  // 1. Point search/filter criteria
  @Input() showFilters!: boolean;
  @Output() showFiltersChange = new EventEmitter<boolean>();

  // 2. Sort Type
  @Input() pointSortType!: PointSortTypes;
  @Output() pointSortTypeChange = new EventEmitter<PointSortTypes>();

  // 3. Sort Order
  @Input() sortDescending!: boolean;
  @Output() sortDescendingChange = new EventEmitter<boolean>();

  // 4. Local
  @Output() changeLocalSelection = new EventEmitter();

  // 5. Feedback
  @Output() feedbackChange = new EventEmitter<boolean>();

  // 6. Refresh
  @Output() refresh = new EventEmitter();
  public Tabs = Tabs;

  isMobile = false;
  get searchAndSortText(): string {
    if (this.isMobile) return 'search';
    return 'search & sort';
  }

  // 1. Point Search (Filter) button
  public get filterText() {
    if (this.showFilters) return 'searching';
    return 'search';
  }

  public get filterToolTip() {
    if (this.showFilters) return 'hide search criteria';
    return 'show point search criteria';
  }

  public get filterIcon() {
    if (this.showFilters) return 'manage_search';
    return 'search';
  }

  // 2. Point Sort
  public PointSortTypes = PointSortTypes; // enum - template

  public get sortToolTip(): string {
    let tooltip = `showing points for\n"${this.localData.PreviousTopicSelected}"\n`;
    switch (this.pointSortType) {
      case PointSortTypes.TrendingActivity:
        return tooltip + `in trending order`;
      case PointSortTypes.AllTimePopularity:
        return tooltip + `ordered by all time popularity`;
      case PointSortTypes.Random:
        return tooltip + `in random order`;
      default: // Date
        return tooltip + `ordered by date updated`;
    }
  }

  public get sortTypeIcon(): string {
    switch (this.pointSortType) {
      case PointSortTypes.TrendingActivity:
        return 'trending_up';
      case PointSortTypes.AllTimePopularity:
        return 'favorite_border';
      case PointSortTypes.Random:
        return 'gesture';
      default:
        return 'calendar_today';
    }
  }

  constructor(
    public localData: LocalDataService,
    public auth0Service: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    // https://alligator.io/angular/breakpoints-angular-cdk/
    this.breakpointObserver
      .observe(['(max-width: 425px)'])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }

  // 1. Filters
  toggleShowPointFilterCriteria(): void {
    this.showFilters = !this.showFilters;
    this.showFiltersChange.emit(this.showFilters);
  }

  // 2. Sort Type
  setSortType(pointSortType: PointSortTypes) {
    // Default to descending if order was random
    if (this.pointSortType === PointSortTypes.Random)
      this.sortDescending = true;
    this.pointSortType = pointSortType;
    this.pointSortTypeChange.emit(pointSortType);
  }

  // 3. Sort Order
  setSortDescending(descending: boolean) {
    this.sortDescending = descending;
    this.pointSortType = PointSortTypes.TrendingActivity;
    this.sortDescendingChange.emit(descending);
  }

  // 4. Local
  ChangeLocalSelection() {
    this.changeLocalSelection.emit();
  }

  // 5. Feedback
  feedbackOn = true;
  get feedbackIcon(): string {
    if (this.feedbackOn) return 'speaker_notes_off';
    return 'view_list';
  }
  get feedbackText(): string {
    if (this.feedbackOn) return 'turn feedback OFF';
    return 'turn feedback ON';
  }

  toggleFeedback() {
    this.feedbackOn = !this.feedbackOn;
    this.feedbackChange.emit(this.feedbackOn);
  }

  // 6. Refresh
  refreshSelection() {
    this.refresh.emit();
  }
}
