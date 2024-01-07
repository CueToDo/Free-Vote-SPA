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
import { PointSortTypes, Tabs } from 'src/app/models/enums';
import { BreakoutGroup } from 'src/app/models/break-out-group.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
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
  pointsFilterRemove$: Subscription | undefined;
  width$: Subscription | undefined; // Viewport width monitoring

  // responsive variables
  widthBand = 4;
  isLargeMobile = false;

  get slashTagsButtonText(): string {
    if (this.isLargeMobile) return 'tags';
    return 'slash-tags';
  }

  // Public variables for use in template
  public Tabs = Tabs;
  public tabIndex = Tabs.notSelected;

  // Question Answers or Tag Points
  specificQuestionIDSelected = 0;
  specificPointIDSelected = 0;

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
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Initialise only - subscriptions follow
    this.appData.TagsPointsActive$.next(true);

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

      if (!!tagParam && slashTag !== this.localData.SlashTagSelected) {
        this.localData.SlashTagSelected = tagParam;

        // QuestionAnswers
        if (questionSlug) {
          if (this.tabIndex !== Tabs.questionAnswers) {
            this.ChangeTab(Tabs.questionAnswers);
          } else {
            this.questionsListComponent.SelectQuestions(true);
          }
        }
      }
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

      switch (routeparts[1]) {
        // may have separate tab for following
        case 'slash-tags':
        case 'trending':
        case 'recent':
          this.tabIndex = Tabs.slashTags;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          break;
        case 'tag-search':
          this.tabIndex = Tabs.slashTags;
          this.appData.defaultSort = PointSortTypes.TrendingActivity;
          this.slashTagsComponent.TagSearch();
          break;
        default:
          this.tabIndex = Tabs.tagPoints;
          this.localData.SlashTagSelected = '/' + routeparts[1];
      }
    } else if (routeparts.length === 3) {
      // {0}/{slashTag}/points

      this.localData.SlashTagSelected = '/' + routeparts[2];

      switch (routeparts[1]) {
        case 'questions':
          this.tabIndex = Tabs.questionList;
          break;
        case 'points':
          this.tabIndex = Tabs.tagPoints;
          this.pointsListComponent.ReselectPoints(
            PointSortTypes.TrendingActivity
          );
          break;
      }
    } else if (routeparts.length === 4) {
      // {0}/{slashTag}/by/{Alias}
      // {0}/{slashTag}/question/{question-slug}
      this.localData.SlashTagSelected = '/' + routeparts[1];

      switch (routeparts[2]) {
        case 'question':
          this.tabIndex = Tabs.questionAnswers;
          break;
        case 'by':
          this.tabIndex = Tabs.tagPoints;
          break;
      }
    } else {
      // Default to slashTags - shouldn't be needed
      this.tabIndex = Tabs.slashTags;
      this.appData.defaultSort = PointSortTypes.TrendingActivity;
    }
  }

  ChangeConstituency(): void {
    // Change constituency filter
    this.localData.forConstituency = !this.localData.forConstituency;
  }

  ChangeLocalPointsOrQuestionsSelection() {
    // Change constituency filter
    this.localData.forConstituency = !this.localData.forConstituency;

    if (this.tabIndex == Tabs.tagPoints) {
      this.pointsListComponent.ReselectPoints(PointSortTypes.NoChange);
    } else {
      this.ReselectQuestions();
    }
  }

  // TagCloud and PointsList Components emits NewSlashTagSelected
  NewSlashTagSelected(slashTag: string): void {
    // Direct communication from tags components
    this.localData.SlashTagSelected = slashTag;
    this.ChangeTab(Tabs.tagPoints); // will select points and call RouteParameterChanged
  }

  // 1. Tags
  ShowTags() {
    this.ChangeTab(Tabs.slashTags);
  }

  // 2. Questions
  ShowQuestions(): void {
    this.ChangeTab(Tabs.questionList);
  }

  ReselectQuestions() {
    this.ChangeTab(Tabs.questionList);
    this.questionsListComponent.SelectQuestions(false);
  }

  // 3. Points
  ShowPoints(): void {
    this.ChangeTab(Tabs.tagPoints);
  }

  /// Change Tab and notify app component in TabChangeComplete
  ChangeTab(tabIndex: Tabs): void {
    // Actual tab change, or just title change (due to voter filters)
    const tabChanged = this.tabIndex !== tabIndex;

    this.tabIndex = tabIndex;
    var newRoute = '';

    switch (tabIndex) {
      case Tabs.slashTags:
        this.appData.defaultSort = PointSortTypes.TrendingActivity;
        newRoute = '/trending';
        break;

      case Tabs.questionList:
        // Select questions for tag
        newRoute = this.localData.SlashTagSelected;
        break;

      case Tabs.questionAnswers:
        newRoute = this.localData.SlashTagSelected;
        break;

      case Tabs.tagPoints:
        // Don't save previous
        // ActiveAliasForFilter update by the "By" Component (sibling),
        // AND child Tags and Points Components
        const alias = this.localData.ActiveAliasForFilter;
        if (!alias) {
          // Unfiltered TagPoints
          newRoute = this.localData.SlashTagSelected; // Tell the app component
        } else {
          newRoute = `${this.localData.SlashTagSelected}/by/${alias}`;
        }

        break;
    }

    this.RouteParameterChanged(tabChanged, newRoute);
  }

  // Tell the App Component that the route has changed
  RouteParameterChanged(hasChanged: boolean, newRoute: string): void {
    if (hasChanged) {
      newRoute = this.localData.TopicToSlashTag(newRoute);
      this.appData.RouteParamChange$.next(newRoute);
    }
  }

  QuestionSelected(questionID: number): void {
    this.specificQuestionIDSelected = questionID;
    this.questionAnswersComponent.initialSelection();
    this.ChangeTab(Tabs.questionAnswers);
  }

  ViewAllQuestions(): void {
    // From QuestionAnswers
    this.ChangeTab(Tabs.questionList);
  }

  ngOnDestroy(): void {
    this.pointsFilterRemove$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
