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

  // Tag fetch for tab switching after local setting change
  fetchedTagsTrending = false;
  fetchedTagsTrendingLocal = false;
  fetchedTagsRecent = false;
  fetchedTagsRecentLocal = false;
  fetchedTagsSearch = false;
  fetchedTagsSearchLocal = false;

  // Point fetch for tab switching after local setting change
  fetchedPoints = false;
  fetchedPointsLocal = false;

  public get topicSelected() {
    return this.localData.SlashTagToTopic(this.filter.slashTag);
  }

  // Question Answers or Tag Points
  qp = 'question'; // bound to radio button value

  public get showQuestions(): boolean {
    return this.qp === 'question';
  }

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
  refreshRecentTags = false;
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

    // Local Politics - Constituency
    this.SetConstituency();

    // Default Sort Type
    this.filter.sortType = PointSortTypes.TrendingActivity;
    this.SetSortTypeIcon(PointSortTypes.TrendingActivity);

    // Default SortOrder
    this.filter.sortAscending = false;

    // EXTERNAL ROUTECHANGE (not tab change): Need to subscribe to route change to get route params
    // https://angular-2-training-book.rangle.io/handout/routing/routeparams.html

    // No tag selected? Go to API to get latest

    if (this.noTopic && this.localData.PreviousSlashTagSelected) {
      this.filter.slashTag = this.localData.PreviousSlashTagSelected;
    }

    if (this.noTopic) {
      this.tagLatestActivity$ = this.tagsService
        .TagLatestActivity(this.filter.constituencyID)
        .subscribe({
          next: slashTag => {
            this.localData.PreviousSlashTagSelected = slashTag;
            this.filter.slashTag = slashTag;
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
      const tagParam = params.get('tag'); // may be null
      const slashTag = '/' + tagParam; // always not null
      const questionSlug = params.get('questionSlug');
      const titleParam = params.get('title');

      if (!!tagParam && slashTag !== this.localData.PreviousSlashTagSelected) {
        this.filter.slashTag = tagParam;
        this.localData.PreviousSlashTagSelected = this.filter.slashTag;

        // QuestionAnswers
        if (questionSlug) {
          if (this.tabIndex !== Tabs.questionAnswers) {
            this.ChangeTab(Tabs.questionAnswers);
          } else {
            this.questionsListComponent.SelectQuestions(true);
          }
        } else {
          // PointsList now emits any new slashtag selected
          // this.pointsSelected = false;
          // if (this.tabIndex !== Tabs.tagPoints) {
          //   this.ChangeTab(Tabs.tagPoints);
          // } else {
          //   this.pointsListComponent.SelectPoints();
          //   this.pointsSelected = true;
          // }
        }
      }

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

      this.filter.slashTag = this.localData.PreviousSlashTagSelected;

      switch (routeparts[1]) {
        // may have separate tab for following
        case 'trending':
          this.tabIndex = Tabs.trendingTags;
          this.previousTabIndex = Tabs.trendingTags;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          this.tagsTrendingComponent.FetchTagsForConstituency(
            this.filter.constituencyID
          );
          if (this.filter.constituencyID > 0) {
            this.fetchedTagsTrendingLocal = true;
          } else {
            this.fetchedTagsTrending = true;
          }
          break;
        case 'recent':
          this.tabIndex = Tabs.recentTags;
          this.previousTabIndex = Tabs.recentTags;
          this.appData.defaultSort = PointSortTypes.DateUpdated;
          this.tagsRecentComponent.FetchTagsForConstituency(
            this.filter.constituencyID
          );
          if (this.filter.constituencyID > 0) {
            this.fetchedTagsRecentLocal = true;
          } else {
            this.fetchedTagsRecent = true;
          }

          break;
        case 'search':
          this.tabIndex = Tabs.tagSearch;
          this.previousTabIndex = Tabs.tagSearch;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          break;
        default:
          this.tabIndex = Tabs.tagPoints;
          this.qp = 'point';
          this.filter.slashTag = '/' + routeparts[1];
      }
    } else if (routeparts.length === 3) {
      // {0}/{slashTag}/points

      this.filter.slashTag = '/' + routeparts[1];

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
      this.filter.slashTag = '/' + routeparts[1];

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

  SetConstituency() {
    if (this.localData.forConstituency) {
      this.filter.constituencyID = this.localData.ConstituencyIDVoter;
    } else {
      this.filter.constituencyID = 0;
    }
  }

  ChangeLocal(): void {
    // Change constituency filter
    this.localData.forConstituency = !this.localData.forConstituency;
    this.SetConstituency();

    // Default switch off one half of "fetches"
    if (this.filter.constituencyID > 0) {
      this.fetchedTagsTrendingLocal = false;
      this.fetchedTagsRecentLocal = false;
      this.fetchedTagsSearchLocal = false;
      this.fetchedPointsLocal = false;
    } else {
      this.fetchedTagsTrending = false;
      this.fetchedTagsRecent = false;
      this.fetchedTagsSearch = false;
      this.fetchedPoints = false;
    }

    // Switch on specific "fetch"
    if (this.tabIndex === Tabs.trendingTags) {
      this.tagsTrendingComponent.FetchTagsForConstituency(
        this.filter.constituencyID
      );
      if (this.filter.constituencyID > 0) {
        this.fetchedTagsTrendingLocal = true;
      } else {
        this.fetchedTagsTrending = true;
      }
    } else if (this.tabIndex === Tabs.recentTags) {
      this.tagsRecentComponent.FetchTagsForConstituency(
        this.filter.constituencyID
      );
      if (this.filter.constituencyID > 0) {
        this.fetchedTagsRecentLocal = true;
      } else {
        this.fetchedTagsRecent = true;
      }
    } else if (this.tabIndex === Tabs.tagSearch) {
      this.tagSearchComponent.SetConstituencyID(this.filter.constituencyID);
      if (this.filter.constituencyID > 0) {
        this.fetchedTagsSearchLocal = true;
      } else {
        this.fetchedTagsSearch = true;
      }
    }
  }

  ChangeLocalSelection() {
    // Change constituency filter
    this.localData.forConstituency = !this.localData.forConstituency;
    this.SetConstituency();
    if (this.localData.forConstituency) {
      // switched to local - reselect local tags on tab switch
      this.fetchedTagsTrendingLocal = false;
      this.fetchedTagsRecentLocal = false;
      this.fetchedTagsSearchLocal = false;
    } else {
      // switched to national - reselect national tags on tab switch
      this.fetchedTagsTrending = false;
      this.fetchedTagsRecent = false;
      this.fetchedTagsSearch = false;
    }

    if (this.tabIndex == Tabs.tagPoints) {
      this.ReselectPoints(PointSortTypes.NoChange);
    } else {
      this.questionsSelected = false;
      this.ReselectQuestions();
    }
  }

  AltSLashTagSelected(slashTag: string) {
    this.NewSlashTagSelected(slashTag);
    this.RouteParameterChanged(true, slashTag);
  }

  // TagCloud and PointsList Components emits NewSlashTagSelected
  NewSlashTagSelected(slashTag: string): void {
    // Direct communication from tags components
    this.filter.slashTag = slashTag;
    this.filter.updateTopicViewCount = true;
    this.pointsFilterComponent.ClearPointFilters();
    this.haveRecentSlashTags = true;
    this.questionsSelected = false;

    this.ReselectPoints(PointSortTypes.NoChange);
  }

  ShowQuestions(): void {
    this.ChangeTab(Tabs.questionList);
  }

  ReselectQuestions() {
    this.questionsSelected = false;
    this.pointsSelected = false;

    this.ChangeTab(Tabs.questionList);
    this.questionsListComponent.SelectQuestions(false);
  }

  ReselectForNewPoint() {
    this.ReselectPoints(PointSortTypes.DateDescend);
  }

  // Reselect Points on new tag selected
  ReselectPoints(pointSortType: PointSortTypes) {
    this.externalTrigger = true;

    this.filter.slashTag = this.localData.PreviousSlashTagSelected;

    if (pointSortType !== PointSortTypes.NoChange) {
      this.filter.sortType = pointSortType;
    }

    this.SetSortTypeIcon(pointSortType);

    this.pointsSelected = false;
    this.ChangeTab(Tabs.tagPoints); // will select points

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
        if (!this.fetchedTagsTrending || !this.fetchedTagsTrendingLocal) {
          // Fetch something for constituencyID (may be 0)
          this.tagsTrendingComponent.FetchTagsForConstituency(
            this.filter.constituencyID
          );
          if (this.filter.constituencyID > 0) {
            this.fetchedTagsTrendingLocal = true;
          } else {
            this.fetchedTagsTrending = true;
          }
        }
        break;

      case Tabs.recentTags:
        this.previousTabIndex = tabIndex;

        this.appData.defaultSort = PointSortTypes.DateUpdated;
        newRoute = '/recent';
        let fetched = false;
        // Check if we need to fetch tags for local setting (on/off)
        if (!this.fetchedTagsRecent || !this.fetchedTagsRecentLocal) {
          // Fetch something for constituencyID (may be 0)
          this.tagsRecentComponent.FetchTagsForConstituency(
            this.filter.constituencyID
          );
          fetched = true;
        } else if (this.refreshRecentTags) {
          // Voter had selected a new tag
          this.tagsRecentComponent.FetchTags();
          fetched = true;
        }
        // Remember what was fetched
        if (fetched) {
          if (this.filter.constituencyID > 0) {
            this.fetchedTagsRecentLocal = true;
          } else {
            this.fetchedTagsRecent = true;
          }
        }
        this.refreshRecentTags = false;
        break;

      case Tabs.tagSearch:
        this.previousTabIndex = tabIndex;
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        newRoute = '/search';
        if (!this.fetchedTagsSearch || !this.fetchedTagsSearchLocal) {
          this.tagSearchComponent.SetConstituencyID(this.filter.constituencyID);
          if (this.filter.constituencyID > 0) {
            this.fetchedTagsSearchLocal = true;
          } else {
            this.fetchedTagsSearch = true;
          }
        }
        break;

      case Tabs.questionList:
        this.qp = 'question';
        this.filter.pointSelectionType = PointSelectionTypes.QuestionPoints;

        // Select questions for tag?
        if (!this.questionsSelected) {
          this.refreshRecentTags = true; // Refresh Recent Tags when switch back from Point Selection
          this.questionsListComponent.SelectQuestions(true);
        }

        this.questionsSelected = true;

        newRoute = this.filter.slashTag;

        break;

      case Tabs.questionAnswers:
        newRoute = this.filter.slashTag;
        break;

      case Tabs.groups:
        this.bogSelectionComponent.breakoutGroupsJoined(true);
        newRoute = this.filter.slashTag + '/break-out-groups';
        break;

      case Tabs.groupDiscussion:
        newRoute =
          this.filter.slashTag +
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
          newRoute = this.filter.slashTag; // Tell the app component
        } else {
          newRoute = `${this.filter.slashTag}/by/${alias}`;

          // ShowFilter for alias
          if (!this.applyingFilter) this.ShowPointFilterCriteria(true);
        }

        this.newPointRefresh = false;
        this.refreshRecentTags = true; // Refresh Recent Tags when switch back from Point Selection

        if (!this.pointsSelected && !!this.pointsListComponent) {
          this.pointsListComponent.SelectPoints();
          this.pointsSelected = true;
        }

        break;

      case Tabs.newPoint:
        if (this.qp === 'question') {
          this.newQuestionComponent.NewQuestion(this.filter.slashTag);
        } else {
          this.newPointComponent.NewPoint(
            this.filter.slashTag,
            this.filter.constituencyID
          );
        }
        newRoute = `/${this.filter.slashTag}/new-${this.qp}`;
        break;
    }

    this.RouteParameterChanged(tabChanged, newRoute);
  }

  // Tell the App Component that the route has changed
  RouteParameterChanged(hasChanged: boolean, newRoute: string): void {
    newRoute = this.localData.TopicToSlashTag(newRoute);
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
  }

  BackToSelectedTag() {
    if (this.questionCount == 0) {
      // If local setting has changed on tags screen, may need to reselect points
      if (
        (this.localData.forConstituency && !this.fetchedPointsLocal) ||
        (!this.localData.forConstituency && !this.fetchedPoints)
      )
        this.ReselectPoints(PointSortTypes.NoChange);

      this.ChangeTab(Tabs.tagPoints);
    } else {
      this.ChangeTab(Tabs.questionList);
    }
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
