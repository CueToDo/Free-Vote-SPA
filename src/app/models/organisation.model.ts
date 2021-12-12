import { GeographicalExtentID } from './enums';

export class Organisation {
  organisationID = 0;

  organisationWebsite = '';
  organisationName = '';
  description = '';
  image = '';

  groups: string[] = [];
  active = false;

  geographicalExtentID = GeographicalExtentID.National.toString(); // for html binding use string
  // AND API must return string otherwise javascript overrides specified type making it a number
  geographicalExtent = '';
  countries: string[] = []; // database sorts
  regions: string[] = [];
  cities: string[] = [];

  invitationOnly = false; // Only private groups can be invitation only
  Groups: string[] = []; // database sorts
  defaultGroup = '';

  members = 0;
  issues = 0; // Topics

  organisationOwner = false;
  organisationAdministrator = false;
  organisationMember = false;
  canInviteMembers = false;

  row = 0;
}
