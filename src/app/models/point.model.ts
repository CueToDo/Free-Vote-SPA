
import { ID } from './common';
import { PointSupportLevels, PointTypesEnum } from './enums';

export class PointEdit {

    // However the user inputs them, pass them to the server to decode

    pointID: number;
    pointTitle: string; // pointLink constructed in API
    pointHTML: string;
    csvImageIDs = '';
    pointTypeID: PointTypesEnum;

    // Link meta data update is handled in the server API
    linkText: string; // May not be a link, could just be a name
    linkAddress: string; // link url to the source if any
    showLinkBeforeVote: boolean;
    showLinkPreview: boolean;

    youTubeID: string;
    soundCloudTrackID: string;
    slashTags: string[] = [];
    draft: boolean;
}



// Always use camelCase properties
// https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_Serialization_CamelCasePropertyNamesContractResolver.htm
export class PointSelectionResult {
    // My server and client code agreed these should be capitalised,
    // but after updating to VS Angular project, framework intervenes and insists lower case
    tagID: number;
    pointCount: number;

    pointIDs: ID[];
    fromDate: string;
    toDate: string;

    points: Point[];
}

export class PointFeedback {
    woWWeekEndingDate: Date; // Does not need to be formatted
    feedbackDate: string; // Date pipe eugh!
    feedbackGiven: boolean;
    feedbackID: number;
    supportLevelID: PointSupportLevels;
    pointModified: boolean; // has the point been modified after feedback was given?
    woWVote: boolean;
    comment: string;
    feedbackIsUpdatable: boolean;
    isFavourite: boolean;
}

export class PointFeedbackFormData {
    pointID: number;
    pointSupportLevel: PointSupportLevels;
    comment: string;
    feedbackAnon: boolean;
}

export class PointWoWFormData {
    pointID: number;
    wow: boolean;
    feedbackAnon: boolean;
}

export class WoWWeekInfoVoteNotNeeded {
    woWWeekID: number;
    woWWeekEndingDate: Date; //  Does not need to be formatted
}

// Don't even think of making public properties Pascal Case

export class Point {

    pointID: number;
    voterIDPoint: number;
    isPointOwner: boolean;

    pointTitle: string;
    pointLink: string;
    pointHTML: string;
    csvImageIDs = '';
    draft: boolean;

    pointTypeID = PointTypesEnum.Opinion;
    pointTypeIDVoter: number;

    dateTimeCreated: string;
    dateTimeUpdated: string; // How many times am I going to attempt to make this a Date to use DateTime Pipe
    youTubeID: string;
    soundCloudTrackID: string;
    slashTags: string[] = [];

    // Manually added link info
    linkText: string;
    linkAddress: string;
    showLinkBeforeVote: boolean;
    showLinkPreview: boolean;
    // Additional link info from site meta data
    linkTitle: string;
    linkDescription: string;
    linkImage: string;
    isNewSource: boolean;

    archived: boolean;

    rowNumber: number;
    lastRowNumber: number;
    lastRow: boolean;

    pointFeedback = new PointFeedback();

    isFavourite: boolean;

    attached: boolean;
    adoptable: boolean;
    unadoptable: boolean;

    totalFeedback: number;
    netSupport: number;
    perCentInFavour: number;

    support: number;
    opposition: number;
    abstentions: number;
    reports: number;

    isInOpenedSurvey: boolean;
    isInClosedSurvey: boolean;
    isQuestionAnswer: boolean;
}

export class SiteMetaData {
    title: string;
    description: string;
    image: string;
    url: string;
}
