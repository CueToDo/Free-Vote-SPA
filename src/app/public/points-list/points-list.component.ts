// Angular
import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Models, enums
import { ID } from 'src/app/models/common';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';
import { Point, PointSelectionResult } from 'src/app/models/point.model';
import {
  PointSelectionTypes,
  PointSortTypes,
  PointTypesEnum
} from 'src/app/models/enums';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { PointsService } from 'src/app/services/points.service';
import { Subscription } from 'rxjs';
import { TagsService } from 'src/app/services/tags.service';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-points-list',
  templateUrl: './points-list.component.html',
  styleUrls: ['./points-list.component.css']
})
export class PointsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() HasFocus = false;

  @Input() PointSelectionType = PointSelectionTypes.TagPoints;
  @Input() single = false;
  @Input() ParentPointID = 0;
  @Input() ParentQuestionID = 0;

  @Input() sharesTagButNotAttached = false;
  @Input() public attachedToQuestion = false;
  @Input() AlreadyFetchingPointsFromDB = false;

  @Output() AddPointToAnswers = new EventEmitter();
  @Output() RemovePointFromAnswers = new EventEmitter();
  @Output() PointCount = new EventEmitter<number>();
  @Output() AltSlashTagSelected = new EventEmitter<string>();
  @Output() AlreadyFetchingPointsFromDBChange = new EventEmitter<boolean>();
  @Output() SelectComment = new EventEmitter<number>();

  // Subscriptions
  private pointSelection$: Subscription | undefined;
  private pointSortType$: Subscription | undefined;
  private tagLatestActivity$: Subscription | undefined;

  updateTopicViewCount = false;

  forConstituency = false;
  wasForConstituency = false;

  public pointCount = 0;
  public IDs: ID[] = [];
  public points: Point[] = [];

  get noTopic(): boolean {
    return (
      !this.localData.TopicSelected || this.localData.TopicSelected === 'null'
    );
  }

  public possibleAnswers = false;

  public get pointComments(): boolean {
    return this.PointSelectionType == PointSelectionTypes.Comments;
  }

  // Prompt to be first to create point for tag or answer to question
  public get firstResponse() {
    if (this.pointCount > 0 || this.pointComments) return '';

    if (this.attachedToQuestion)
      return 'Click "new answer" to create the first response to this question.';

    return 'Click "new point" to create the first point for this tag.';
  }

  // Sort
  public PointSortTypes = PointSortTypes;
  sortType = PointSortTypes.TrendingActivity;
  sortDescending = true;

  // Filter
  filter = new FilterCriteria();
  showFilters = false;
  applyingFilter = false; // prevent cascading burgerMenuTrigger

  // View
  feedbackOn = true; // ToDo - managed internally Passed to points in list

  get feedbackIcon(): string {
    if (this.feedbackOn) return 'speaker_notes_off';
    return 'view_list';
  }
  get feedbackText(): string {
    if (this.feedbackOn) return 'turn feedback OFF';
    return 'turn feedback ON';
  }

  public allPointsDisplayed = false;
  viewAll = false;

  private fragment = '';

  public error = '';

  private get lastBatchRow(): number {
    let lastRow = 0;
    if (this.IDs && this.IDs.length > 0) {
      lastRow = this.IDs[this.IDs.length - 1].rowNumber;
    }
    return lastRow;
  }

  private get lastPageRow(): number {
    let lastRow = 0;
    if (this.points && this.points.length > 0) {
      lastRow = this.points[this.points.length - 1].rowNumber;
    }
    if (this.points.length > lastRow) {
      lastRow = this.points.length;
    } // Defensive if point count from database is wrong
    return lastRow;
  }

  public get pointOrAnswer(): string {
    // ToDo
    if (this.ParentQuestionID > 0) return 'answer';

    return 'point';
  }

  public get nextPagePointsCount(): number {
    return this.IDs.filter(val => val.rowNumber > this.lastPageRow).slice(0, 10)
      .length;
  }

  constructor(
    public auth0Service: AuthService,
    public appData: AppDataService,
    public localData: LocalDataService,
    private pointsService: PointsService,
    private tagsService: TagsService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    // EXTERNAL ROUTECHANGE (not tab change): Need to subscribe to route change to get route params
    // https://angular-2-training-book.rangle.io/handout/routing/routeparams.html

    // No tag selected? Go to API to get latest

    if (this.noTopic) {
      this.tagLatestActivity$ = this.tagsService
        .TagLatestActivity(this.filter.constituencyID)
        .subscribe({
          next: slashTag => {
            this.localData.SlashTagSelected = slashTag;
          },
          error: error =>
            console.log('Server Error on getting last slash tag', error)
        });
    }

    this.activatedRoute.paramMap.subscribe(params => {
      const slashTag = `/${params.get('tag')}`;
      if (!!slashTag) {
        this.localData.SlashTagSelected = slashTag;
      }
    });

    this.activatedRoute.url.subscribe(url => {
      if (url.length == 2 && url[0].path == 'points') this.viewAll = true;
    });

    // For ScrollIntoView
    this.activatedRoute.fragment.subscribe(fragment => {
      this.fragment = '' + fragment;
    });

    if (
      !this.localData.initialPointsSelected &&
      !(this.PointSelectionType === PointSelectionTypes.Comments)
    ) {
      // External Share: Use tag in url
      this.PointSelectionType = PointSelectionTypes.TagPoints;
      this.localData.initialPointsSelected = true;
      this.SelectPoints();
    }
  }

  ngAfterViewInit(): void {
    this.ScrollIntoView();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.AlreadyFetchingPointsFromDB) return;

    const newFocus = changes['HasFocus']?.currentValue;
    if (!this.HasFocus && !newFocus) return; // Do nothing if we don't have and not acquiring focus

    const newForConstituency = changes['forConstituency']?.currentValue;

    // If new focus on this component and we haven't fetched points
    // or change to local constituency, then fetch points
    if (
      (newFocus && (!this.points || this.points.length == 0)) ||
      newForConstituency != null ||
      this.wasForConstituency != this.forConstituency
    ) {
      this.SelectPoints();
    }
  }

  ScrollIntoView(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        console.log('Scrolling into view', this.fragment);
        var a = document.querySelector('#id' + this.fragment);
        if (!!a) {
          a.scrollIntoView(); // Causes collapse of titleBar on point save
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  public CompleteEdit(pointID: string): void {
    this.fragment = pointID;
    if (this.localData.TagChange) {
      this.sortType = PointSortTypes.DateUpdated;
      this.sortDescending = true;
      this.SelectPoints();
      this.appData.RouteParamChange$.next(this.localData.SlashTagSelected);
    } else this.ScrollIntoView();
  }

  OnTopicSearch(): string {
    let onTopic = '';
    if (!this.filter?.anyTag) {
      onTopic = this.localData.TopicSelected;
    }
    return onTopic;
  }

  PointSearch() {
    alert('ToDo');
  }

  // New point will be selected first in date descsend order
  public ReselectForNewPoint(): void {
    this.sortType = PointSortTypes.DateUpdated;
    this.sortDescending = true;
    this.SelectPoints();
  }

  public SelectPoints(): void {
    this.possibleAnswers = false;

    if (!this.AlreadyFetchingPointsFromDB) {
      if (this.viewAll) this.PointSelectionType = PointSelectionTypes.TagPoints;

      if (this.sortType === PointSortTypes.DateDescend) {
        // Ensure new point at top
        this.sortType = PointSortTypes.DateUpdated;
        this.sortDescending = true;
      }

      this.viewAll = false;

      this.AlreadyFetchingPointsFromDB = true;
      this.AlreadyFetchingPointsFromDBChange.emit(true);
      this.pointCount = 0;
      this.points = [];
      this.error = '';

      switch (this.PointSelectionType) {
        case PointSelectionTypes.Filtered:
          let dateFrom = new Date('1 Jan 2000');
          let dateTo = new Date();

          // Switch dates if dateFrom > dateTo
          if (this.filter.applyDateFilter) {
            dateFrom = this.filter.dateFrom;
            dateTo = this.filter.dateTo;
            if (
              this.appData.Date1IsLessThanDate2(
                dateTo.toString(),
                dateFrom.toString()
              )
            ) {
              const dateSwitch = dateFrom;
              dateFrom = dateTo;
              dateTo = dateSwitch;
              this.filter.dateFrom = dateFrom;
              this.filter.dateTo = dateTo;
            }
          }

          this.pointsService
            .GetFirstBatchFiltered(
              this.filter.constituencyID,
              this.filter.byAlias,
              this.OnTopicSearch(),
              this.filter.myPointFilter,
              this.filter.feedbackFilter,
              this.filter.pointFlag,
              this.filter.text,
              PointTypesEnum.NotSelected,
              dateFrom,
              dateTo,
              this.sortType,
              this.sortDescending
            )
            .subscribe({
              next: psr => this.DisplayPoints(psr),
              error: err => (this.error = err.error.detail),
              complete: () => {
                this.SelectComplete();
              }
            });
          break;

        case PointSelectionTypes.QuestionPoints:
          this.possibleAnswers = this.sharesTagButNotAttached;

          if (this.ParentQuestionID) {
            this.pointsService
              .GetFirstBatchQuestionPoints(
                this.filter.constituencyID,
                this.localData.SlashTagSelected,
                this.ParentQuestionID,
                this.filter.myPointFilter,
                this.sharesTagButNotAttached,
                this.sortType,
                this.sortDescending
              )
              .subscribe({
                next: psr => this.DisplayPoints(psr),
                error: err => (this.error = err.error.detail),
                complete: () => {
                  this.SelectComplete();
                }
              });
          }
          break;

        case PointSelectionTypes.Comments:
          if (this.ParentPointID == 0) {
            this.error = 'No point selected to show comments';
            return;
          }

          this.pointsService
            .PointsSelectComments(
              this.ParentPointID,
              this.localData.ConstituencyIDVoter
            )
            .subscribe({
              next: psr => this.DisplayPoints(psr),
              error: err => (this.error = err.error.detail),
              complete: () => {
                this.SelectComplete();
              }
            });
          break;

        default:
          // Infinite Scroll: Get points in batches
          if (this.filter) {
            if (this.localData.SlashTagSelected) {
              this.pointsService
                .GetFirstBatchForTag(
                  this.filter.constituencyID,
                  this.localData.SlashTagSelected,
                  this.sortType,
                  this.sortDescending,
                  this.updateTopicViewCount
                )
                .subscribe({
                  next: psr => this.DisplayPoints(psr),
                  error: err => (this.error = err.error.detail),
                  complete: () => {
                    this.SelectComplete();
                  }
                });
            }
          }
          break;
      }
    }
  }

  public SelectComplete() {
    this.AlreadyFetchingPointsFromDB = false;
    this.AlreadyFetchingPointsFromDBChange.emit(false);
    if (!!this.fragment) this.ScrollIntoView();
    this.fragment = '';
  }

  public NewSortOrder() {
    // Sort Type hasn't changed - reversal only will be detected
    this.NewSortType(this.sortType);
  }

  public NewSortType(pointSortType: PointSortTypes): void {
    if (this.pointCount > 1) {
      // Don't go to server to re-sort if only 1 point selected

      // ReversalOnly means we can allow the database to update rownumbers on previously selected points
      if (this.filter) {
        const reversalOnly = this.sortType === pointSortType;

        // No need to check need to change
        this.sortType = pointSortType;

        this.AlreadyFetchingPointsFromDB = true;
        this.AlreadyFetchingPointsFromDBChange.emit(true);

        this.pointsService
          // pass pointCount for the cast to PSR
          .NewPointSelectionOrder(
            this.filter.constituencyID,
            pointSortType,
            reversalOnly,
            this.pointCount
          )
          .subscribe({
            next: response => {
              this.AlreadyFetchingPointsFromDB = false;
              this.AlreadyFetchingPointsFromDBChange.emit(false);

              // pointCount is not updated for re-ordering
              this.IDs = response.pointIDs;
              this.points = response.points;
              this.NewPointsDisplayed();
            },
            error: err => {
              this.error = err.error.detail;
            }
          });
      }
    }
  }

  // From child Points Component
  pointSortTypeChanged(pointSortType: PointSortTypes): void {
    // this.externalTrigger = true;
    this.sortType = pointSortType; // Pass update to sort menu
    // this.externalTrigger = false;
  }

  SetSortDescending(descending: boolean): void {
    this.sortDescending = descending;

    // Can't reverse random, so default to TrendingActivity
    if (this.sortType === PointSortTypes.Random) {
      this.sortType = PointSortTypes.TrendingActivity;
    }

    // if (!this.externalTrigger) {
    this.NewSortOrder();
    // }
  }

  // If sort type is random, order (ascending/descending) is irrelevant
  SetSortType(pointSortType: PointSortTypes): void {
    if (
      this.sortType !== pointSortType ||
      pointSortType === PointSortTypes.Random // new random order
    ) {
      // New sort order or user clicked random again

      // Communicate to PointsComponent - is a child could/should use Input?
      // if (!this.externalTrigger) {
      this.NewSortType(pointSortType); // New random order or sort type
      // }

      // this.tabIndex = Tabs.tagPoints;
      // this.ChangeTab(this.tabIndex);

      this.sortType = pointSortType;
    }
  }

  refresh(): void {
    // this.externalTrigger = true; // prevent further communication to points component
    this.NewSortOrder(); // This communicates to points component
    // this.externalTrigger = false;
  }

  DisplayPoints(psr: PointSelectionResult): void {
    this.AlreadyFetchingPointsFromDB = false;
    this.AlreadyFetchingPointsFromDBChange.emit(false);

    this.PointCount.emit(psr.pointCount);

    if (psr.pointCount > 0) {
      // If we don't have dateFrom and fromDate is returned, OR
      // returned date is LESS than original, use returned date

      if (this.filter) {
        if (
          (!this.filter.dateFrom && psr.fromDate) ||
          this.appData.Date1IsLessThanDate2(
            psr.fromDate,
            this.filter.dateFrom.toString()
          )
        ) {
          this.filter.dateFrom = new Date(psr.fromDate);
        }

        // If we don't have dateTo and toDate is returned, OR
        // returned date is GREATER than original, use returned date
        if (
          (!this.filter.dateTo && psr.toDate) ||
          this.appData.Date1IsLessThanDate2(
            this.filter.dateTo.toString(),
            psr.toDate
          )
        ) {
          this.filter.dateTo = new Date(psr.toDate);
        }
      }
    }

    // Batch
    this.pointCount = psr.pointCount;
    this.IDs = psr.pointIDs;
    this.points = psr.points;

    this.NewPointsDisplayed();
  }

  NewPointCreated(): void {
    // Ensure new point at top
    this.sortDescending = true;
    this.ReselectPoints(PointSortTypes.DateUpdated);
  }

  // Reselect for new point - new point to be first in date descending order
  ReselectPoints(pointSortType: PointSortTypes) {
    if (pointSortType !== PointSortTypes.NoChange)
      this.sortType = pointSortType;

    // We have a new point or tag
    this.updateTopicViewCount = true; // ToDo S/B new tag only
    this.SelectPoints();
  }

  // init, subscription, ChangeTab, applyFilter
  ShowPointFilterCriteria(show: boolean): void {
    this.PointSelectionType = PointSelectionTypes.Filtered;

    if (!show) this.PointSelectionType = PointSelectionTypes.TagPoints;

    if (show != this.showFilters) {
      this.ReselectPoints(PointSortTypes.NoChange);
    }
    this.showFilters = show;
  }

  // https://stackblitz.com/edit/free-vote-infinite-scroll
  fetchMorePoints(): void {
    if (!this.AlreadyFetchingPointsFromDB) {
      // ToDo infinite scroll for MyPoints this.SelectedPoints();

      // https://stackoverflow.com/questions/38824349/how-to-convert-an-object-to-an-array-of-key-value-pairs-in-javascript
      // Construct array of next 10 points ids to be selected
      const pids: ID[] = this.IDs.filter(
        val => val.rowNumber > this.lastPageRow
      ).slice(0, 10); // excludes end index;

      // Pass back next 10 PointIDs to be fetched for display
      // already filtered above - this is what we need to fetch now
      if (pids && pids.length > 0) {
        // Get new PAGE of points
        this.AlreadyFetchingPointsFromDB = true;
        this.AlreadyFetchingPointsFromDBChange.emit(true);
        this.allPointsDisplayed = false;

        this.pointsService
          .GetPage(this.localData.ConstituencyID, pids)
          .subscribe(response => {
            this.points = this.points.concat(response.points);
            this.NewPointsDisplayed();
          });
      } else if (
        this.lastBatchRow < this.pointCount &&
        this.lastPageRow < this.pointCount
      ) {
        // More defensive coding if DB gives incorrect page count

        // Get another BATCH of points

        this.AlreadyFetchingPointsFromDB = true;
        this.AlreadyFetchingPointsFromDBChange.emit(true);
        this.allPointsDisplayed = false;

        if (this.filter) {
          this.pointsService
            .GetNextBatch(
              this.localData.ConstituencyID,
              this.sortType,
              this.lastBatchRow + 1,
              this.pointCount
            )
            .subscribe(response => {
              // New Batch
              this.IDs = response.pointIDs;
              this.points = this.points.concat(response.points);
              this.NewPointsDisplayed();
            });
        }
      }
    }
  }

  NewPointsDisplayed(): void {
    this.AlreadyFetchingPointsFromDB = false;
    this.AlreadyFetchingPointsFromDBChange.emit(false);
    this.allPointsDisplayed = this.points.length >= this.pointCount;
  }

  onPointDeleted(id: number): void {
    // this.SelectPoints(); No need to reselect.
    // Already deleted from server, now remove from the array
    // https://love2dev.com/blog/javascript-remove-from-array/

    // Update the row number displayed before removing from array
    // get deleted point (array)
    const deleted = this.points.filter(p => p.pointID === id);

    if (!!deleted && deleted.length > 0) {
      // Get deleted question row number
      const pointRowNo = deleted[0].rowNumber;

      // decrement rownumber for all questions above that
      for (var i = 0, len = this.points.length; i < len; i++) {
        if (this.points[i].rowNumber > pointRowNo) this.points[i].rowNumber--;
      }

      for (var i = 0, len = this.IDs.length; i < len; i++) {
        if (this.IDs[i].rowNumber > pointRowNo) this.IDs[i].rowNumber--;
      }
    }

    // Filter out the deleted point
    this.points = this.points.filter(value => value.pointID !== id);

    // Remove id from IDs before getting next batch
    this.IDs = this.IDs.filter(value => value.id != id);

    this.pointCount--; // decrement before calling NewPointsDisplayed which updates allPointsDisplayed

    this.NewPointsDisplayed();
    this.RemovePointFromAnswers.emit(id);
  }

  AddToAnswers(pointID: number): void {
    this.AddPointToAnswers.emit(pointID);
  }

  RemoveFromAnswers(pointID: number): void {
    this.RemovePointFromAnswers.emit(pointID);
  }

  setSlashTag(slashTag: string) {
    this.AltSlashTagSelected.emit(slashTag);
  }

  // From child PointsFilter Component
  // It's not banana in a box, but filter gets updated
  applyFilter(): void {
    this.applyingFilter = true;
    this.SelectPoints();
    this.applyingFilter = false;
  }

  cancelSearch(): void {
    this.showFilters = false;
    this.SelectPoints();
  }

  // 4. Feedback switch
  toggleFeedback() {
    this.feedbackOn = !this.feedbackOn;
  }

  ngOnDestroy(): void {
    this.pointSelection$?.unsubscribe();
    this.pointSortType$?.unsubscribe();
    this.tagLatestActivity$?.unsubscribe();
  }
}
