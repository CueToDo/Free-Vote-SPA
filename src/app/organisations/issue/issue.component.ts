
// Angular
import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, ViewChild, EventEmitter } from '@angular/core';

// Material
import { MatSlider, MatSliderChange } from '@angular/material/slider';

// rxjs
import { Subscription } from 'rxjs';

// Models, Enums
import { IssueStatuses } from 'src/app/models/enums';
import { Issue } from 'src/app/models/issue.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { IssuesService } from 'src/app/services/issues.service';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() groupName: string;
  @Input() subGroupName: string;

  @Input() issue: Issue;
  @Input() inFocus: boolean;

  @Output() Deleted = new EventEmitter();

  public IssueStatuses = IssueStatuses;

  get groupNameKB(): string {
    return this.appData.kebabUri(this.groupName);
  }

  get subGroupNameKB(): string {
    return this.appData.kebabUri(this.subGroupName);
  }

  get issueTitleKB(): string {
    return this.appData.kebabUri(this.issue.title);
  }

  public get issueTitleLink(): string {
    // statusID > 2 for clickable link to issue details (ie NOT if still in prioritisation)
    if (!this.inFocus && this.issue.statusID > 2) {
      // for subGroup component
      return `/groups/${this.groupNameKB}/${this.subGroupNameKB}/${this.issueTitleKB}`;
    } else {
      // for details component
      return '.'; // . = same page - empty string = home
    }
  }

  public saving = false;
  public saveMessage = '';

  public error: string;

  public issueEdit = false;
  public issueDeleted = false;

  deleteTooltip = 'delete issue';
  editTooltip = 'edit issue';


  @ViewChild('voteSlider') voteSlider: MatSlider;
  votechange$: Subscription;

  constructor(
    private issuesService: IssuesService,
    private appData: AppDataService
  ) { }

  ngOnInit(): void {

    if (this.issue.statusID === IssueStatuses.Closed) {
      this.editTooltip = 'Closed issues can\'t be edited';
    }

    if (this.issue.porQTotal > 0) {
      this.deleteTooltip = 'Issues cannot be deleted with questions, perspectives or proposals';
    }
  }

  ngAfterViewInit(): void {
    // voteSlider may not be visible
    if (this.voteSlider) {
      this.votechange$ = this.voteSlider.valueChange
        // Don't need a debounce time - slider does not emit value until user releases slider
        .subscribe(
          { next: (value: number) => this.voteToDiscuss(value) }
        );
    }
  }

  edit(): void {
    this.issueEdit = true;
  }

  delete(): void {
    if (confirm('Are you sure you wish to delete this issue?')) {
      this.saving = true;
      this.issuesService.IssueDelete(this.issue.groupID, this.issue.issueID).subscribe(
        {
          next: () => {
            this.saving = false;
            this.issueDeleted = true;
            this.saveMessage = 'deleted';
          },
          error: serverError => this.error = serverError.error.detail,
          complete: () => this.Deleted.emit(true)
        }
      );
    }
  }


  issuepublish(publish: boolean): void {
    this.saving = true;
    this.issuesService.IssuePublish(this.issue.issueID, publish).subscribe(
      {
        next: () => {
          this.saving = false;
          if (publish) { this.saveMessage = 'published'; } else { this.saveMessage = 'unpublished'; }
        },
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  instantVoteChange(event: MatSliderChange): void {
    let priority = 0;
    if (event.value) { priority = event.value; }
    this.issue.voterPriority = priority;
  }

  voteToDiscuss(priority: number): void {
    this.saving = true;
    this.issuesService.VoteToDiscuss(this.issue.issueID, priority).subscribe(
      {
        next: ipv => {
          this.issue.prioritisationVotes = ipv.prioritisationVotes;
          this.issue.voteCastDateTime = ipv.voteCastDateTime;
          this.saveMessage = 'vote saved';
          this.saving = false;
        },
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  ngOnDestroy(): void {
    if (this.votechange$) {
      this.votechange$.unsubscribe();
    }
  }
}
