// Angular
import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter
} from '@angular/core';

// rxjs
import { Subscription } from 'rxjs';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

// Models, Enums
import { FilterCriteria } from 'src/app/models/filterCriteria.model';
import {
  MyPointFilter,
  PointSelectionTypes,
  PointSortTypes
} from 'src/app/models/enums';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { QuestionsService } from 'src/app/services/questions.service';

// Components
import { PointsListComponent } from '../points-list/points-list.component';

@Component({
  selector: 'app-question-answers',
  templateUrl: './question-answers.component.html',
  styleUrls: ['./question-answers.component.css']
})
export class QuestionAnswersComponent {
  @Input() QuestionID = 0;

  @Output() ViewAllQuestions = new EventEmitter<boolean>();
  @Output() AnswerAdded = new EventEmitter<number>();
  @Output() AnswerRemoved = new EventEmitter<number>();

  @ViewChild('PointsList') pointsList!: PointsListComponent;

  public PointSelectionTypes = PointSelectionTypes;

  private questionPointAddRemove$: Subscription | undefined;

  public mode = 'answers'; // myPoints, newAnswer
  private savedMode = '';

  public sharesTagButNotAttached = false;
  public attachedToQuestion = false;

  public error = '';

  constructor(
    public auth0Service: AuthService,
    public localData: LocalDataService,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {}

  Back(): void {
    this.ViewAllQuestions.emit(true);
  }

  public get QuestionSelected(): string {
    return this.localData.questionSelected;
  }

  public get QuestionDetails(): string {
    return this.localData.questionDetails;
  }

  public initialSelection() {
    this.viewAllAnswers();
  }

  public viewAllAnswers(): void {
    this.error = '';
    this.mode = 'answers';
    this.attachedToQuestion = true;
    this.sharesTagButNotAttached = false;
    this.pointsList.SelectPoints();
  }

  public ReselectForNewAnswer(): void {
    this.viewAllAnswers();
  }

  viewMyPoints(): void {
    this.error = '';
    this.mode = 'myPoints';
    this.attachedToQuestion = true;
    this.sharesTagButNotAttached = false;
    this.pointsList.SelectPoints();
  }

  addAnswer(): void {
    this.error = '';
    this.savedMode = this.mode;
    this.mode = 'addAnswer';
    this.attachedToQuestion = false;
    this.sharesTagButNotAttached = true;
    this.pointsList.SelectPoints();
    this.AnswerAdded.emit(this.QuestionID);
  }

  newAnswer(): void {
    this.error = '';
    this.savedMode = this.mode;
    this.mode = 'newAnswer';
  }

  cancelNewAnswer(): void {
    this.error = '';
    this.mode = this.savedMode;
  }

  newAnswerSaved() {
    this.error = '';
    this.mode = this.savedMode;
    this.pointsList.SelectPoints();
    this.AnswerAdded.emit(this.QuestionID);
  }

  AddRemovePointFromAnswers(add: boolean, pointID: number): void {
    this.error = '';

    this.questionPointAddRemove$ = this.questionsService
      .QuestionPointAddRemove(add, this.QuestionID, pointID)
      .subscribe({
        next: _ => {
          this.viewMyPoints();
          if (add) this.AnswerAdded.emit(this.QuestionID);
          else this.AnswerRemoved.emit(this.QuestionID);
        },
        error: err => (this.error = err.error.detail)
      });
  }

  ngOnDestroy() {
    this.questionPointAddRemove$?.unsubscribe();
  }
}
