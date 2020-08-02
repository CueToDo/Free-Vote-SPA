import { ID } from './common';
import { PointSupportLevels } from './enums';

export class QuestionEdit {
    questionID: number;
    question: string;
    draft: boolean;
    slashTag: string;
}

export class Question {

    question: string;
    draft: boolean;
    questionID: number;
    rowNumber: number;

    voterIDQuestion: number;
    isQuestionOwner: boolean;

    created: string;
    updated: string;

    voted: string; // Have voted?
    voteID: number;
    votedDate: string; // When?
    voteIsUpdatable: boolean; // Vote can be changed?
    supportLevelID: PointSupportLevels; // How? -1, 0 +1
    questionModified: boolean; // PointModified after Feedback Given
}


export class QuestionSelectionResult {
    // My server and client code agreed these should be capitalised,
    // but after updating to VS Angular project, framework intervenes and insists lower case
    tagID: number;
    questionCount: number;

    questionIDs: ID[];

    questions: Question[];
}
