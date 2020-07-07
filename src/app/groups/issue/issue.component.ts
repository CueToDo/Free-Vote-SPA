
// Angular
import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, ViewChild, EventEmitter } from '@angular/core';

// Material
import { MatSlider } from '@angular/material/slider';

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

  @Input() linkToDetails = false;

  @Output() Deleted = new EventEmitter();

  public IssueStatuses = IssueStatuses;

  get groupNameKB(): string {
    return this.appData.kebab(this.groupName);
  }

  get subGroupNameKB(): string {
    return this.appData.kebab(this.subGroupName);
  }

  get issueTitleKB(): string {
    return this.appData.kebab(this.issue.title);
  }

  public get issueTitleLink(): string {
    if (this.linkToDetails) {
      // for subGroup component
      return `/groups/${this.groupNameKB}/${this.subGroupNameKB}/${this.issueTitleKB}`;
    } else {
      // for details component
      return '';
    }
  }

  public saving = false;
  public saveMessage = '';

  public error: string;

  public issueEdit = false;
  public issueDeleted = false;

  deleteTooltip = 'delete issue';
  editTooltip = 'edit issue';

  public viewProposals = false;

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

  ngAfterViewInit() {
    // voteSlider may not be visible
    if (this.voteSlider) {
      this.votechange$ = this.voteSlider.valueChange
        // Don't need a debounce time - slider does not emit value until user releases slider
        .subscribe(
          { next: value => this.voteToDiscuss(value) }
        );
    }
  }

  edit() {
    this.issueEdit = true;
  }

  delete() {
    if (confirm('Are you sure you wish to delete this issue?')) {
      this.saving = true;
      this.issuesService.IssueDelete(this.issue.subGroupID, this.issue.issueID).subscribe(
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


  issuepublish(publish: boolean) {
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

  instantVoteChange(event) {
    this.issue.voterPriority = event.value;
  }

  voteToDiscuss(priority: number) {
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

  ngOnDestroy() {
    if (this.votechange$) {
      this.votechange$.unsubscribe();
    }
  }
}
