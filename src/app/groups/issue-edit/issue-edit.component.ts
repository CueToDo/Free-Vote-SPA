import { AppDataService } from 'src/app/services/app-data.service';
import { IssueStatuses } from './../../models/enums';

// Angular
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

// Models
import { Issue } from 'src/app/models/issue.model';

// Services
import { IssuesService } from 'src/app/services/issues.service';

@Component({
  selector: 'app-issue-edit',
  templateUrl: './issue-edit.component.html',
  styleUrls: ['./issue-edit.component.css']
})
export class IssueEditComponent implements OnInit {

  // Originally had notionally one-way databinding but was getting 2-way with NO Output() issueChange
  // and no banana in a box on parent ... WHY?
  // Now need to do manual update to prevent the 2 way binding on cancel edit
  // clone and manual 2 way introduced
  @Input() issue: Issue;
  @Output() issueChange = new EventEmitter();

  public issueClone: Issue;

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter();

  public saving = false;
  public error = '';

  // https://stackoverflow.com/questions/47079366/expression-has-changed-after-it-was-checked-during-iteration-by-map-keys-in-angu/50749898
  // pointKeys: IterableIterator<number>;

  config = {
    toolbar:
      [
        ['SpellChecker', 'Bold', 'Italic', 'Underline'], ['TextColor', 'BGColor'],
        ['NumberedList', 'BulletedList'], ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
        ['Link', 'Unlink', 'Source'], ['Image', 'Table', 'HorizontalRule', 'SpecialChar'],
        ['Format', 'Font', 'FontSize']
      ],
    // htmlEncodeOutput: false
    allowedContent: true
  };

  constructor(
    private issuesService: IssuesService,
    private appData: AppDataService
  ) { }

  ngOnInit(): void {
    // For some reason need to cast to any before cast to issue ???
    this.issueClone = <Issue><any>this.appData.deep(this.issue);
  }

  // https://stackoverflow.com/questions/44012321/meaning-of-var-ngmodel

  onCKEBlur() {

  }

  onSubmit() {
    this.saving = true;
    this.issuesService.IssueUpdate(this.issueClone).subscribe(
      {
        next: (statusID: IssueStatuses) => {
          this.issueChange.emit(this.issueClone);
          this.CompleteEdit.emit(statusID);
        },
        error: serverError => {
          this.saving = false;
          this.error = serverError.error.detail;
        },
        complete: () => {
          this.saving = false;
        }
      }
    );
  }

  Cancel() {
    // this.point = new Point();
    this.CancelEdit.next();
  }
}
