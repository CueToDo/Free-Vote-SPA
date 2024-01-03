// Angular
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

// Other
import { cloneDeep } from 'lodash-es';

// Models, enums
import { Tag } from 'src/app/models/tag.model';
import { Question, QuestionEdit } from 'src/app/models/question.model';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { QuestionsService } from 'src/app/services/questions.service';
import { TagsService } from 'src/app/services/tags.service';

@Component({
  selector: 'app-question-edit',
  templateUrl: './question-edit.component.html',
  styleUrls: ['./question-edit.component.css']
})
export class QuestionEditComponent implements OnInit {
  @Input() public question = new Question();
  questionClone!: QuestionEdit;

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter();

  // https://stackoverflow.com/questions/51193187/my-template-reference-variable-nativeelement-is-undefined
  // https://stackoverflow.com/questions/37450805/what-is-the-read-parameter-in-viewchild-for
  // read ElementRef required because this example is within a form?
  @ViewChild('tvQuestionTitle', { read: ElementRef }) tvQuestionTitle:
    | ElementRef
    | undefined;

  @ViewChild('CKEfudge', { static: true }) ckeFudge: any;

  userTouched = false;
  saving = false;

  waiting = false;
  error = '';

  constructor(
    private tagsService: TagsService,
    private questionService: QuestionsService,
    private localData: LocalDataService
  ) {}

  ngOnInit(): void {
    if (!!this.question) {
      this.questionClone = cloneDeep(this.question) as any as QuestionEdit;
      this.GetQuestionTagsEdit();
      // this.questionEdit.slashTag = this.localData.PreviousSlashTagSelected;
    }
    // If a new question, parent must initialise with NewQuestion
  }

  GetQuestionTagsEdit(): void {
    if (this.questionClone.questionID <= 0) return;

    // Get all national and constituency tags for the point
    this.waiting = true;
    this.tagsService
      .QuestionTagsEdit(
        this.questionClone.questionID,
        this.localData.ConstituencyIDVoter
      )
      .subscribe(tags => {
        this.questionClone.tags = tags.filter(
          tag => tag.constituencyTag === this.localData.forConstituency
        );
        this.waiting = false;
      });
  }

  NewQuestion(slashTag: string): void {
    // Clear old Values when edit complete
    this.questionClone = new QuestionEdit();
    this.ClearQuestion();

    if (!!slashTag) {
      let newTag = new Tag(slashTag, this.localData.ConstituencyID);
      newTag.tagByMeNew = true;
      this.questionClone.tags = [newTag];
    } else {
      this.questionClone.tags = [];
    }

    setTimeout(() => {
      this.tvQuestionTitle?.nativeElement.focus();
    }, 500);
  }

  ClearQuestion(): void {
    this.questionClone.constituencyID = this.question.constituencyID;
    this.questionClone.questionID = -1;
    this.questionClone.question = '';
    this.questionClone.details = ''; // doesn't get through to ckEditor on property binding
    this.ckeFudge.clearData(); // Must explicitly clear previous data
    this.questionClone.draft = false;

    this.error = '';
    this.userTouched = false;
    // Leave slashtag
  }

  onQuestionBlur(): void {
    this.userTouched = true;
  }

  onSubmit(): void {
    const isNew = this.questionClone.questionID < 1;

    this.questionService.QuestionUpdate(this.questionClone).subscribe({
      next: IDnSlug => {
        this.question.questionID = IDnSlug.value;
        this.question.slug = IDnSlug.key;
        this.question.question = this.questionClone.question;
        this.question.details = this.questionClone.details;
        this.question.draft = this.questionClone.draft;
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
          this.tagsService.SetSlashTag(this.questionClone.tags[0].slashTag);
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
