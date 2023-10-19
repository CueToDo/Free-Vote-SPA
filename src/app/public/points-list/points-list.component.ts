// Angular
import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Models, enums
import { ID } from 'src/app/models/common';
import { FilterCriteria } from 'src/app/models/filterCriteria.model';
import { Point, PointSelectionResult } from 'src/app/models/point.model';
import { PointSelectionTypes, PointSortTypes } from 'src/app/models/enums';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { PointsService } from 'src/app/services/points.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-points-list',
  templateUrl: './points-list.component.html',
  styleUrls: ['./points-list.component.css']
})
export class PointsListComponent implements OnDestroy, OnInit {
  @Input() public filter = new FilterCriteria();
  @Input() public attachedToQuestion = false;
  @Input() feedbackOn = true; // Passed to points in list
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

  public pointCount = 0;
  public IDs: ID[] = [];
  public points: Point[] = [];
  public possibleAnswers = false;
  public get pointComments(): boolean {
    return this.filter.pointSelectionType == PointSelectionTypes.Comments;
  }

  // Prompt to be first to create point for tag or answer to question
  public get firstResponse() {
    if (this.pointCount > 0 || this.pointComments) return '';

    if (this.attachedToQuestion)
      return 'Click "new answer" to create the first response to this question.';

    return 'Click "new point" to create the first point for this tag.';
  }

  public allPointsDisplayed = false;

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

  public nextPagePointsCount(): number {
    return this.IDs.filter(val => val.rowNumber > this.lastPageRow).slice(0, 10)
      .length;
  }

