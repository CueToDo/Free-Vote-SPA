import { Point } from './../../models/point.model';
// Angular
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
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
import { TagsService } from 'src/app/services/tags.service';

// Components
import { PointsFilterComponent } from 'src/app/public/points-filter/points-filter.component';
import { TagCloudComponent } from 'src/app/base/tagCloud/tagCloud.component';
import { TagSearchComponent } from './../tag-search/tag-search.component';
import { QuestionsListComponent } from 'src/app/public/questions-list/questions-list.component';
import { QuestionAnswersComponent } from './../question-answers/question-answers.component';
import { GroupSelectionComponent } from 'src/app/breakoutgroups/group-selection/group-selection.component';
import { GroupDiscussionComponent } from 'src/app/breakoutgroups/group-discussion/group-discussion.component';
import { PointsListComponent } from 'src/app/public/points-list/points-list.component';
import { PointEditComponent } from 'src/app/public//point-edit/point-edit.component';
import { QuestionEditComponent } from 'src/app/public/question-edit/question-edit.component';

enum Tabs {
  // Tags
  trendingTags = 0,
  recentTags = 1,
  tagSearch = 2,

  // Questions, Answers
  questionList = 3,
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
export class TagsAndPointsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // Subscriptions
  tagLatestActivity$: Subscription | undefined;
  pointsFilterRemove$: Subscription | undefined;
  width$: Subscription | undefined; // Viewport width monitoring
  widthBand = 4;

  // Public variables for use in template
  public Tabs = Tabs;
  public tabIndex = Tabs.recentTags;
  public previousTabIndex = Tabs.recentTags;

  // Topic - Tag Cloud
  public TagCloudTypes = TagCloudTypes;
  public haveRecentSlashTags = false;
  public forConstituency = false;
  fetchedTrending = false;
  fetchedTrendingLocal = false;
  fetchedRecent = false;
  fetchedRecentLocal = false;
  fetchedSearch = false;
  fetchedSearchLocal = false;

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
  public sortToolTip = '';
  public sortTypeIcon = '';

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

  get noTopic(): boolean {
    return !this.topicSelected || this.topicSelected === 'null';
  }

  // use TRV in parent template https://stackblitz.com/edit/angular-vjbf4s?file=src%2Fapp%2Fcart-table-modal.component.ts
  // use child component type in parent component https://stackoverflow.com/questions/31013461/call-a-method-of-the-child-component

  @ViewChild('pointsFilter') pointsFilterComponent!: PointsFilterComponent;

  // Tags
  @ViewChild('tagsTrending') tagsTrendingComponent!: TagCloudComponent;
  @ViewChild('tagsRecent') tagsRecentComponent!: TagCloudComponent;
  @ViewChild('tagSearch') tagSearchComponent!: TagSearchComponent;

  // BOG
  @ViewChild('bogSelection') bogSelectionComponent!: GroupSelectionComponent;
  @ViewChild('bogDiscussion') bogDiscussionComponent!: GroupDiscussionComponent;

  //Points
  @ViewChild('appQuestionsList')
  questionsListComponent!: QuestionsListComponent;
  @ViewChild('appQuestionAnswers')
  questionAnswersComponent!: QuestionAnswersComponent;
  @ViewChild('appPointsList') pointsListComponent!: PointsListComponent;

