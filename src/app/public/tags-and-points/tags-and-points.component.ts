import { Point } from 'src/app/models/point.model';
// Angular
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Material
// import { MatSlideToggle } from '@angular/material/slide-toggle';

// rxjs
import { Subscription } from 'rxjs';

// Model/Enums
import {
  TagCloudTypes,
  PointSortTypes,
  PointSelectionTypes
} from 'src/app/models/enums';
import { BreakoutGroup } from 'src/app/models/break-out-group.model';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';

// Components
import { PointsFilterComponent } from 'src/app/public/points-filter/points-filter.component';
import { TagsComponent } from 'src/app/public/tags/tags.component';
import { TagSearchComponent } from './../tag-search/tag-search.component';
import { QuestionsListComponent } from 'src/app/public/questions-list/questions-list.component';
import { QuestionAnswersComponent } from './../question-answers/question-answers.component';
import { GroupSelectionComponent } from 'src/app/breakoutgroups/group-selection/group-selection.component';
import { GroupDiscussionComponent } from 'src/app/breakoutgroups/group-discussion/group-discussion.component';
import { PointsListComponent } from 'src/app/public/points-list/points-list.component';
import { PointEditComponent } from 'src/app/public//point-edit/point-edit.component';
import { QuestionEditComponent } from 'src/app/public/question-edit/question-edit.component';

enum tabs {
  // Tags
  trendingTags = 0,
  recentTags = 1,
  tagSearch = 2,

  // Questions, Answers
  questions = 3,
  questionAnswers = 4,

  // Groups, Discussions
  groups = 5,
  groupDiscussion = 6,

  // Points
  tagPoints = 7,
  newPoint = 8
}

@Component({
  templateUrl: './tags-and-points.component.html',
  styleUrls: ['./tags-and-points.component.css']
})
export class TagsAndPointsComponent implements OnInit, OnDestroy {
  // Subscriptions
  tagLatestActivity$: Subscription | undefined;
  pointsFilterRemove$: Subscription | undefined;
  width$: Subscription | undefined; // Viewport width monitoring
  widthBand = 4;

  // Public variables for use in template
  public tabIndex = tabs.recentTags;
  public previousTabIndex = tabs.recentTags;

  // Topic - Tag Cloud
  public TagCloudTypes = TagCloudTypes;
  public haveRecentSlashTags = false;

  public topicSelected = '';
  public get slashTagSelected(): string {
    return this.localData.TopicToSlashTag(this.topicSelected);
  }

  // Question Answers or Tag Points
  qp = 'question'; // bound to radio button value

  public get showQuestions(): boolean {
    return this.qp === 'question';
  }

  allowSwitchToPoints = true; // Allowed after tag selection - not allowed if user clicks "questions"

  // Filter
  filter = new FilterCriteria();
  showFilters = false;
  applyingFilter = false; // prevent cascading burgerMenuTrigger

  // Filter button
  public filterIcon = 'search';
  public filterText = 'search';
  public filterToolTip = 'not filtering point selection';

  // Questions Select
  questionCount = 0;
  questionsSelected = false;

  // Point Select
  externalTrigger = false; // Set on subscriptions
  refreshRecent = false;
  newPointRefresh = false;
  pointsSelected = false;

  // Point Sort
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

  @ViewChild('pointsFilter') pointsFilterComponent!: PointsFilterComponent;

  // Tags (0-1-2)
  @ViewChild('tagsRecent') tagsRecentComponent!: TagsComponent;
  @ViewChild('tagSearch') tagSearchComponent!: TagSearchComponent;

  // BOG (5-6)
  @ViewChild('bogSelection') bogSelectionComponent!: GroupSelectionComponent;
  @ViewChild('bogDiscussion') bogDiscussionComponent!: GroupDiscussionComponent;

  //Points (3-4-7)
  @ViewChild('appQuestionsList')
  questionsListComponent!: QuestionsListComponent;
  @ViewChild('appQuestionAnswers')
  questionAnswersComponent!: QuestionAnswersComponent;
  @ViewChild('appPointsList') pointsListComponent!: PointsListComponent;

