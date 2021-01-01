
// Angular
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

// Models, Enums
import { Group } from 'src/app/models/group.model';
import { IssueStatuses, ProposalStatuses } from '../../models/enums';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

  @Input() Group: Group;
  @Input() issueStatusID: IssueStatuses;
  @Input() proposalStatusID: ProposalStatuses;

  @Output() IssueStatusSelected = new EventEmitter();
  @Output() ProposalStatusSelected = new EventEmitter();

  @Input() NewIssue = false;
  @Output() NewIssueRequest = new EventEmitter();

  constructor() { }

  public IssueStatuses = IssueStatuses;
  public ProposalStatuses = ProposalStatuses;

  ngOnInit(): void {
  }

  setIssueStatus(issueStatusID: IssueStatuses) {
    // Check if in middle of entering new issue
    if (this.confirmCancelNew()) {
      this.issueStatusID = issueStatusID;
      this.IssueStatusSelected.emit(issueStatusID);
      this.proposalStatusID = ProposalStatuses.VotingYetToStart;
      this.NewIssue = false;
    } else {
      this.NewIssue = true;
      console.log('(Issue) Stay on new issue', this.issueStatusID, this.proposalStatusID, Date.now());
    }
  }

  setProposalStatus(proposalStatusID: ProposalStatuses) {
    // Check if in middle of entering new issue
    if (this.confirmCancelNew()) {
      console.log('setProposalStatus CANCEL NEW');
      this.proposalStatusID = proposalStatusID;
      this.issueStatusID = IssueStatuses.None; // deselect all ??
      this.ProposalStatusSelected.emit(proposalStatusID);
      this.NewIssue = false;
    } else {
      this.NewIssue = true;
      console.log('(Proposal) Stay on new issie', this.issueStatusID, this.proposalStatusID, Date.now());
    }
  }

  newIssue() {

    this.NewIssue = true;

    this.issueStatusID = IssueStatuses.None;
    this.proposalStatusID = ProposalStatuses.None;

    this.NewIssueRequest.emit(true);

    console.log('progress newIssue');
  }

  confirmCancelNew(): boolean {

    let proceed = !this.NewIssue;

    if (!proceed) {
      proceed = confirm('Lose any updates to new issue?');
    }

    return proceed;
  }


}
