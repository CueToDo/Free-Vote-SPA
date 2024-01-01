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
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.css']
})
export class SortMenuComponent implements OnInit {
  // 1. Sort Type
  @Input() pointSortType!: PointSortTypes;
  @Output() pointSortTypeChange = new EventEmitter<PointSortTypes>();

  public PointSortTypes = PointSortTypes; // enum - template

  // 2. Sort Order
  @Input() sortDescending!: boolean;
  @Output() sortDescendingChange = new EventEmitter<boolean>();

  public Tabs = Tabs;

  isMobile = false;

  public get sortToolTip(): string {
    let tooltip = `showing points for\n"${this.localData.TopicSelected}"\n`;
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

  // 1. Sort Type
  setSortType(pointSortType: PointSortTypes) {
    // Default to descending if order was random
    if (this.pointSortType === PointSortTypes.Random)
      this.sortDescending = true;
    this.pointSortType = pointSortType;
    this.pointSortTypeChange.emit(pointSortType);
  }

  // 2. Sort Order
  setSortDescending(descending: boolean) {
    this.sortDescending = descending;

    // ascending/descending not applicable to random
    if (this.pointSortType === PointSortTypes.Random) {
      this.pointSortType = PointSortTypes.TrendingActivity;
    }
    this.sortDescendingChange.emit(descending);
  }
}
