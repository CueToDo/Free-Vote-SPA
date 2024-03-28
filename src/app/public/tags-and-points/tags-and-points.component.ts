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
import { AppService } from 'src/app/services/app.service';
import { LocalDataService } from 'src/app/services/local-data.service';

// Components
import { PointEditComponent } from 'src/app/public//point-edit/point-edit.component';
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
  routeChange$: Subscription | undefined;
  width$: Subscription | undefined; // Viewport width monitoring

  // responsive variables
  tagCloudTab = '/trending';
  widthBand = 4;
  isLargeMobile = false;

  get slashTagsButtonText(): string {
    if (this.isLargeMobile) return 'tags';
    return 'slash-tags';
  }

  // Public variables for use in template
  public Tabs = Tabs;
  public tabIndex = Tabs.notSelected;

  forConstituency = false;

  defaultPointSort = PointSortTypes.TrendingActivity;

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

  // following tag routes can be followed by constituency route parameter
  // which may be toggled on/off by local button
  tagRoutes = new Array('slash-tags', 'trending', 'recent', 'tag-search');

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
    private appService: AppService,
    public auth0Service: AuthService,
    public localData: LocalDataService,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Initialise only - subscriptions follow
    this.appService.TagsPointsActive$.next(true);

    // ==========   Subscriptions   ==========

    this.routeChange$ = this.appService.RouteParamChange$.subscribe(route => {
      if (route.includes('/trending')) this.tagCloudTab = '/trending';
      else if (route.includes('/recent')) this.tagCloudTab = '/recent';
      else if (route.includes('/tag-search')) this.tagCloudTab = '/tag-search';
    });

    // appComponent monitors width and broadcasts via appServiceService
    this.width$ = this.appService.DisplayWidth$.subscribe(
      (widthBand: number) => {
        this.widthBand = widthBand;
      }
    );

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
            this.ChangeRouteDisplay(Tabs.questionAnswers);
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
    let initialRoute = this.activatedRoute.snapshot.url[0].path;
    const routeparts = initialRoute.split('/');
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
          this.defaultPointSort = PointSortTypes.TrendingActivity; // POINT sort
          break;
        case 'tag-search':
          this.tabIndex = Tabs.slashTags;
          this.defaultPointSort = PointSortTypes.TrendingActivity;
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
      this.defaultPointSort = PointSortTypes.TrendingActivity;
    }
  }

  ChangeForConstituency(): void {
    // Change forConstituency filter
    this.localData.forConstituency = !this.localData.forConstituency;

    this.ChangeRouteDisplay(this.tabIndex);
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
    this.ChangeRouteDisplay(Tabs.tagPoints); // will select points and call RouteParameterChanged
  }

  // 1. Tags
  ShowTags() {
    this.ChangeRouteDisplay(Tabs.slashTags);
  }

  // 2. Questions
  ShowQuestions(): void {
    console.log('ShowQuestions');
    this.ChangeRouteDisplay(Tabs.questionList);
  }

  ReselectQuestions() {
    this.ChangeRouteDisplay(Tabs.questionList);
    this.questionsListComponent.SelectQuestions(false);
  }

  // 3. Points
  ShowPoints(): void {
    console.log('ShowPoints');
    this.ChangeRouteDisplay(Tabs.tagPoints);
  }

  /// Change Tab and notify app component in TabChangeComplete
  ChangeRouteDisplay(tabIndex: Tabs): void {
    // Actual tab change, or just title change (due to voter filters)

    const tabChanged = this.tabIndex !== tabIndex;
    const constituencyChanged =
      this.forConstituency !== this.localData.forConstituency;

    const routeChanged = tabChanged || constituencyChanged;

    this.tabIndex = tabIndex;
    this.forConstituency = this.localData.forConstituency;

    if (routeChanged) {
      const constituency = this.localData.ConstituencyKebabSlash;
      const slashTagSelected = this.localData.SlashTagSelected;
      var newRoute = '';

      switch (tabIndex) {
        case Tabs.slashTags:
          this.defaultPointSort = PointSortTypes.TrendingActivity;
          newRoute = `${this.tagCloudTab}${constituency}`;
          break;

        case Tabs.questionList:
          // Select questions for tag - use querystring parameter
          newRoute = `${constituency}${slashTagSelected}/questions`;
          break;

        case Tabs.questionAnswers:
          // ToDo
          newRoute = slashTagSelected + constituency;
          break;

        case Tabs.tagPoints:
          // Don't save previous
          // ActiveAliasForFilter update by the "By" Component (sibling),
          // AND child Tags and Points Components
          const alias = this.localData.ActiveAliasForFilter;
          if (!alias) {
            // Unfiltered TagPoints
            newRoute = constituency + slashTagSelected;
          } else {
            newRoute = `${slashTagSelected}/by/${alias}`;
          }

          break;
      }

      // Tell the App Component that the route has changed
      this.appService.RouteParamChange$.next(newRoute);
    }
  }

  QuestionSelected(questionID: number): void {
    this.specificQuestionIDSelected = questionID;
    this.questionAnswersComponent.initialSelection();
    this.ChangeRouteDisplay(Tabs.questionAnswers);
  }

  ViewAllQuestions(): void {
    // From QuestionAnswers
    this.ChangeRouteDisplay(Tabs.questionList);
  }

  ngOnDestroy(): void {
    this.routeChange$?.unsubscribe();
    this.width$?.unsubscribe();
  }
}