  // New answer or point (8)
  @ViewChild('newPoint') newPointComponent!: PointEditComponent;
  @ViewChild('newQuestion') newQuestionComponent!: QuestionEditComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appData: AppDataService,
    public localData: LocalDataService
  ) {}

  ngOnInit(): void {
    // Initialise only - subscriptions follow
    this.appData.TagsPointsActive$.next(true);

    this.SetSortTypeIcon(PointSortTypes.TrendingActivity);

    // EXTERNAL ROUTECHANGE (not tab change): Need to subscribe to route change to get route params
    // https://angular-2-training-book.rangle.io/handout/routing/routeparams.html

    const routeparts = this.appData.Route.split('/');

    // Process Initial Route
    if (routeparts) this.InitialRoute(routeparts);

    // No tag selected? Go to API to get latest
    if (!this.topicSelected || this.topicSelected === 'null') {
      this.tagLatestActivity$ = this.appData.TagLatestActivity().subscribe({
        next: slashTag => {
          this.localData.PreviousSlashTagSelected = slashTag;
          this.topicSelected = this.localData.PreviousTopicSelected;
        },
        error: error =>
          console.log('Server Error on getting last slash tag', error)
      });
    }

    // ==========   Subscriptions   ==========

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
      console.log('TAP route change', params);

      const tag = params.get('tag');
      const questionSlug = params.get('questionSlug');
      const titleParam = params.get('title');

      if (tag) this.localData.PreviousSlashTagSelected = tag;

      // QuestionAnswers
      if (questionSlug) this.ChangeTab(tabs.questionAnswers);

      // PointShare
      if (titleParam) this.qp = 'point';
    });
  }

  InitialRoute(routeparts: string[]): void {
    console.log('Initial Route');

    if (routeparts.length === 2) {
      // {0}/trending - length=2

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
        default:
          this.tabIndex = tabs.questions;
          this.qp = 'question';
          this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);
      }
    } else if (routeparts.length === 3) {
      // {0}/{slashTag}/points

      this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);

      switch (routeparts[2]) {
        case 'questions':
          this.tabIndex = tabs.questions;
          this.qp = 'question';
          break;
        case 'groups':
          this.tabIndex = tabs.groups;
          this.previousTabIndex = tabs.groups;
          break;
        case 'points':
          this.tabIndex = tabs.tagPoints;
          this.qp = 'point';
          break;
      }
    } else if (routeparts.length === 4) {
      // {0}/{slashTag}/by/{Alias}
      // {0}/{slashTag}/question/{question-slug}
      this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);

      switch (routeparts[2]) {
        case 'question':
          this.tabIndex = tabs.questionAnswers;
          break;
        case 'by':
          this.tabIndex = tabs.tagPoints;
          this.previousTabIndex = tabs.tagPoints;
          this.ShowFilterCriteria(true);
          break;
      }
    } else {
      // Default to trending - shouldn't be needed
      this.tabIndex = tabs.trendingTags;
      this.previousTabIndex = tabs.trendingTags;
      this.appData.defaultSort = PointSortTypes.TrendingActivity;
    }
  }

  NewSlashTagSelected(slashTag: string): void {
    // Direct communication from tags component

    this.topicSelected = this.localData.SlashTagToTopic(slashTag);
    this.filter.updateTopicViewCount = true;
    this.pointsFilterComponent.ClearPointFilters();
    this.haveRecentSlashTags = true;

    this.ReselectQuestions();
  }

  ShowQuestions(): void {
    console.log('Manual stop auto switch');
    this.allowSwitchToPoints = false;
    this.ChangeTab(tabs.questions);
  }

  ReselectQuestions() {
    this.questionsSelected = false;
    this.pointsSelected = false;
    this.allowSwitchToPoints = true;

    this.ChangeTab(tabs.questions);
  }

  ReselectForNewPoint() {
    this.ReselectPoints(PointSortTypes.DateDescend);
  }

  // Reselect Points on new tag selected
  ReselectPoints(pointSortType: PointSortTypes) {
    this.externalTrigger = true;

    this.topicSelected = this.localData.PreviousTopicSelected;

    if (pointSortType !== PointSortTypes.NoChange) {
      this.pointSortType = pointSortType;
    }

    this.SetSortTypeIcon(pointSortType);

    this.allowSwitchToPoints = true;
    this.ChangeTab(tabs.questions);

    this.externalTrigger = false;
  }

  /// Change Tab and notify app component in TabChangeComplete
  ChangeTab(tabIndex: tabs): void {
    // Actual tab change, or just title change (due to voter filters)
    const tabChanged = this.tabIndex !== tabIndex;

    this.tabIndex = tabIndex;
    var newRoute = '';

    switch (tabIndex) {
      case tabs.trendingTags: // 0
        this.previousTabIndex = tabIndex;
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        newRoute = '/trending';
        break;

      case tabs.recentTags: // 1
        this.previousTabIndex = tabIndex;
        // (always) update on switching to tagsRecent tab
        if (this.refreshRecent) {
          this.tagsRecentComponent.fetchTags();
          this.refreshRecent = false;
        }
        this.appData.defaultSort = PointSortTypes.DateUpdated;
        newRoute = '/recent';
        break;

      case tabs.tagSearch: // 2
        this.previousTabIndex = tabIndex;
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        newRoute = '/search';
        this.tagSearchComponent?.restartSearch();
        break;

      case tabs.questions: // 3
        this.qp = 'question';
        this.filter.pointSelectionType = PointSelectionTypes.QuestionPoints;

        // Select questions for tag?
        if (!this.questionsSelected) {
          this.refreshRecent = true; // Refresh Recent Tags when switch back from Point Selection
          this.questionsListComponent.SelectQuestions(true);
        }

        this.questionsSelected = true;

        newRoute = this.slashTagSelected;

        break;

      case tabs.questionAnswers:
        newRoute = this.slashTagSelected;
        break;

      case tabs.groups: // 5
        this.bogSelectionComponent.breakoutGroupsJoined(true);
        newRoute = this.slashTagSelected + '/break-out-groups';
        break;

      case tabs.groupDiscussion:
        newRoute =
          this.slashTagSelected +
          '/break-out-groups/' +
          this.appData.kebabUri(this.bogSelected.breakoutRoom);
        break;

      case tabs.tagPoints: // 7
        this.qp = 'point';
        this.filter.pointSelectionType = PointSelectionTypes.TagPoints;
        // Don't save previous
        // ActiveAliasForFilter update by the "By" Component (sibling),
        // AND child Tags and Points Components
        const alias = this.localData.ActiveAliasForFilter;
        if (!alias) {
          // Unfiltered TagPoints
          newRoute = this.slashTagSelected; // Tell the app component
        } else {
          newRoute = `${this.slashTagSelected}/by/${alias}`;

          // ShowFilter for alias
          if (!this.applyingFilter) this.ShowFilterCriteria(true);
        }

        this.newPointRefresh = false;
        this.refreshRecent = true; // Refresh Recent Tags when switch back from Point Selection

        if (!this.pointsSelected) this.pointsListComponent.SelectPoints();
        this.pointsSelected = true;

        break;

      case tabs.newPoint: // 8
        if (this.qp === 'question') {
          this.newQuestionComponent.NewQuestion(this.slashTagSelected);
        } else {
          this.newPointComponent.NewPoint(this.slashTagSelected);
        }
        newRoute = `${this.slashTagSelected}/new-${this.qp}`;
        break;
    }

    this.RouteParameterChanged(tabChanged, newRoute);
  }

  // Tell the App Component that the route has changed
  RouteParameterChanged(hasChanged: boolean, newRoute: string): void {
    if (hasChanged) this.appData.RouteParamChange$.next(newRoute);
  }

  // From child PointsFilter Component
  applyFilter(filter: FilterCriteria): void {
    this.ShowFilterCriteria(filter.applyFilter); /// may be recalled in ChangeTab

    this.applyingFilter = true;
    this.ChangeTab(tabs.tagPoints);
    this.applyingFilter = false;
  }

  QuestionCount(count: number): void {
    this.questionCount = count;
    if (count == 0 && this.allowSwitchToPoints) {
      this.ChangeTab(tabs.tagPoints);
      this.pointsListComponent.SelectPoints();
    }
  }

  BackToSelectedTag() {
    if (this.questionCount == 0) this.ChangeTab(tabs.tagPoints);
    else this.ChangeTab(tabs.questions);
  }

  QuestionSelected(questionID: number): void {
    this.filter.questionID = questionID;
    this.filter.slashTag = this.localData.PreviousSlashTagSelected;
    this.questionAnswersComponent.initialSelection();
    this.ChangeTab(tabs.questionAnswers);
  }

  ViewAllQuestions(): void {
    // From QuestionAnswers
    this.ChangeTab(tabs.questions);
  }

  AnswerAdded(questionID: number) {
    this.questionsListComponent.AnswerAdded(questionID);
  }

  // init, subscription, ChangeTab, applyFilter
  ShowFilterCriteria(show: boolean): void {
    this.showFilters = show;
    this.filter.applyFilter = show;

    if (this.showFilters) {
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
      if (!this.pointsFilterComponent) {
        filterChange = true; // wot no filter component? Might just not be displayed
      } else if (show) {
        filterChange = this.pointsFilterComponent.HasSavedFilter(); // Will a filter be applied?
      } else {
        filterChange = this.pointsFilterComponent.HasFilter(); // Will a filter be removed?
      }

      if (filterChange) {
        this.ReselectPoints(PointSortTypes.NoChange);
      }
    }
    this.tabIndex = tabs.tagPoints;
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

      this.tabIndex = tabs.tagPoints;
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

  NewPoint(): void {
    // Do nothing, this component also handles subscriptions

    this.externalTrigger = true;

    // Ensure new point at top
    this.newPointRefresh = true;
    this.pointSortType = PointSortTypes.DateDescend;
    this.SetSortDescending(true);

    this.pointsListComponent.ReselectForNewPoint();
    this.ChangeTab(tabs.tagPoints); // Causes reselection, but already selecting detected

    this.externalTrigger = false;
  }

  CancelNewPoint(): void {
    this.ChangeTab(tabs.tagPoints);
  }

  NewQuestion() {
    this.questionsListComponent.ReselectForNewQuestion();

    this.questionAnswersComponent.ReselectForNewAnswer();
    this.ChangeTab(tabs.questions); // Causes reselection, but already selecting detected
  }

  CancelNewQuestion(): void {
    this.ChangeTab(tabs.questions);
  }

  BogSelected(bog: BreakoutGroup): void {
    this.bogSelected = bog;
    this.ChangeTab(tabs.groupDiscussion);
  }

  SelectAnotherBoG(): void {
    this.bogSelectionComponent.viewMyGroups();
    this.ChangeTab(tabs.groups);
  }

  ngOnDestroy(): void {
    this.tagLatestActivity$?.unsubscribe();
    this.pointsFilterRemove$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
