import { GeographicalExtentID } from './enums';

export class Group {
    groupID = 0;
    groupName: string;
    subGroups: string[] = [];
    groupWebsite: string;
    description: string;
    active: boolean;
    geographicalExtentID = GeographicalExtentID.National.toString(); // for html binding use string
    // AND API must return string otherwise javascript overrides specified type making it a number
    geographicalExtent: string;
    invitationOnly: boolean; // Only private groups can be invitation only
    Sections: string[] = [];  // database sorts
    defaultSection: string;
    countries: string[] = [];  // database sorts
    regions: string[] = [];
    cities: string[] = [];
    members: number;
    issues: number; // Topics
    groupOwner: boolean;
    groupAdministrator: boolean;
    groupMember: boolean;
    canInviteMembers: boolean;
    row: number;
}
