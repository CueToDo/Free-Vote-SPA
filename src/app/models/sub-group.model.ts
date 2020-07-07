export class SubGroup {

    groupID: number;

    subGroupID: number;
    subGroupName: string;
    subGroupOwner: boolean;
    open: boolean;

    // Decision basis
    decisionBasisOptionID: string; // for binding
    superMajority: number;

    // Meeting Interval
    meetingIntervalID: string; // for binding
    selectionWeekOfMonth: string;
    selectionDayOfWeek: string;
    selectionDayOfMonth: string;
    selectionTimeOfDay: string;

    // Actual selection date
    nextIssueSelectionDate: string;
    nextIssueSelectionTime: string;

    // Issues
    issuesNotInPrioritisation: number;
    issuesInPrioritisation: number;
    issuesInDiscussion: number;
    issuesInProposalVoting: number;
    issuesClosed: number;
    issuesTotal: number;

    // Proposals
    proposalsVotingInProgress: number;
    proposalsAccepted: number;
    proposalsRejected: number;
}

export class SubGroupUpdate {

    groupID: number;
    subGroupID: number;
    subGroupName: string;
    subGroupOwner: boolean;
    open: boolean;

    // Decision Basis
    decisionBasisOptionID: string;
    superMajority: number;

    // Meeting Interval
    meetingIntervalID: string;
    selectionWeekOfMonth: string; // first, second, third
    selectionDayOfWeek: string; // thursday
    selectionDayOfMonth: string; // 21st
    selectionTimeOfDay: string;

    // Actual selection date
    nextIssueSelectionDate: string;
    nextIssueSelectionTime: string;
}

