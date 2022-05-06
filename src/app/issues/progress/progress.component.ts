// Angular
import { Component, EventEmitter, Output, Input } from '@angular/core';

// Models, Enums
import { Group } from 'src/app/models/group.model';
import { IssueStatuses, ProposalStatuses } from '../../models/enums';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent {
  @Input() Group = new Group();

  @Output() IssueStatusSelected = new EventEmitter();
  @Output() ProposalStatusSelected = new EventEmitter();

  @Input() NewIssue = false;
  @Output() NewIssueRequest = new EventEmitter();

  public IssueStatuses = IssueStatuses;
  public ProposalStatuses = ProposalStatuses;

  // public values set in group component
  public issueStatusID = IssueStatuses.None;
  public proposalStatusID = ProposalStatuses.None;

  constructor() {}

  setIssueStatus(issueStatusID: IssueStatuses): void {
    // Check if in middle of entering new issue
    if (this.proceed()) {
      this.issueStatusID = issueStatusID;
      this.IssueStatusSelected.emit(issueStatusID);
      this.proposalStatusID = ProposalStatuses.VotingYetToStart;
      this.NewIssue = false;
    } else {
      this.NewIssue = true;
      console.log(
        'setIssueStatus: Stay on new discussion',
        this.issueStatusID,
        this.proposalStatusID,
        Date.now()
      );
    }
  }

  setProposalStatus(proposalStatusID: ProposalStatuses): void {
    // Check if in middle of entering new issue
    if (this.proceed()) {
      this.proposalStatusID = proposalStatusID;
      this.issueStatusID = IssueStatuses.None; // deselect all ??
      this.ProposalStatusSelected.emit(proposalStatusID);
      this.NewIssue = false;
    } else {
      this.NewIssue = true;
      console.log(
        'setProposalStatus: Stay on new discussion',
        this.issueStatusID,
        this.proposalStatusID,
        Date.now()
      );
    }
  }

  newIssue(): void {
    this.NewIssue = true;

    this.issueStatusID = IssueStatuses.None;
    this.proposalStatusID = ProposalStatuses.None;

    this.NewIssueRequest.emit(true);

    console.log('progress newIssue');
  }

  proceed(): boolean {
    let ok = !this.NewIssue;

    if (!ok) {
      ok = confirm('Lose any updates to proposed new discussion?');
    }

    return ok;
  }
}
