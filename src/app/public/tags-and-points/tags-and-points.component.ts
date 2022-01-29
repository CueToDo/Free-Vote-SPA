// Angular
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Material
// import { MatSlideToggle } from '@angular/material/slide-toggle';

// rxjs
import { Subscription } from 'rxjs';

// Model/Enums
import { SelectPQ } from 'src/app/models/enums';
import { TagCloudTypes, PointSortTypes } from 'src/app/models/enums';
import { BreakoutGroup } from 'src/app/models/break-out-group.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';

// Components
import { PointsComponent } from 'src/app/public/points/points.component';
import { TagsComponent } from 'src/app/public/tags/tags.component';
import { PointEditComponent } from 'src/app/public//point-edit/point-edit.component';
import { QuestionEditComponent } from 'src/app/public/question-edit/question-edit.component';
import { GroupSelectionComponent } from 'src/app/breakoutgroups/group-selection/group-selection.component';
import { GroupDiscussionComponent } from 'src/app/breakoutgroups/group-discussion/group-discussion.component';

enum tabs {
  trendingTags = 0,
  recentTags = 1,
  tagSearch = 2,
  groups = 3,
  groupDiscussion = 4,
  pointsAndQuestions = 5,
  newPoint = 6
}

@Component({
  templateUrl: './tags-and-points.component.html',
  styleUrls: ['./tags-and-points.component.css']
})
export class TagsAndPointsComponent implements OnInit, OnDestroy {
  // Subscriptions
  showPointsTab$: Subscription | undefined;
  reSelectPoints$: Subscription | undefined;
  pointsFilterRemove$: Subscription | undefined;
  width$: Subscription | undefined; // Viewport width monitoring
  widthBand = 4;

  externalTrigger = false; // Set on subscriptions
  applyingFilter = false; // prevent cascading trigger

  // Public variables for use in template
  public tabIndex = tabs.recentTags;
  public previousTabIndex = tabs.recentTags;

  public topicSelected = '';
  public get slashTagSelected(): string {
    return this.localData.TopicToSlashTag(this.topicSelected);
  }

  public TagCloudTypes = TagCloudTypes;
  public haveRecentSlashTags = false;
  refreshRecent = false;

  qp = 'question'; // bound to radio button value

  public get showQuestions(): boolean {
    return this.qp === 'question';
  }

  get selectPQ(): SelectPQ {
    if (this.showQuestions) return SelectPQ.Questions;
    return SelectPQ.Points;
  }

  showingFilter = false;
  public filterIcon = 'search';
  public filterText = 'search';
  public filterToolTip = 'not filtering point selection';

  public PointSortTypes = PointSortTypes; // enum - template
  pointSortType = PointSortTypes.TrendingActivity;
  sortAscending = false;
  sortDescending = true;
  savedSortDescending = true; // default
  public sortToolTip = '';
  public sortOrderIcon = '';

  bogSelected: BreakoutGroup = {
    tagDisplay: '',
    breakoutGroupID: 0,
    breakoutRoomID: 0,
    breakoutRoom: '',
    characterTheme: '',
    characters: 0,
    spacesAvailable: 0,
    member: false,
    characterName: ''
  };

