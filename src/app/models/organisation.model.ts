// Models, enums
import { Country } from 'src/app/models/country.model';
import { GeographicalExtentID } from 'src/app/models/enums';

export class Organisation {
  organisationID = 0;

  organisationWebsite = '';
  organisationName = '';
  description = '';
  image = '';

  active = false;

  geographicalExtentID = GeographicalExtentID.National.toString(); // for html binding use string
  // AND API must return string otherwise javascript overrides specified type making it a number
  geographicalExtent = '';
  countries: Country[] = [];
  regions: string[] = [];
  cities: string[] = [];

  invitationOnly = false; // Only private groups can be invitation only

  members = 0;
  issues = 0; // Topics

  organisationOwner = false;
  organisationAdministrator = false;
  organisationMember = false;
  canInviteMembers = false;

  row = 0;
}
