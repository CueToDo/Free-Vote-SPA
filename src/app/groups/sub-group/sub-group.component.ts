
// Angular
import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// rxjs
import { concatMap } from 'rxjs/operators';

// Models and Enums
import { SubGroup } from 'src/app/models/sub-group.model';
import { Issue } from 'src/app/models/issue.model';
import { PorQ } from './../../models/porq.model';
import { DecisionBasisOption, IssueStatuses } from 'src/app/models/enums';
import { ProposalStatuses } from './../../models/enums';
import { IssueSelectionResult } from './../../models/issue.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { GroupsService } from 'src/app/services/groups.service';
import { IssuesService } from 'src/app/services/issues.service';
import { PsandQsService } from 'src/app/services/psandqs.service';

// Components
import { ProgressComponent } from '../progress/progress.component';

@Component({
  selector: 'app-sub-group',
  templateUrl: './sub-group.component.html',
  styleUrls: ['./sub-group.component.css']
})
export class SubGroupComponent implements OnInit, OnDestroy, AfterViewInit {

  // Not currently used - may do if resurrect SubGroupsComponent
  @Output() subGroupUpdated = new EventEmitter();
  @Output() subGroupDeleted = new EventEmitter();

  @ViewChild('progress') progressComponent: ProgressComponent;

  groupName: string;
  subGroupName: string;
  public subGroup: SubGroup;

  public get groupNameKebab(): string {
    return this.appData.kebab(this.groupName);
  }

  public DecisionBasisOption = DecisionBasisOption;

  subGroupEdit = false;

  public issues: Issue[];
  public IssueStatuses = IssueStatuses;

  issueStatusID: IssueStatuses;
  proposalStatusID: ProposalStatuses;

  public newIssue = false;
  public newIssueEdit: Issue;

  public psOrQs: PorQ[];
  public showPsAndQs = false;

  startingDiscussion = false;
  startedMessage = '';

