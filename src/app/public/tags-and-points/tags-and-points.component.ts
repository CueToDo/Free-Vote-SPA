// Angular
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// rxjs
import { Subscription } from 'rxjs';

// Model/Enums
import {
  PointSortTypes,
  PointSelectionTypes,
  Tabs
} from 'src/app/models/enums';
import { BreakoutGroup } from 'src/app/models/break-out-group.model';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { Auth0Wrapper } from 'src/app/services/auth-wrapper.service';
import { TagsService } from 'src/app/services/tags.service';

// Components
import { PointEditComponent } from 'src/app/public//point-edit/point-edit.component';
import { PointsFilterComponent } from 'src/app/public/points-filter/points-filter.component';
import { PointsListComponent } from 'src/app/public/points-list/points-list.component';
import { QuestionAnswersComponent } from './../question-answers/question-answers.component';
import { QuestionEditComponent } from 'src/app/public/question-edit/question-edit.component';
import { QuestionsListComponent } from 'src/app/public/questions-list/questions-list.component';
import { TagCloudComponent } from 'src/app/base/tagCloud/tagCloud.component';

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

  // responsive variables
  widthBand = 4;
  isLargeMobile = false;

  get slashTagButtonText(): string {
    if (this.isLargeMobile) return 'tag';
    return 'slash-tag';
  }

  get slashTagsButtonText(): string {
    if (this.isLargeMobile) return 'tags';
    return 'slash-tags';
  }

  public get slashTagButtonToolTip(): string {
    return `show points for\n"${this.topicSelected}"`;
  }

  // Public variables for use in template
  public Tabs = Tabs;
  public tabIndex = Tabs.notSelected;

  // Point fetch for tab switching after local setting change
  fetchedPoints = false;
  fetchedPointsLocal = false;

  public get topicSelected() {
    return this.localData.SlashTagToTopic(this.filter.slashTag);
  }

  // Question Answers or Tag Points
  qp = 'point';

  public get showQuestions(): boolean {
    return this.qp === 'question';
  }

  // Filter
  filter = new FilterCriteria();
  showFilters = false;
  applyingFilter = false; // prevent cascading burgerMenuTrigger

  // Questions Select
  questionCount = 0;
  questionsSelected = false;

  // Point Select
  externalTrigger = false; // Set on subscriptions
  refreshRecentTags = false;
  pointsSelected = false;

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

  // Feedback
  feedbackOn = true;

  // use TRV in parent template https://stackblitz.com/edit/angular-vjbf4s?file=src%2Fapp%2Fcart-table-modal.component.ts
  // use child component type in parent component https://stackoverflow.com/questions/31013461/call-a-method-of-the-child-component

  @ViewChild('pointsFilter') pointsFilterComponent!: PointsFilterComponent;

  // Tags
  @ViewChild('slashTagsComponent') slashTagsComponent!: TagCloudComponent;

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
    public auth0Service: AuthService,
    private tagsService: TagsService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Initialise only - subscriptions follow
    this.appData.TagsPointsActive$.next(true);

    // Local Politics - Constituency
    this.SetConstituency();

    // Default Sort Type
    this.filter.sortType = PointSortTypes.TrendingActivity;

    // Default SortOrder
    this.filter.sortDescending = true;

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
        }
      }

      // PointShare
      if (titleParam) this.qp = 'point';
    });

    // https://alligator.io/angular/breakpoints-angular-cdk/
    this.breakpointObserver
      .observe(['(max-width: 425px)'])
      .subscribe((state: BreakpointState) => {
        this.isLargeMobile = state.matches;
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
        case 'slash-tags':
        case 'trending':
        case 'recent':
          this.tabIndex = Tabs.slashTags;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          this.slashTagsComponent.FetchTags();
          break;
        case 'tag-search':
          this.tabIndex = Tabs.slashTags;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          this.slashTagsComponent.TagSearch();
          break;
        default:
          this.tabIndex = Tabs.tagPoints;
          this.qp = 'point';
          this.filter.slashTag = '/' + routeparts[1];
      }
    } else if (routeparts.length === 3) {
      // {0}/{slashTag}/points

      this.filter.slashTag = '/' + routeparts[2];

      switch (routeparts[1]) {
        case 'questions':
          this.tabIndex = Tabs.questionList;
          this.qp = 'question';
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
          this.ShowPointFilterCriteria(true);
          break;
      }
    } else {
      // Default to slashTags - shouldn't be needed
      this.tabIndex = Tabs.slashTags;
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

  ChangeLocalTags(): void {
    // Change constituency filter
    this.localData.forConstituency = !this.localData.forConstituency;

    this.SetConstituency();

    // Default switch off one half of "fetches"
    if (this.filter.constituencyID > 0) {
      this.fetchedPointsLocal = false;
    } else {
      this.fetchedPoints = false;
    }

    // Switch on specific "fetch"
    if (this.tabIndex === Tabs.slashTags) this.slashTagsComponent.FetchTags();
  }

  ChangeLocalPointsOrQuestionsSelection() {
    // Change constituency filter
    this.localData.forConstituency = !this.localData.forConstituency;

    this.SetConstituency();

    if (this.tabIndex == Tabs.tagPoints) {
      this.ReselectPoints(PointSortTypes.NoChange);
    } else {
      this.questionsSelected = false;
      this.ReselectQuestions();
    }
  }

  AltSlashTagSelected(slashTag: string) {
    this.NewSlashTagSelected(slashTag);
    this.RouteParameterChanged(true, slashTag);
  }

  // TagCloud and PointsList Components emits NewSlashTagSelected
  NewSlashTagSelected(slashTag: string): void {
    // Direct communication from tags components
    this.filter.slashTag = slashTag;
    this.filter.updateTopicViewCount = true;
    this.pointsFilterComponent.ClearPointFilters();
    this.questionsSelected = false;

    this.ReselectPoints(PointSortTypes.NoChange);
  }

  // 1. Questions
  ShowQuestions(): void {
    this.qp = 'question';
    this.ChangeTab(Tabs.questionList);
  }

  // 2. Points
  ShowPoints(): void {
    this.qp = 'point';
    this.ChangeTab(Tabs.tagPoints);
  }

  ReselectQuestions() {
    this.questionsSelected = false;
    this.pointsSelected = false;

    this.ChangeTab(Tabs.questionList);
    this.questionsListComponent.SelectQuestions(false);
  }

  ShowTags() {
    this.ChangeTab(Tabs.slashTags);
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
      case Tabs.slashTags:
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        newRoute = '/trending';

        if (this.refreshRecentTags) {
          // Voter had selected a new tag
          this.slashTagsComponent.FetchTags();
        }

        this.refreshRecentTags = false;
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

      case Tabs.tagPoints:
        this.qp = 'point';
        // Don't remove filter
        if (this.filter.pointSelectionType != PointSelectionTypes.Filtered) {
          this.filter.pointSelectionType = PointSelectionTypes.TagPoints;
        }
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
          this.newPointComponent.PrepareNewPoint(this.filter.slashTag, 0);
        }
        newRoute = `${this.filter.slashTag}/new-${this.qp}`;
        break;
    }

    this.RouteParameterChanged(tabChanged, newRoute);
  }

  SelectSlashTags() {
    this.ChangeTab(Tabs.slashTags);
  }

  // Tell the App Component that the route has changed
  RouteParameterChanged(hasChanged: boolean, newRoute: string): void {
    if (hasChanged) {
      newRoute = this.localData.TopicToSlashTag(newRoute);
      this.appData.RouteParamChange$.next(newRoute);
    }
  }

  // From child PointsFilter Component
  // It's not banana in a box, but filter gets updated
  applyFilter(): void {
    this.applyingFilter = true;
    this.pointsSelected = false;
    this.pointsListComponent.SelectPoints();
    this.applyingFilter = false;
  }

  cancelSearch(): void {
    this.showFilters = false;
    this.pointsSelected = false;
    this.pointsListComponent.SelectPoints();
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
    this.filter.sortType = pointSortType; // Pass update to sort menu
    this.externalTrigger = false;
  }

  SetSortDescending(descending: boolean): void {
    this.filter.sortDescending = descending;

    // Can't reverse random, so default to TrendingActivity
    if (this.filter.sortType === PointSortTypes.Random) {
      this.filter.sortType = PointSortTypes.TrendingActivity;
    }

    if (!this.externalTrigger) {
      this.pointsListComponent.NewSortOrder();
    }
  }

  // If sort type is random, order (ascending/descending) is irrelevant
  SetSortType(pointSortType: PointSortTypes): void {
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

      this.filter.sortType = pointSortType;
    }
  }

  refresh(): void {
    this.externalTrigger = true; // prevent further communication to points component
    this.pointsListComponent.NewSortOrder(); // This communicates to points component
    this.externalTrigger = false;
  }

  NewPointCreated(): void {
    // Ensure new point at top
    this.filter.sortDescending = true;
    this.ReselectPoints(PointSortTypes.DateUpdated);
  }

  // Reselect Points on new sort
  ReselectPoints(pointSortType: PointSortTypes) {
    this.externalTrigger = true;

    this.filter.slashTag = this.localData.PreviousSlashTagSelected;

    if (pointSortType !== PointSortTypes.NoChange) {
      this.filter.sortType = pointSortType;
    }

    this.pointsSelected = false;
    this.ChangeTab(Tabs.tagPoints); // will select points

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

  FeedbackChange(feedbackOn: boolean) {
    this.feedbackOn = feedbackOn;
  }

  ngOnDestroy(): void {
    this.tagLatestActivity$?.unsubscribe();
    this.pointsFilterRemove$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
