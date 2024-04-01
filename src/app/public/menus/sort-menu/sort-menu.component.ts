// Angular
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Model/Enums
import { PointSortTypes, Tabs } from 'src/app/models/enums';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-sort-menu',
    templateUrl: './sort-menu.component.html',
    styleUrls: ['./sort-menu.component.css'],
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, MatTooltipModule, MatIconModule]
})
export class SortMenuComponent implements OnInit {
  // 1. For points or questions
  @Input() qp = 'points';

  // 2. Sort Type
  @Input() pointSortType!: PointSortTypes;
  @Output() pointSortTypeChange = new EventEmitter<PointSortTypes>();

  public PointSortTypes = PointSortTypes; // enum - template

  // 3. Sort Order
  @Input() sortDescending!: boolean;
  @Output() sortDescendingChange = new EventEmitter<boolean>();

  public Tabs = Tabs;

  isMobile = false;

  public get sortToolTip(): string {
    let tooltip = `showing ${this.qp} for\n"${this.localData.TopicSelected}"\n`;
    switch (this.pointSortType) {
      case PointSortTypes.TrendingActivity:
        tooltip += 'in trending order';
        if (this.sortDescending) tooltip += '\n(descending)';
        else tooltip += '\n(ascending)';
        break;
      case PointSortTypes.AllTimePopularity:
        tooltip += 'ordered by all time popularity';
        if (this.sortDescending) tooltip += '\n(most popular first)';
        else tooltip += '\n(least popular first)';
        break;
      case PointSortTypes.Random:
        tooltip += 'in random order';
        return tooltip;
      default: // Date
        tooltip += `ordered by date updated`;
        if (this.sortDescending) tooltip += '\n(most recent first)';
        else tooltip += '\n(oldest first)';
    }

    return tooltip;
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
