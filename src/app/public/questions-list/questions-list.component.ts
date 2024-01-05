// Angular
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// Material
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Models, enums
import { PointSortTypes } from 'src/app/models/enums';
import { ID } from 'src/app/models/common';
import {
  Question,
  QuestionSelectionResult
} from 'src/app/models/question.model';

// Components
import { QuestionCreateNewComponent } from '../question-create-new/question-create-new.component';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { QuestionsService } from 'src/app/services/questions.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent implements OnInit, OnChanges {
  @Input() HasFocus = false;
  @Input() ForConstituency = false;

  // Questions are filtered by Constituency and SlashTag only

  // SortType and direction
  sortType = PointSortTypes.DateUpdated;
  sortDescending = false;

  @Output() QuestionSelected = new EventEmitter<number>();

  public questions: Question[] = [];
  public IDs: ID[] = [];
  public questionCount = 0;

  wasForConstituency = false;
  forSlashTag = '';

  public alreadyFetchingFromDB = false;
  public allQuestionsDisplayed = false;

  private get lastBatchRow(): number {
    let lastRow = 0;
    if (this.IDs && this.IDs.length > 0) {
      lastRow = this.IDs[this.IDs.length - 1].rowNumber;
    }
    return lastRow;
  }

  private get lastPageRow(): number {
    let lastRow = 0;

    if (this.questions && this.questions.length > 0) {
      lastRow = this.questions[this.questions.length - 1].rowNumber;
    }

    if (this.questions.length > lastRow) {
      lastRow = this.questions.length;
    } // Defensive if point count from databsae is wrong

    return lastRow;
  }

  isMobile = false;
  public error = '';

  constructor(
    public auth0Service: AuthService,
    private questionsService: QuestionsService,
    public appData: AppDataService,
    public localData: LocalDataService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // https://alligator.io/angular/breakpoints-angular-cdk/
    // 520px for buttons on same line
    this.breakpointObserver
      .observe(['(max-width: 520px)'])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newFocus = changes['HasFocus']?.currentValue;
    if (!this.HasFocus && !newFocus) return; // Do nothing if we don't have and not acquiring focus

    // If new focus on this component and we haven't fetched points
    // or change to local constituency, then fetch points
    if (
      (newFocus && (!this.questions || this.questions.length == 0)) ||
      this.wasForConstituency != this.ForConstituency ||
      this.forSlashTag != this.localData.SlashTagSelected
    ) {
      this.SelectQuestions(false);
    }
  }

  SelectQuestions(updateTopicViewCount: boolean): void {
    if (!this.alreadyFetchingFromDB) {
      this.alreadyFetchingFromDB = true;
      this.questionCount = 0;
      this.questions = [];
      this.error = '';

      // Infinite Scroll: Get questions in batches
      this.questionsService
        .GetFirstBatchForTag(
          this.localData.ConstituencyID,
          this.localData.SlashTagSelected,
          this.sortType,
          this.sortDescending,
          updateTopicViewCount
        )
        .subscribe({
          next: psr => this.DisplayQuestions(psr),
          error: err => {
            this.error = err.error.detail;
            this.alreadyFetchingFromDB = false;
          }
        });
    }
  }

  SetSortType(pointSortType: PointSortTypes): void {
    alert('ToDo');
    if (this.questionCount > 1) {
      // Don't go to server to re-sort if only 1 point selected

      // ReversalOnly means we can allow the database to update rownumbers on previously selected points
      const reversalOnly = this.sortType === pointSortType;
      this.sortType = pointSortType;
      this.alreadyFetchingFromDB = true;

      this.questionsService
        .NewQuestionSelectionOrder(
          this.localData.ConstituencyID,
          pointSortType,
          reversalOnly
        )
        .subscribe({
          next: response => {
            this.alreadyFetchingFromDB = false;

            // pointCount is not updated for re-ordering
            this.IDs = response.questionIDs;
            this.questions = response.questions;
            this.NewQuestionsDisplayed();
          },
          error: serverError => {
            this.error = serverError.error.detail;
            this.alreadyFetchingFromDB = false;
          }
        });
    }
  }

  SetSortDescending(descending: boolean): void {
    alert('ToDo');
    this.sortDescending = descending;

    // Can't reverse random, so default to TrendingActivity
    if (this.sortType === PointSortTypes.Random) {
      this.sortType = PointSortTypes.TrendingActivity;
    }
    this.SetSortType(this.sortType);
  }

  DisplayQuestions(qsr: QuestionSelectionResult): void {
    this.alreadyFetchingFromDB = false;
    this.forSlashTag = this.localData.SlashTagSelected;

    // Batch
    this.questionCount = qsr.questionCount;
    this.IDs = qsr.questionIDs;
    this.questions = qsr.questions;

    this.NewQuestionsDisplayed();
  }

  // https://stackblitz.com/edit/free-vote-infinite-scroll
  fetchMoreQuestions(): void {
    if (!this.alreadyFetchingFromDB) {
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
        this.alreadyFetchingFromDB = true;
        this.allQuestionsDisplayed = false;

        this.questionsService.GetPage(pids).subscribe({
          next: response => {
            this.questions = this.questions.concat(response.questions);
            this.NewQuestionsDisplayed();
          },
          error: serverError => {
            this.error = serverError.error.detail;
            this.alreadyFetchingFromDB = false;
          }
        });
      } else if (
        this.lastBatchRow < this.questionCount &&
        this.lastPageRow < this.questionCount
      ) {
        // More defensive coding if DB gives incorrect page count

        // Get another BATCH of points

        this.alreadyFetchingFromDB = true;
        this.allQuestionsDisplayed = false;

        this.questionsService
          .GetNextBatch(
            this.localData.ConstituencyID,
            this.sortType,
            this.lastBatchRow + 1
          )
          .subscribe({
            next: response => {
              // New Batch
              this.IDs = response.questionIDs;
              this.questions = this.questions.concat(response.questions);
              this.NewQuestionsDisplayed();
            },
            error: serverError => {
              this.error = serverError.error.detail;
              this.alreadyFetchingFromDB = false;
              this.allQuestionsDisplayed = true;
            }
          });
        // }
      }
    }
  }

  QuestionSearch(): void {
    alert('ToDo');
  }

  NewQuestion(): void {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      tag: this.localData.SlashTagSelected
    };
    if (this.isMobile) {
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
    }

    const dialogRef = this.dialog.open(
      QuestionCreateNewComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe({
      next: (saved: boolean) => {
        if (!!saved) {
          this.sortDescending = true;
          this.ReselectForSameSlashTag();
        }
      }
    });
  }

  ReselectForSameSlashTag() {
    this.SelectQuestions(false);
  }

  NewQuestionsDisplayed(): void {
    this.alreadyFetchingFromDB = false;
    this.allQuestionsDisplayed = this.questions.length >= this.questionCount;
    this.wasForConstituency = this.ForConstituency;
  }

  onQuestionDeleted(id: number): void {
    // this.SelectPoints(); No need to reselect.
    // Already deleted from server, now remove from the array
    // https://love2dev.com/blog/javascript-remove-from-array/

    // get deleted question (array)
    const deleted = this.questions.filter(q => q.questionID === id);

    if (!!deleted && deleted.length > 0) {
      // Get deleted question row number
      const questionRowNo = deleted[0].rowNumber;

      // decrement rownumber in questions for all questions above that
      for (var i = 0, len = this.questions.length; i < len; i++) {
        if (this.questions[i].rowNumber > questionRowNo)
          this.questions[i].rowNumber--;
      }

      // decrement rownumber in IDs for all questions above that
      for (var i = 0, len = this.IDs.length; i < len; i++) {
        if (this.IDs[i].rowNumber > questionRowNo) this.IDs[i].rowNumber--;
      }
    }

    // Filter out the deleted question
    this.questions = this.questions.filter(value => value.questionID !== id);

    // Remove id from IDs before getting next batch
    this.IDs = this.IDs.filter(value => value.id != id);

    // Decrement count before calling NewPointsDisplayed which updates allPointsDisplayed
    this.questionCount--;
    this.NewQuestionsDisplayed();
  }

  questionSelected(questionID: number): void {
    this.QuestionSelected.emit(questionID);
  }

  public AnswerAdded(questionID: number) {
    this.addRemoveAnswer(questionID, true);
  }

  public AnswerRemoved(questionID: number) {
    this.addRemoveAnswer(questionID, false);
  }

  addRemoveAnswer(questionID: number, add: boolean) {
    const selectedQuestion = this.questions.filter(
      q => q.questionID == questionID
    ) as Question[];
    if (!!selectedQuestion && selectedQuestion.length == 1) {
      if (add) selectedQuestion[0].points++;
      else {
        selectedQuestion[0].points--;
        if (selectedQuestion[0].points < 0) selectedQuestion[0].points = 0;
      }
    }
  }
}
