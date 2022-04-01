import { EventEmitter } from '@angular/core';
// Angular
import { Component, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-question-answers',
  templateUrl: './question-answers.component.html',
  styleUrls: ['./question-answers.component.css']
})
export class QuestionAnswersComponent {
  @Input() public filter = new FilterCriteria();
  @Output() ViewAllQuestions = new EventEmitter<boolean>();
  @Output() AnswerAdded = new EventEmitter<number>();
  @Output() AnswerRemoved = new EventEmitter<number>();

  @ViewChild('PointsList') pointsList!: PointsListComponent;

  private questionPointAddRemove$: Subscription | undefined;

  public mode = 'answers'; // myPoints, newAnswer
  private savedMode = '';

  public attachedToQuestion = false;

  public error = '';

  constructor(
    public localData: LocalDataService,
    private activeRoute: ActivatedRoute,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    this.filter.pointSelectionType = PointSelectionTypes.QuestionPoints;
    this.filter.slashTag = this.activeRoute.snapshot.params['tag'];
    this.filter.sortType = PointSortTypes.Random;
    this.filter.sortAscending = true; // Irrelevant for random
  }

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
    this.filter.myPointFilter = MyPointFilter.AllVoters;
    this.filter.sharesTagButNotAttached = false;
    this.filter.updateTopicViewCount = false;
    this.pointsList.SelectPoints();
  }

  public ReselectForNewAnswer(): void {
    this.filter.sortType = PointSortTypes.DateUpdated;
    this.filter.sortAscending = false;
    this.viewAllAnswers();
  }

  viewMyPoints(): void {
    this.error = '';
    this.mode = 'myPoints';
    this.attachedToQuestion = true;
    this.filter.myPointFilter = MyPointFilter.AllMine;
    this.filter.sharesTagButNotAttached = false;
    this.filter.updateTopicViewCount = false;
    this.pointsList.SelectPoints();
  }

  addAnswer(): void {
    this.error = '';
    this.savedMode = this.mode;
    this.mode = 'addAnswer';
    this.attachedToQuestion = false;
    this.filter.sharesTagButNotAttached = true;
    this.filter.updateTopicViewCount = false;
    this.pointsList.SelectPoints();
    this.AnswerAdded.emit(this.filter.questionID);
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
    this.AnswerAdded.emit(this.filter.questionID);
  }

  AddRemovePointFromAnswers(add: boolean, pointID: number): void {
    this.error = '';

    this.questionPointAddRemove$ = this.questionsService
      .QuestionPointAddRemove(add, this.filter.questionID, pointID)
      .subscribe({
        next: _ => {
          this.viewMyPoints();
          if (add) this.AnswerAdded.emit(this.filter.questionID);
          else this.AnswerRemoved.emit(this.filter.questionID);
        },
        error: err => (this.error = err.error.detail)
      });
  }

  ngOnDestroy() {
    this.questionPointAddRemove$?.unsubscribe();
  }
}
