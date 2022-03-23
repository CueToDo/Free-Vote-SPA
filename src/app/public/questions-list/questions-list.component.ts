// Angular
import { Component, EventEmitter, Input, Output } from '@angular/core';

// Models, enums
import { PointSortTypes } from 'src/app/models/enums';
import { ID } from 'src/app/models/common';
import {
  Question,
  QuestionSelectionResult
} from 'src/app/models/question.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { QuestionsService } from 'src/app/services/questions.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent {
  // Questions are filtered by SlashTag only
  @Input() SlashTag = '';

  // SortType and direction
  @Input() SortType = PointSortTypes.DateUpdated;
  @Input() SortAscending = false;

  @Output() QuestionCount = new EventEmitter<number>();
  @Output() QuestionSelected = new EventEmitter<number>();

  public questions: Question[] = [];
  public IDs: ID[] = [];
  public questionCount = 0;

  public error = '';
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

  public nextPageQuestionsCount(): number {
    return this.IDs.filter(val => val.rowNumber > this.lastPageRow).slice(0, 10)
      .length;
  }

  constructor(
    private questionsService: QuestionsService,
    public appData: AppDataService,
    public localData: LocalDataService
  ) {}

  SelectQuestions(updateTopicViewCount: boolean): void {
    if (!this.alreadyFetchingFromDB) {
      this.alreadyFetchingFromDB = true;
      this.questionCount = 0;
      this.questions = [];
      this.error = '';

      this.SlashTag = this.localData.PreviousSlashTagSelected;

      // Infinite Scroll: Get questions in batches
      this.questionsService
        .GetFirstBatchForTag(
          this.SlashTag,
          this.SortType,
          this.SortAscending,
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

  newSortType(pointSortType: PointSortTypes): void {
    if (this.questionCount > 1) {
      // Don't go to server to re-sort if only 1 point selected

      // ReversalOnly means we can allow the database to update rownumbers on previously selected points
      const reversalOnly = this.SortType === pointSortType;
      this.SortType = pointSortType;
      this.alreadyFetchingFromDB = true;

      this.questionsService
        .NewQuestionSelectionOrder(pointSortType, reversalOnly)
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

  DisplayQuestions(qsr: QuestionSelectionResult): void {
    this.alreadyFetchingFromDB = false;
    this.QuestionCount.emit(qsr.questionCount);

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
          .GetNextBatch(this.SortType, this.lastBatchRow + 1)
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

  ReselectForNewQuestion() {
    this.SelectQuestions(false);
  }

  NewQuestionsDisplayed(): void {
    this.alreadyFetchingFromDB = false;
    this.allQuestionsDisplayed = this.questions.length >= this.questionCount;
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