  // use TRV in parent template https://stackblitz.com/edit/angular-vjbf4s?file=src%2Fapp%2Fcart-table-modal.component.ts
  // use child component type in parent component https://stackoverflow.com/questions/31013461/call-a-method-of-the-child-component
  @ViewChild(PointsComponent, { static: false }) appPoints!: PointsComponent;
  @ViewChild('tagsRecent') tagsRecent!: TagsComponent;
  @ViewChild('newPoint') newPointComponent!: PointEditComponent;
  @ViewChild('newQuestion') newQuestionComponent!: QuestionEditComponent;
  @ViewChild('bogSelection') bogSelection!: GroupSelectionComponent;
  @ViewChild('bogDiscussion') bogDiscussion!: GroupDiscussionComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appData: AppDataService,
    public localData: LocalDataService
  ) {}

  ngOnInit(): void {
    this.appData.TagsPointsActive$.next(true);

    this.SetSortTypeIcon(PointSortTypes.TrendingActivity);

    // EXTERNAL ROUTECHANGE (not tab change): Need to subscribe to route change to get route params
    // https://angular-2-training-book.rangle.io/handout/routing/routeparams.html

    const routeparts = this.appData.Route.split('/');

    if (routeparts) {
      if (routeparts.length === 2) {
        // {0}/trending - length = 2

        this.topicSelected = this.localData.PreviousTopicSelected;

        switch (routeparts[1]) {
          // may have separate tab for following
          case 'trending':
            this.tabIndex = tabs.trendingTags;
            this.previousTabIndex = tabs.trendingTags;
            this.appData.defaultSort = PointSortTypes.TrendingActivity;
            break;
          case 'recent':
            this.tabIndex = tabs.recentTags;
            this.previousTabIndex = tabs.recentTags;
            this.appData.defaultSort = PointSortTypes.DateUpdated;
            break;
          case 'search':
            this.tabIndex = tabs.tagSearch;
            this.previousTabIndex = tabs.tagSearch;
            this.appData.defaultSort = PointSortTypes.TrendingActivity;
            break;
          case 'groups':
            this.tabIndex = tabs.groups;
            this.previousTabIndex = tabs.groups;
            break;
          default:
            this.tabIndex = tabs.pointsAndQuestions;
          // Don't save previousTabIndex
        }
      } else if (routeparts.length === 3) {
        // {0}/{slashTag}/points
        this.tabIndex = tabs.pointsAndQuestions;
        this.qp = 'point';
        this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);
      } else if (routeparts.length === 4) {
        // Route is Topic By Alias
        // {0}/{slashTag}/by/{Alias}
        this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);
        this.tabIndex = tabs.pointsAndQuestions;
        this.displayFilter(true);
      }
    } else {
      // Default to trending - shouldn't be needed
      this.tabIndex = tabs.trendingTags;
      this.previousTabIndex = tabs.trendingTags;
      this.appData.defaultSort = PointSortTypes.TrendingActivity;
    }

    if (!this.topicSelected || this.topicSelected === 'null') {
      this.appData.TagLatestActivity().subscribe({
        next: slashTag => {
          this.localData.PreviousSlashTagSelected = slashTag;
          this.topicSelected = this.localData.PreviousTopicSelected;
        },
        error: error =>
          console.log('Server Error on getting last slash tag', error)
      });
    }

    // ==========   Subscriptions   ==========

    // Just switch to Points Tab if ByOn hasn't changed
    this.showPointsTab$ = this.appData.ShowPointsTab$.subscribe({
      next: () => {
        this.externalTrigger = true;
        this.ChangeTab(tabs.pointsAndQuestions);
        this.externalTrigger = false;
      }
    });

    this.reSelectPoints$ = this.appData.ReSelectPoints$.subscribe(
      (pointSortType: PointSortTypes) => {
        this.externalTrigger = true;

        this.topicSelected = this.localData.PreviousTopicSelected;

        if (pointSortType !== PointSortTypes.NoChange) {
          this.pointSortType = pointSortType;
        }

        this.SetSortTypeIcon(pointSortType);
        this.ChangeTab(tabs.pointsAndQuestions);

        this.externalTrigger = false;
      }
    );

    this.pointsFilterRemove$ = this.appData.PointsFilterRemove$.subscribe(
      () => {
        this.externalTrigger = true;
        this.displayFilter(false);
        this.externalTrigger = false;
      }
    );

    // appComponent monitors width and broadcasts via appDataService
    this.width$ = this.appData.DisplayWidth$.subscribe((widthBand: number) => {
      this.widthBand = widthBand;
    });

    // Route does not change if link clicked in tag cloud
    // So need to detect route parameter change
    // This can't be done in app component as this component is already handling the route
    // app component does not detect route parameter change

    // https://angular-2-training-book.rangle.io/handout/routing/routeparams.html
    // https://stackoverflow.com/questions/37144999/angular2-get-router-params-outside-of-router-outlet

    // Also, there’s no need to unsubscribe from the paramMap.
    // The ActivatedRoute dies with the routed component and so
    // the subscription dies with it.
    this.activatedRoute.paramMap.subscribe(params => {
      const titleParam = params.get('title');
      if (titleParam) {
        this.qp = 'point';
      }

      const tag = params.get('tag');
      if (tag) {
        this.localData.PreviousSlashTagSelected = tag;
        // Commnicate change to app component ???

        // if (!this.externalTrigger) {
        //   this.appDataService.RouteParamChange$.next(this.slashTagSelected); // Don't roll into the above
        // }
      }
    });
  }

  NewSlashTagSelected(slashTag: string): void {
    this.topicSelected = this.localData.SlashTagToTopic(slashTag);
    this.appPoints?.UpdateTopicViewCount();
  }

  haveRecentTags(haveTags: boolean): void {
    this.haveRecentSlashTags = haveTags;
  }

  /// Change Tab and notify app component in TabChangeComplete
  ChangeTab(tabIndex: tabs): void {
    // Actual tab change, or just title change (due to voter filters)
    const tabChanged = this.tabIndex !== tabIndex;

    this.tabIndex = tabIndex;

    switch (tabIndex) {
      case tabs.trendingTags:
        this.previousTabIndex = tabIndex;
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        this.TabChangeComplete(tabChanged, '/trending');
        break;

      case tabs.recentTags:
        this.previousTabIndex = tabIndex;
        // (always) update on switching to tagsRecent tab
        if (this.refreshRecent) {
          this.tagsRecent.fetchTags();
          this.refreshRecent = false;
        }
        this.appData.defaultSort = PointSortTypes.DateUpdated;
        this.TabChangeComplete(tabChanged, '/recent');
        break;

      case tabs.tagSearch:
        this.previousTabIndex = tabIndex;
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        this.TabChangeComplete(tabChanged, '/search');
        break;

      case tabs.groups:
        this.bogSelection.breakoutGroupsJoined(true);
        break;

      case tabs.pointsAndQuestions:
        // Don't save previous
        // ActiveAliasForFilter update by the "By" Component (sibling),
        // AND child Tags and Points Components
        const alias = this.localData.ActiveAliasForFilter;
        if (alias) {
          if (!this.externalTrigger) {
            // Communicate the change - it's just a tab change, not a previous alias or topic change
          }

          if (!this.applyingFilter) {
            this.displayFilter(true);
          }
          // Filter on Alias
          this.TabChangeComplete(
            tabChanged,
            `/${this.topicSelected}/by/${alias}`
          );
        } else if (!this.externalTrigger) {
          this.TabChangeComplete(tabChanged, this.slashTagSelected); // Tell the app component
        }

        this.appPoints.FilterPointsOrQuestions(this.selectPQ);

        break;
      case tabs.newPoint:
        if (this.qp === 'question') {
          this.newQuestionComponent.NewQuestion(this.slashTagSelected);
        } else {
          this.newPointComponent.NewPoint(this.slashTagSelected);
        }
        break;
    }
  }

  // Tell the App Component that the route has changed
  TabChangeComplete(hasChanged: boolean, newRoute: string): void {
    if (hasChanged && !this.externalTrigger) {
      this.appData.RouteParamChange$.next(newRoute);
    }
  }

  // From the template filter button and directly from child Points Component
  applyFilter(filter: boolean): void {
    this.displayFilter(filter); /// may be recalled in ChangeTab

    this.applyingFilter = true;
    this.ChangeTab(tabs.pointsAndQuestions);
    this.applyingFilter = false;
  }

  switchToPoints(): void {
    this.qp = 'point';
  }

  // init, subscription, ChangeTab, applyFilter
  displayFilter(filter: boolean): void {
    this.showingFilter = filter;

    if (this.showingFilter) {
      this.filterIcon = 'manage_search';
      this.filterText = 'searching';
      this.filterToolTip = 'hide search criteria';
    } else {
      this.filterIcon = 'search';
      this.filterText = 'search';
      this.filterToolTip = 'show search criteria';
    }

    if (!this.externalTrigger) {
      // Only get Points component to reselect points if there is a change of filter criteria
      let filterChange = false;
      if (!this.appPoints) {
        filterChange = true;
      } else if (filter) {
        filterChange = this.appPoints.HasSavedFilter(); // Will a filter be applied?
      } else {
        filterChange = this.appPoints.HasFilter(); // Will a filter be removed?
      }

      // Get point component to show/hide filter criteria
      this.appData.PointsFiltered$.next(this.showingFilter);

      if (filterChange) {
        // #97 reselect points if filter changes
        this.appData.ReSelectPoints$.next(PointSortTypes.NoChange); // ToDo Communicate directly with child
      }
    }
    this.tabIndex = tabs.pointsAndQuestions;
  }

  // From child Points Component
  pointSortTypeChanged(pointSortType: PointSortTypes): void {
    this.externalTrigger = true;
    this.SetSortTypeIcon(pointSortType);
    this.externalTrigger = false;
  }

  SetSortTypeIcon(pointSortType: PointSortTypes): void {
    if (pointSortType !== PointSortTypes.NoChange) {
      if (pointSortType === PointSortTypes.DateDescend) {
        pointSortType = PointSortTypes.DateUpdated;
      }

      this.pointSortType = pointSortType;

      switch (pointSortType) {
        case PointSortTypes.TrendingActivity:
          this.sortOrderIcon = 'trending_up';
          this.sortToolTip = 'showing points trending now';
          break;
        case PointSortTypes.AllTimePopularity:
          this.sortOrderIcon = 'favorite_border';
          this.sortToolTip = 'showing most popular first (all time)';
          break;
        case PointSortTypes.Random:
          this.sortOrderIcon = 'gesture';
          this.sortToolTip = 'showing in random order';
          break;
        default:
          this.sortOrderIcon = 'calendar_today';
          this.sortToolTip = 'showing most recent first';
          break;
      }
    }
  }

  SetSortDescending(descending: boolean): void {
    this.sortDescending = descending;
    this.savedSortDescending = descending;
    this.sortAscending = !descending;

    // Can't reverse random, so default to TrendingActivity
    if (this.pointSortType === PointSortTypes.Random) {
      this.pointSortType = PointSortTypes.TrendingActivity;
    }

    if (!this.externalTrigger) {
      this.appData.PointSortAscending$.next(this.sortAscending);
    }

    this.SetSortTypeIcon(this.pointSortType);
  }

  sortBy(pointSortType: PointSortTypes): void {
    if (
      this.pointSortType !== pointSortType ||
      pointSortType === PointSortTypes.Random
    ) {
      // New sort order or user clicked random again

      // Communicate to PointsComponent - is a child could/should use Input?
      if (!this.externalTrigger) {
        this.appData.PointSortType$.next(pointSortType); // New random order or sort type
      }

      this.tabIndex = tabs.pointsAndQuestions;
      this.ChangeTab(this.tabIndex);

      if (pointSortType === PointSortTypes.Random) {
        // Save old values and set to false
        this.savedSortDescending = this.sortDescending;
        this.sortDescending = false;
        this.sortAscending = false;
      } else {
        // restore old values if switch to non-random sort
        this.sortDescending = this.savedSortDescending;
        this.sortAscending = !this.savedSortDescending;
      }

      this.SetSortTypeIcon(pointSortType);
    }
  }

  refresh(): void {
    this.externalTrigger = true; // prevent further communication to points component
    this.appData.PointSortAscending$.next(this.sortAscending); // This communicates to points component
    this.externalTrigger = false;
  }

  onCancelNew(): void {
    this.tabIndex = tabs.pointsAndQuestions;
  }

  onCompleteNew(): void {
    // Do nothing, this component also handles subscriptions
    // this.NewSlashTagSelected(this.appDataService.PreviousSlashTagSelected); // Set in PointEdit
    // this.tabIndex = tabs.points;
    // this.pointSortType = PointSortTypes.DateUpdated;
    // this.setSortIcon(this.pointSortType);

    this.externalTrigger = true;
    this.SetSortDescending(true);
    this.externalTrigger = false;
  }

  BogSelected(bog: BreakoutGroup): void {
    this.bogSelected = bog;
    this.ChangeTab(tabs.groupDiscussion);
  }

  SelectAnotherBoG(): void {
    this.bogSelection.viewMyGroups();
    this.ChangeTab(tabs.groups);
  }

  ngOnDestroy(): void {
    this.showPointsTab$?.unsubscribe();
    this.reSelectPoints$?.unsubscribe();
    this.pointsFilterRemove$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