  constructor(
    public appData: AppDataService,
    public localData: LocalDataService,
    private pointsService: PointsService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const tag = params.get('tag');
      if (tag && tag != this.filter.slashTag) {
        this.localData.PreviousSlashTagSelected = tag;
      }
    });

    this.activatedRoute.fragment.subscribe(fragment => {
      this.fragment = '' + fragment;
    });
  }

  ngAfterViewInit(): void {
    this.ScrollIntoView();
  }

  ScrollIntoView(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        console.log('Scrolling into view', this.fragment);
        var a = document.querySelector('#id' + this.fragment);
        if (!!a) {
          // a.scrollIntoView(); // Causes collapse of titleBar on point save
        } else {
          console.log(a);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  // Reselect for new point - new point to be first in date descending order
  ReselectPoints(pointSortType: PointSortTypes) {
    this.filter.slashTag = this.localData.PreviousSlashTagSelected; // Set by the Point-Edit Component

    if (pointSortType !== PointSortTypes.NoChange) {
      if (pointSortType === PointSortTypes.DateDescend) {
        // Ensure new point at top
        this.filter.sortType = PointSortTypes.DateUpdated;
        this.filter.sortDescending = true;
      } else {
        this.filter.sortType = pointSortType;
      }
    }
    // We have a new point or tag
    this.filter.updateTopicViewCount = true; // ToDo S/B new tag only
    this.SelectPoints();
  }

  public CompleteEdit(pointID: string): void {
    this.fragment = pointID;
    this.ScrollIntoView();
  }

  OnTopicSearch(): string {
    let onTopic = '';
    if (!this.filter?.anyTag) {
      if (this.filter?.slashTag) {
        this.filter.slashTag = this.localData.PreviousSlashTagSelected;
        onTopic = this.localData.SlashTagToTopic(this.filter.slashTag);
      }
    }
    return onTopic;
  }

  // New point will be selected first in date descsend order
  public ReselectForNewPoint(): void {
    this.filter.updateTopicViewCount = false;
    this.filter.sortType = PointSortTypes.DateUpdated;
    this.filter.sortDescending = true;
    this.SelectPoints();
  }

  public SelectPoints(): void {
    this.possibleAnswers = false;

    if (!this.AlreadyFetchingPointsFromDB) {
      this.AlreadyFetchingPointsFromDB = true;
      this.AlreadyFetchingPointsFromDBChange.emit(true);
      this.pointCount = 0;
      this.points = [];
      this.error = '';

      switch (this.filter?.pointSelectionType) {
        case PointSelectionTypes.Filtered:
          let aliasFilter = this.filter.byAlias;
          let textFilter = this.filter.text;
          let pointTypeID = this.filter.pointTypeID;

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
              aliasFilter,
              this.OnTopicSearch(),
              this.filter.myPointFilter,
              this.filter.feedbackFilter,
              this.filter.pointFlag,
              textFilter,
              pointTypeID,
              dateFrom,
              dateTo,
              this.filter.sortType,
              this.filter.sortDescending
            )
            .subscribe({
              next: psr => this.DisplayPoints(psr),
              error: err => {
                this.error = err.error.detail;
                this.AlreadyFetchingPointsFromDB = false;
                this.AlreadyFetchingPointsFromDBChange.emit(false);
              }
            });
          break;

        case PointSelectionTypes.QuestionPoints:
          this.possibleAnswers = this.filter.sharesTagButNotAttached;

          if (this.filter.questionID) {
            this.pointsService
              .GetFirstBatchQuestionPoints(
                this.filter.constituencyID,
                this.filter.slashTag,
                this.filter.questionID,
                this.filter.myPointFilter,
                this.filter.sharesTagButNotAttached,
                this.filter.sortType,
                this.filter.sortDescending
              )
              .subscribe({
                next: psr => this.DisplayPoints(psr),
                error: err => {
                  console.log(err);
                  this.error = err.error.detail;
                  this.AlreadyFetchingPointsFromDB = false;
                  this.AlreadyFetchingPointsFromDBChange.emit(false);
                }
              });
          }
          break;

        case PointSelectionTypes.Comments:
          if (this.filter.pointID == 0) {
            this.error = 'No point selected to show comments';
            return;
          }

          this.pointsService
            .PointsSelectComments(
              this.filter.pointID,
              this.localData.ConstituencyIDVoter
            )
            .subscribe({
              next: psr => this.DisplayPoints(psr),
              error: err => {
                this.error = err.error.detail;
              },
              complete: () => {
                this.AlreadyFetchingPointsFromDB = false;
                this.AlreadyFetchingPointsFromDBChange.emit(false);
              }
            });
          break;

        default:
          // Infinite Scroll: Get points in batches

          if (this.filter) {
            this.filter.slashTag = this.localData.PreviousSlashTagSelected; // how does this relate to getting from route param?
            if (this.filter.slashTag) {
              this.pointsService
                .GetFirstBatchForTag(
                  this.filter.constituencyID,
                  this.filter.slashTag,
                  this.filter.sortType,
                  this.filter.sortDescending,
                  this.filter.updateTopicViewCount
                )
                .subscribe({
                  next: psr => this.DisplayPoints(psr),
                  error: err => {
                    this.error = err.error.detail;
                    this.AlreadyFetchingPointsFromDB = false;
                    this.AlreadyFetchingPointsFromDBChange.emit(false);
                  }
                });
            }
          }
          break;
      }
    }
  }

  public NewSortOrder() {
    // Sort Type hasn't changed - reversal only will be detected
    this.NewSortType(this.filter.sortType);
  }

  public NewSortType(pointSortType: PointSortTypes): void {
    if (this.pointCount > 1) {
      // Don't go to server to re-sort if only 1 point selected

      // ReversalOnly means we can allow the database to update rownumbers on previously selected points
      if (this.filter) {
        const reversalOnly = this.filter.sortType === pointSortType;

        // No need to check need to change
        this.filter.sortType = pointSortType;

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
          .subscribe(response => {
            this.AlreadyFetchingPointsFromDB = false;
            this.AlreadyFetchingPointsFromDBChange.emit(false);

            // pointCount is not updated for re-ordering
            this.IDs = response.pointIDs;
            this.points = response.points;
            this.NewPointsDisplayed();
          });
      }
    }
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
              this.filter.sortType,
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

  ngOnDestroy(): void {
    this.pointSelection$?.unsubscribe();
    this.pointSortType$?.unsubscribe();
  }
}
