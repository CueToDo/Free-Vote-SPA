
// Angular
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

// Models, enums
import { Question, QuestionEdit } from 'src/app/models/question.model';
import { PointSortTypes } from 'src/app/models/enums';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { QuestionsService } from 'src/app/services/questions.service';

@Component({
  selector: 'app-question-edit',
  templateUrl: './question-edit.component.html',
  styleUrls: ['./question-edit.component.css']
})
export class QuestionEditComponent implements OnInit {

  @Input() question = new Question();
  questionEdit: QuestionEdit;

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter();

  userTouched = false;
  saving = false;

  error = '';

  constructor(
    private appData: AppDataService,
    private questionService: QuestionsService
  ) { }

  ngOnInit(): void {
    if (!!this.question) {
      this.questionEdit = <QuestionEdit><any>this.appData.deep(this.question);
      // this.questionEdit.slashTag = this.localData.PreviousSlashTagSelected;
    }
    // If a new question, parent must initialise with NewQuestion
  }

  NewQuestion(slashTag: string) {
    // Clear old Values when edit complete
    this.questionEdit = new QuestionEdit();
    this.ClearQuestion();
    this.questionEdit.slashTag = slashTag;
    console.log('New Question;', slashTag);
  }

  ClearQuestion() {
    this.questionEdit.questionID = -1;
    this.questionEdit.question = '';
    this.questionEdit.draft = false;

    this.error = '';
    this.userTouched = false;
    // Leave slashtag
  }

  onQuestionBlur() {
    this.userTouched = true;
  }

  onSubmit() {

    const isNew = this.questionEdit.questionID < 1;

    this.questionService.QuestionUpdate(this.questionEdit).subscribe(
      {
        next: questionID => {
          this.question.questionID = questionID;
          this.question.question = this.questionEdit.question;
          this.question.draft = this.questionEdit.draft;
          // SlashTag can't be upated
        },
        error: serverError => {
          this.error = serverError.error.detail;
          console.log(serverError);
        },
        complete: () => {
          this.ClearQuestion();
          this.CompleteEdit.emit();

          // Communicate change to sibling PointsComponent
          // where Points ReSelection Takes place:
          if (isNew) {
            this.appData.SetSlashTag(this.questionEdit.slashTag, PointSortTypes.DateDescend);
          }
        }
      }
    );

  }

  Cancel() {
    this.ClearQuestion();
    // this.cancelled = true;
    this.CancelEdit.next();
  }
}