  // New answer or point
  @ViewChild('newPoint') newPointComponent!: PointEditComponent;
  @ViewChild('newQuestion') newQuestionComponent!: QuestionEditComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appData: AppDataService,
    public localData: LocalDataService,
    private tagsService: TagsService
  ) {}

  ngOnInit(): void {
    // Initialise only - subscriptions follow
    this.appData.TagsPointsActive$.next(true);

    // Default Sort Type
    this.filter.sortType = PointSortTypes.TrendingActivity;
    this.SetSortTypeIcon(PointSortTypes.TrendingActivity);

    // Default SortOrder
    this.filter.sortAscending = false;

    // EXTERNAL ROUTECHANGE (not tab change): Need to subscribe to route change to get route params
    // https://angular-2-training-book.rangle.io/handout/routing/routeparams.html

    // No tag selected? Go to API to get latest

    if (this.noTopic && this.localData.PreviousSlashTagSelected) {
      this.topicSelected = this.localData.PreviousTopicSelected;
    }

    if (this.noTopic) {
      this.tagLatestActivity$ = this.tagsService
        .TagLatestActivity(this.filter.constituencyID)
        .subscribe({
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
      if (questionSlug) this.ChangeTab(Tabs.questionAnswers);

      // PointShare
      if (titleParam) this.qp = 'point';
    });
  }

  ngAfterViewInit() {
    // Process Initial Route
    const routeparts = this.appData.Route.split('/');
    if (routeparts) this.InitialRoute(routeparts);
  }

  InitialRoute(routeparts: string[]): void {
    if (routeparts.length === 2) {
      // {0}/trending - length=2

      this.topicSelected = this.localData.PreviousTopicSelected;

      switch (routeparts[1]) {
        // may have separate tab for following
        case 'trending':
          this.tabIndex = Tabs.trendingTags;
          this.previousTabIndex = Tabs.trendingTags;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          this.tagsTrendingComponent.SetConstituencyID(
            this.filter.constituencyID
          );
          if (this.filter.constituencyID > 0) {
            this.fetchedTrendingLocal = true;
          } else {
            this.fetchedTrending = true;
          }
          break;
        case 'recent':
          this.tabIndex = Tabs.recentTags;
          this.previousTabIndex = Tabs.recentTags;
          this.appData.defaultSort = PointSortTypes.DateUpdated;
          this.tagsRecentComponent.SetConstituencyID(
            this.filter.constituencyID
          );
          if (this.filter.constituencyID > 0) {
            this.fetchedRecentLocal = true;
          } else {
            this.fetchedRecent = true;
          }

          break;
        case 'search':
          this.tabIndex = Tabs.tagSearch;
          this.previousTabIndex = Tabs.tagSearch;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          break;
        default:
          this.tabIndex = Tabs.questionList;
          this.qp = 'question';
          this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);
      }
    } else if (routeparts.length === 3) {
      // {0}/{slashTag}/points

      this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);

      switch (routeparts[2]) {
        case 'questions':
          this.tabIndex = Tabs.questionList;
          this.qp = 'question';
          break;
        case 'groups':
          this.tabIndex = Tabs.groups;
          this.previousTabIndex = Tabs.groups;
          break;
        case 'points':
          this.tabIndex = Tabs.tagPoints;
          this.qp = 'point';
          this.ReselectPoints(PointSortTypes.TrendingActivity);
          break;
      }
    } else if (routeparts.length === 4) {
      // {0}/{slashTag}/by/{Alias}
      // {0}/{slashTag}/question/{question-slug}
      this.topicSelected = this.localData.SlashTagToTopic(routeparts[1]);

      switch (routeparts[2]) {
        case 'question':
          this.tabIndex = Tabs.questionAnswers;
          break;
        case 'by':
          this.tabIndex = Tabs.tagPoints;
          this.previousTabIndex = Tabs.tagPoints;
          this.ShowPointFilterCriteria(true);
          break;
      }
    } else {
      // Default to trending - shouldn't be needed
      this.tabIndex = Tabs.trendingTags;
      this.previousTabIndex = Tabs.trendingTags;
      this.appData.defaultSort = PointSortTypes.TrendingActivity;
    }
  }

  ChangeLocal(): void {
    this.forConstituency = !this.forConstituency;
    if (this.forConstituency) {
      this.filter.constituencyID = this.localData.ConstituencyID;
    } else {
      this.filter.constituencyID = 0;
    }
    if (this.tabIndex === Tabs.trendingTags) {
      this.tagsTrendingComponent.SetConstituencyID(this.filter.constituencyID);
      if (this.filter.constituencyID > 0) {
        this.fetchedTrendingLocal = true;
        this.fetchedRecentLocal = false;
        this.fetchedSearchLocal = false;
      } else {
        this.fetchedTrending = true;
        this.fetchedRecent = false;
        this.fetchedSearch = false;
      }
    } else if (this.tabIndex === Tabs.recentTags) {
      this.tagsRecentComponent.SetConstituencyID(this.filter.constituencyID);
      if (this.filter.constituencyID > 0) {
        this.fetchedRecentLocal = true;
        this.fetchedTrendingLocal = false;
        this.fetchedSearchLocal = false;
      } else {
        this.fetchedRecent = true;
        this.fetchedTrending = false;
        this.fetchedSearch = false;
      }
    } else if (this.tabIndex === Tabs.tagSearch) {
      this.tagSearchComponent.SetConstituencyID(this.filter.constituencyID);
      if (this.filter.constituencyID > 0) {
        this.fetchedSearchLocal = true;
        this.fetchedRecentLocal = false;
        this.fetchedTrendingLocal = false;
      } else {
        this.fetchedSearch = true;
        this.fetchedRecent = false;
        this.fetchedTrending = false;
      }
    }
  }

  ChangeLocalPoints() {
    this.ChangeLocal();
    if (this.tabIndex == Tabs.tagPoints) {
      this.ReselectPoints(PointSortTypes.NoChange);
    } else {
      this.ReselectQuestions();
    }
  }

  // TagCloud Components emits NewSlashTagSelected
  NewSlashTagSelected(slashTag: string): void {
    // Direct communication from tags components
    this.topicSelected = this.localData.SlashTagToTopic(slashTag);
    this.filter.updateTopicViewCount = true;
    this.pointsFilterComponent.ClearPointFilters();
    this.haveRecentSlashTags = true;
    this.questionsSelected = false;

    this.ReselectPoints(PointSortTypes.NoChange);
  }

  ShowQuestions(): void {
    // Manual stop auto switch
    this.allowSwitchToPoints = false;
    this.ChangeTab(Tabs.questionList);
  }

  ReselectQuestions() {
    this.questionsSelected = false;
    this.pointsSelected = false;
    this.allowSwitchToPoints = true;

    this.ChangeTab(Tabs.questionList);
  }

  ReselectForNewPoint() {
    this.ReselectPoints(PointSortTypes.DateDescend);
  }

  // Reselect Points on new tag selected
  ReselectPoints(pointSortType: PointSortTypes) {
    this.externalTrigger = true;

    this.topicSelected = this.localData.PreviousTopicSelected;

    if (pointSortType !== PointSortTypes.NoChange) {
      this.filter.sortType = pointSortType;
    }

    this.SetSortTypeIcon(pointSortType);

    this.allowSwitchToPoints = true;

    this.ChangeTab(Tabs.tagPoints);
    this.pointsListComponent.SelectPoints();

    this.externalTrigger = false;
  }

  /// Change Tab and notify app component in TabChangeComplete
  ChangeTab(tabIndex: Tabs): void {
    // Actual tab change, or just title change (due to voter filters)
    const tabChanged = this.tabIndex !== tabIndex;

    this.tabIndex = tabIndex;
    var newRoute = '';

    // if (tabIndex != Tabs.tagPoints) {
    //   this.ShowPointFilterCriteria(false);
    // }

    switch (tabIndex) {
      case Tabs.trendingTags:
        this.previousTabIndex = tabIndex;
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        newRoute = '/trending';
        if (!this.fetchedTrending || !this.fetchedTrendingLocal) {
          this.tagsTrendingComponent.SetConstituencyID(
            this.filter.constituencyID
          );
          if (this.filter.constituencyID > 0) {
            this.fetchedTrendingLocal = true;
          } else {
            this.fetchedTrending = true;
          }
        }
        break;

      case Tabs.recentTags:
        this.previousTabIndex = tabIndex;

        this.appData.defaultSort = PointSortTypes.DateUpdated;
        newRoute = '/recent';
        if (!this.fetchedRecent || !this.fetchedRecentLocal) {
          this.tagsRecentComponent.SetConstituencyID(
            this.filter.constituencyID
          );
          if (this.filter.constituencyID > 0) {
            this.fetchedRecentLocal = true;
          } else {
            this.fetchedRecent = true;
          }
        } else if (this.refreshRecent) {
          this.tagsRecentComponent.fetchTags();
        }
        this.refreshRecent = false;
        break;

      case Tabs.tagSearch:
        this.previousTabIndex = tabIndex;
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        newRoute = '/search';
        if (!this.fetchedSearch || !this.fetchedSearchLocal) {
          this.tagSearchComponent.SetConstituencyID(this.filter.constituencyID);
          if (this.filter.constituencyID > 0) {
            this.fetchedSearchLocal = true;
          } else {
            this.fetchedSearch = true;
          }
        }
        break;

      case Tabs.questionList:
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

      case Tabs.questionAnswers:
        newRoute = this.slashTagSelected;
        break;

      case Tabs.groups:
        this.bogSelectionComponent.breakoutGroupsJoined(true);
        newRoute = this.slashTagSelected + '/break-out-groups';
        break;

      case Tabs.groupDiscussion:
        newRoute =
          this.slashTagSelected +
          '/break-out-groups/' +
          this.appData.kebabUri(this.bogSelected.breakoutRoom);
        break;

      case Tabs.tagPoints:
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
          if (!this.applyingFilter) this.ShowPointFilterCriteria(true);
        }

        this.newPointRefresh = false;
        this.refreshRecent = true; // Refresh Recent Tags when switch back from Point Selection

        if (!this.pointsSelected) this.pointsListComponent.SelectPoints();
        this.pointsSelected = true;

        break;

      case Tabs.newPoint:
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
  applyFilter(): void {
    this.applyingFilter = true;
    this.pointsSelected = false;
    this.pointsListComponent.SelectPoints();
    this.applyingFilter = false;
  }

  // QuestionsList emits the question count, which may cause switch to points
  QuestionCount(count: number): void {
    this.questionCount = count;
    if (count == 0 && this.allowSwitchToPoints) {
      this.ChangeTab(Tabs.tagPoints);
      this.pointsListComponent.SelectPoints();
    }
  }

  BackToSelectedTag() {
    if (this.questionCount == 0) this.ChangeTab(Tabs.tagPoints);
    else this.ChangeTab(Tabs.questionList);
  }

  QuestionSelected(questionID: number): void {
    this.filter.questionID = questionID;
    this.filter.slashTag = this.localData.PreviousSlashTagSelected;
    this.questionAnswersComponent.initialSelection();
    this.ChangeTab(Tabs.questionAnswers);
  }

  ViewAllQuestions(): void {
    // From QuestionAnswers
    this.ChangeTab(Tabs.questionList);
  }

  AnswerAdded(questionID: number) {
    this.questionsListComponent.AnswerAdded(questionID);
  }

  AnswerRemoved(questionID: number) {
    this.questionsListComponent.AnswerRemoved(questionID);
  }

  // init, subscription, ChangeTab, applyFilter
  ShowPointFilterCriteria(show: boolean): void {
    this.showFilters = show;

    if (show) {
      this.filterIcon = 'manage_search';
      this.filterText = 'searching';
      this.filterToolTip = 'hide search criteria';
    } else {
      this.filterIcon = 'search';
      this.filterText = 'search';
      this.filterToolTip = 'show point search criteria';
    }

    this.filter.pointSelectionType = PointSelectionTypes.Filtered;

    if (!show) {
      switch (this.tabIndex) {
        case Tabs.questionAnswers:
          this.filter.pointSelectionType = PointSelectionTypes.QuestionPoints;
          break;
        case Tabs.tagPoints:
          this.filter.pointSelectionType = PointSelectionTypes.TagPoints;
          break;
      }
    }

    if (!this.externalTrigger) {
      // Only get Points component to reselect points if there is a change of filter criteria
      let filterChange = false;
      if (!this.pointsFilterComponent) {
        filterChange = true; // wot no filter component? Might just not be displayed
      } else if (show) {
        // filterChange = this.pointsFilterComponent.HasSavedFilter(); // Will a filter be applied?
      } else {
        // filterChange = this.pointsFilterComponent.HasFilter(); // Will a filter be removed?
      }

      if (filterChange) {
        this.ReselectPoints(PointSortTypes.NoChange);
      }
    }
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

      this.filter.sortType = pointSortType;

      switch (pointSortType) {
        case PointSortTypes.TrendingActivity:
          this.sortTypeIcon = 'trending_up';
          this.sortToolTip = 'showing points trending now';
          break;
        case PointSortTypes.AllTimePopularity:
          this.sortTypeIcon = 'favorite_border';
          this.sortToolTip = 'showing most popular first (all time)';
          break;
        case PointSortTypes.Random:
          this.sortTypeIcon = 'gesture';
          this.sortToolTip = 'showing in random order';
          break;
        default:
          this.sortTypeIcon = 'calendar_today';
          this.sortToolTip = 'showing most recent first';
          break;
      }
    }
  }

  SetSortDescending(descending: boolean): void {
    this.filter.savedSortDescending = descending;
    this.filter.sortAscending = !descending;

    // Can't reverse random, so default to TrendingActivity
    if (this.filter.sortType === PointSortTypes.Random) {
      this.filter.sortType = PointSortTypes.TrendingActivity;
    }

    if (!this.externalTrigger) {
      this.pointsListComponent.NewSortOrder();
    }

    this.SetSortTypeIcon(this.filter.sortType);
  }

  sortBy(pointSortType: PointSortTypes): void {
    if (
      this.filter.sortType !== pointSortType ||
      pointSortType === PointSortTypes.Random // new random order
    ) {
      // New sort order or user clicked random again

      // Communicate to PointsComponent - is a child could/should use Input?
      if (!this.externalTrigger) {
        this.pointsListComponent.NewSortType(pointSortType); // New random order or sort type
      }

      this.tabIndex = Tabs.tagPoints;
      this.ChangeTab(this.tabIndex);

      if (pointSortType === PointSortTypes.Random) {
        // Save old values and set to false
        this.filter.savedSortDescending = this.filter.sortDescending;
        this.filter.sortAscending = false;
      } else {
        // restore old values if switch to non-random sort
        this.filter.sortAscending = !this.filter.savedSortDescending;
      }

      this.SetSortTypeIcon(pointSortType);
    }
  }

  refresh(): void {
    this.externalTrigger = true; // prevent further communication to points component
    this.pointsListComponent.NewSortOrder(); // This communicates to points component
    this.externalTrigger = false;
  }

  NewPoint(): void {
    // Do nothing, this component also handles subscriptions

    this.externalTrigger = true;

    // Ensure new point at top
    this.newPointRefresh = true;
    this.filter.sortType = PointSortTypes.DateDescend;
    this.SetSortDescending(true);

    this.pointsListComponent.ReselectForNewPoint();
    this.ChangeTab(Tabs.tagPoints); // Causes reselection, but already selecting detected

    this.externalTrigger = false;
  }

  CancelNewPoint(): void {
    this.ChangeTab(Tabs.tagPoints);
  }

  NewQuestion() {
    this.questionsListComponent.ReselectForNewQuestion();

    this.questionAnswersComponent.ReselectForNewAnswer();
    this.ChangeTab(Tabs.questionList); // Causes reselection, but already selecting detected
  }

  CancelNewQuestion(): void {
    this.ChangeTab(Tabs.questionList);
  }

  BogSelected(bog: BreakoutGroup): void {
    this.bogSelected = bog;
    this.ChangeTab(Tabs.groupDiscussion);
  }

  SelectAnotherBoG(): void {
    this.bogSelectionComponent.viewMyGroups();
    this.ChangeTab(Tabs.groups);
  }

  ngOnDestroy(): void {
    this.tagLatestActivity$?.unsubscribe();
    this.pointsFilterRemove$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
