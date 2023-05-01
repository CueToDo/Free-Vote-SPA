// Angular
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Model/Enums
import { Tabs } from 'src/app/models/enums';

@Component({
  selector: 'app-tag-search-menu',
  templateUrl: './tag-search-menu.component.html',
  styleUrls: ['./tag-search-menu.component.css']
})
export class TagSearchMenuComponent implements OnInit {
  @Input() TabIndex = Tabs.trendingTags;
  @Input() FilterForConstituency = false;

  @Output() changeLocal = new EventEmitter();
  @Output() tagSearch = new EventEmitter();

  // Public variables for use in template
  public Tabs = Tabs;

  isMobile = false;

  get menuTriggerText(): string {
    if (this.FilterForConstituency) return 'local';
    if (this.isMobile) return 'search';
    return 'search tags';
  }

  get menuTriggerIcon(): string {
    if (this.FilterForConstituency) return 'mp';
    return 'search';
  }

  constructor(
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
  search(): void {
    this.tagSearch.emit();
  }

  local(): void {
    this.changeLocal.emit();
  }
}
