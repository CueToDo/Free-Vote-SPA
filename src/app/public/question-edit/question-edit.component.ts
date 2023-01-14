// Angular
import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  ViewChild
} from '@angular/core';

// Other
import { cloneDeep } from 'lodash-es';

// Models, enums
import { Tag } from 'src/app/models/tag.model';
import { Question, QuestionEdit } from 'src/app/models/question.model';

// Services
import { TagsService } from 'src/app/services/tags.service';
import { QuestionsService } from 'src/app/services/questions.service';

@Component({
  selector: 'app-question-edit',
  templateUrl: './question-edit.component.html',
  styleUrls: ['./question-edit.component.css']
})
export class QuestionEditComponent implements OnInit {
  @Input() public question = new Question();
  questionEdit!: QuestionEdit;

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter();

  @ViewChild('CKEfudge', { static: true }) ckeFudge: any;

  userTouched = false;
  saving = false;

  error = '';

  constructor(
    private tagsService: TagsService,
    private questionService: QuestionsService
  ) {}

  ngOnInit(): void {
    if (!!this.question) {
      this.questionEdit = cloneDeep(this.question) as any as QuestionEdit;
      // this.questionEdit.slashTag = this.localData.PreviousSlashTagSelected;
    }
    // If a new question, parent must initialise with NewQuestion
  }

  NewQuestion(slashTag: string): void {
    // Clear old Values when edit complete
    this.questionEdit = new QuestionEdit();
    this.ClearQuestion();
    this.questionEdit.slashtags = [new Tag(slashTag)];
  }

  ClearQuestion(): void {
    this.questionEdit.constituencyID = -1;
    this.questionEdit.questionID = -1;
    this.questionEdit.question = '';
    this.questionEdit.details = ''; // doesn't get through to ckEditor on property binding
    this.ckeFudge.clearData(); // Must explicitly clear previous data
    this.questionEdit.draft = false;

    this.error = '';
    this.userTouched = false;
    // Leave slashtag
  }

  onQuestionBlur(): void {
    this.userTouched = true;
  }

  onSubmit(): void {
    const isNew = this.questionEdit.questionID < 1;

    this.questionService.QuestionUpdate(this.questionEdit).subscribe({
      next: IDnSlug => {
        this.question.questionID = IDnSlug.value;
        this.question.slug = IDnSlug.key;
        this.question.question = this.questionEdit.question;
        this.question.details = this.questionEdit.details;
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
          this.tagsService.SetSlashTag(this.questionEdit.slashtags[0].slashTag);
        }
      }
    });
  }

  Cancel(): void {
    this.ClearQuestion();
    // this.cancelled = true;
    this.CancelEdit.next(null);
  }
}