  error: string;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public appData: AppDataService,
    private groupsService: GroupsService,
    private issuesService: IssuesService,
    private psandQsService: PsandQsService) { }


  ngOnInit(): void {

    const routeParams = this.activeRoute.snapshot.params;
    this.groupName = this.appData.unKebab(routeParams.groupName);
    this.subGroupName = this.appData.unKebab(routeParams.subGroupName);

    this.getSubGroup(this.groupName, this.subGroupName);
  }

  getSubGroup(groupName: string, subGroupName: string) {

    this.error = '';

    this.groupsService.SubGroupByName(groupName, subGroupName).subscribe(
      {
        next: subGroup => {
          this.subGroup = subGroup as SubGroup;
          // this.SelectSubGroup();
        },
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  ngAfterViewInit() {
    this.reInitialise();
  }

  reInitialise() {
    // ToDo Draft Issues, Proposals
    if (this.subGroup.issuesInProposalVoting > 0) {
      this.issueStatusID = IssueStatuses.ProposalVoting;
    } else if (this.subGroup.issuesInDiscussion > 0) {
      this.issueStatusID = IssueStatuses.Discussion;
    } else if (this.subGroup.issuesInPrioritisation > 0) {
      this.issueStatusID = IssueStatuses.Prioritisation;
    } else if (this.subGroup.issuesClosed > 0) {
      this.issueStatusID = IssueStatuses.Closed;
      // } else if (this.subGroupDisplay.proposalsRejected > 0) {
      //   issueStatusID = IssueStages.ProposalRejected;
      // } else {
      //   issueStatusID = IssueStages.Draft;
    } else {
      this.issueStatusID = IssueStatuses.PrioritisationYetToStart;
    }

    this.proposalStatusID = ProposalStatuses.None;

    this.initialiseIssueProgressDisplay();
    this.getIssues(this.issueStatusID);
  }

  edit() {
    this.error = '';
    this.subGroupEdit = true;
  }

  delete() {
    if (confirm(`Are you sure you wish to delete the subgroup "${this.subGroup.subGroupName}"?`)) {
      this.groupsService.SubGroupDelete(this.subGroup.groupID, this.subGroup.subGroupID).subscribe(
        {
          next: _ => {
            // this.subGroupDeleted.emit();
            this.router.navigateByUrl('/groups/view/' + this.appData.kebab(this.groupName));
          },
          error: serverError => this.error = serverError.error.detail
        }
      );
    }
  }

  editComplete() {
    this.subGroupEdit = false;
    // this.subGroupUpdated.emit();
    // this.getIssues(IssueStatuses.Prioritisation);
  }

  editCancelled() {
    this.subGroupEdit = false;
  }

  // After submit new issue or delete issue, update counts
  refreshSubGroup() {
    this.groupsService.SubGroup(this.subGroup.subGroupID).subscribe(
      {
        next: subGroup => this.subGroup = subGroup,
        error: serverError => {
          console.log(serverError);
          this.error = serverError.error.detail;
        }
      }
    );
  }

  getIssues(issueStatusID: IssueStatuses) {

    this.error = '';

    this.newIssue = false;

    this.issuesService.GetIssuesForSubGroup(this.subGroup.subGroupID, issueStatusID).subscribe(
      {
        next: isr => {
          this.issues = isr.issues;
          this.showPsAndQs = false;
          this.updateIssueCountsAfterFetch(isr);
        },
        error: serverError => {
          console.log(serverError);
          this.error = serverError.error.detail;
        }
      }
    );
  }

  // If there was an auto count update, refresh counts in progress component
  updateIssueCountsAfterFetch(isr: IssueSelectionResult) {
    if (isr.subGroupIssueCounts.countsUpdated) {
      // subGroup is already bound to progress component
      this.subGroup.issuesNotInPrioritisation = isr.subGroupIssueCounts.issuesNotInPrioritisation;
      this.subGroup.issuesInPrioritisation = isr.subGroupIssueCounts.issuesInPrioritisation;
      this.subGroup.issuesInDiscussion = isr.subGroupIssueCounts.issuesInDiscussion;
      this.subGroup.issuesInProposalVoting = isr.subGroupIssueCounts.issuesInProposalVoting;
      this.subGroup.issuesClosed = isr.subGroupIssueCounts.issuesClosed;
    }

  }

  refreshIssueCount(statusID: IssueStatuses, count: number) {
    switch (statusID) {
      case IssueStatuses.PrioritisationYetToStart:
        this.subGroup.issuesNotInPrioritisation = count;
        break;
      case IssueStatuses.Prioritisation:
        this.subGroup.issuesNotInPrioritisation = count;
        break;
      case IssueStatuses.Discussion:
        this.subGroup.issuesInDiscussion = count;
        break;
      case IssueStatuses.ProposalVoting:
        this.subGroup.issuesInProposalVoting = count;
        break;
      case IssueStatuses.Closed:
        this.subGroup.issuesClosed = count;
        break;
    }
  }

  createNewIssue() {
    this.newIssue = true;
    this.newIssueEdit = new Issue();
    this.newIssueEdit.groupIDOwner = this.subGroup.groupID;
    this.newIssueEdit.subGroupID = this.subGroup.subGroupID;
    this.newIssueEdit.issueID = -1;
    this.newIssueEdit.publish = true;
    const earliest = new Date();
    const latest = this.appData.addMonths(earliest, 3);
    this.newIssueEdit.selectionDateEarliest = this.appData.UDTF(earliest);
    this.newIssueEdit.selectionDateLatest = this.appData.UDTF(latest);
  }


  // Highlight selected status
  initialiseIssueProgressDisplay() {
    this.progressComponent.issueStatusID = this.issueStatusID;
    this.progressComponent.proposalStatusID = this.proposalStatusID;
  }

  issueCreated(statusID) {
    this.newIssue = false;
    this.refreshSubGroup();
    this.getIssues(statusID);
    this.progressComponent.issueStatusID = statusID;
  }

  newIssueCancelled() {
    this.newIssue = false;
    this.reInitialise();
  }


  issueDeleted() {
    this.refreshSubGroup();
  }

  getPsOrQs(proposalStatus: ProposalStatuses) {

    this.error = '';

    this.newIssue = false;

    this.psandQsService.PsAndQsSelectSubGroup(this.subGroup.subGroupID, proposalStatus, false).subscribe(
      {
        next: proposals => {
          console.log(proposals);
          this.psOrQs = proposals.psOrQs;
          this.showPsAndQs = true;
        },
        error: serverError => this.error = serverError.error.detail
      }
    );

  }

  selectIssueNow() {
    this.error = '';
    if (confirm('Select issue for discussion now?')) {
      this.startingDiscussion = true;
      this.groupsService.SubGroupStartDiscussionNow(this.subGroup.subGroupID)
        .pipe(
          // Discussion is started - boolean value back from service call is irrelevant
          // Refresh the subGroup
          concatMap(() => {
            console.log('STARTED');
            return this.groupsService.SubGroup(this.subGroup.subGroupID);
          }),
          concatMap((subGroup: SubGroup) => {
            console.log('We got a subgroup', subGroup);
            this.subGroup = subGroup as SubGroup;
            // Now update issues and return the observable
            return this.issuesService.GetIssuesForSubGroup(this.subGroup.subGroupID, IssueStatuses.Discussion);
          })
        )
        .subscribe(
          {
            next: isr => {
              console.log('AND some issues', isr);
              // GetIssuesForSubGroup returns an IssueSelectionResult
              this.issues = isr.issues;
              this.showPsAndQs = false;
              this.updateIssueCountsAfterFetch(isr);
              this.progressComponent.issueStatusID = IssueStatuses.Discussion;
              // Oh and we've started the discussion
              this.startingDiscussion = false;
              this.startedMessage = 'started';
            },
            error: serverError => {
              console.log(serverError);
              this.error = serverError.error.detail;
            }
          }
        );
    }
  }

  ngOnDestroy() {

  }
}
