// Angular
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Model/Enums
import { PointSortTypes, Tabs } from 'src/app/models/enums';

@Component({
  selector: 'app-search-and-sort',
  templateUrl: './search-and-sort.component.html',
  styleUrls: ['./search-and-sort.component.css']
})
export class SearchAndSortComponent {
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

  // 4. Feedback
  @Output() feedbackChange = new EventEmitter<boolean>();

  // 5. Refresh
  @Output() refresh = new EventEmitter();
  public Tabs = Tabs;

  // Button properties

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
    switch (this.pointSortType) {
      case PointSortTypes.TrendingActivity:
        return 'showing points trending now';
      case PointSortTypes.AllTimePopularity:
        return 'showing most popular first (all time)';
      case PointSortTypes.Random:
        return 'showing in random order';
      default:
        return 'showing most recent first';
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

  constructor() {}

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

  // 4. Feedback
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

  // 5. Refresh
  refreshSelection() {
    this.refresh.emit();
  }
}
