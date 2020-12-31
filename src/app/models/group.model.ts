import { GeographicalExtentID } from './enums';

export class Organisation {
    organisationID = 0;
    organisationName: string;
    groups: string[] = [];
    organisationWebsite: string;
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
    organisationOwner: boolean;
    organisationAdministrator: boolean;
    organisationMember: boolean;
    canInviteMembers: boolean;
    row: number;
}
