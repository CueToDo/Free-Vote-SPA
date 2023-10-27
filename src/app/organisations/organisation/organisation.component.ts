// Angular
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Lodash https://github.com/lodash/lodash/issues/3192
import { cloneDeep } from 'lodash-es';

// Models
import { GeographicalExtentID, MeetingIntervals } from 'src/app/models/enums';
import { Organisation } from 'src/app/models/organisation.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { OrganisationsService } from 'src/app/services/organisations.service';

@Component({
  selector: 'app-organisation',
  templateUrl: 'organisation.component.html',
  styleUrls: ['organisation.component.css']
})
export class OrganisationComponent implements OnInit {
  public OrganisationDisplay = new Organisation();
  @Output() Refresh = new EventEmitter();

  public GeographicalExtentID = GeographicalExtentID;

  groupCopy = new Organisation();
  groupEdit = false;
  membershipMessage = '';

  creatingNewGroup = false;

  error = '';

  get showCountries(): boolean {
    if (!this.OrganisationDisplay) {
      return false;
    }
    return this.lookupsService.ShowCountries(
      this.OrganisationDisplay.geographicalExtentID
    );
  }

  get showRegions(): boolean {
    if (!this.OrganisationDisplay) {
      return false;
    }
    return this.lookupsService.ShowRegions(
      this.OrganisationDisplay.geographicalExtentID
    );
  }

  get showCities(): boolean {
    if (!this.OrganisationDisplay) {
      return false;
    }
    return this.lookupsService.ShowCities(
      this.OrganisationDisplay.geographicalExtentID
    );
  }

  issuesLink(group: string): string {
    if (!this.OrganisationDisplay) {
      return '';
    }
    return `/organisations/${this.appData.kebabUri(
      this.OrganisationDisplay.organisationName
    )}/${this.appData.kebabUri(group)}`;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appData: AppDataService,
    private lookupsService: LookupsService,
    private organisationService: OrganisationsService
  ) {}

  ngOnInit(): void {
    this.getGroup();
  }

  getGroup(): void {
    let organisationName =
      this.activatedRoute.snapshot.params['organisationName'];
    organisationName = this.appData.unKebabUri(organisationName);

    this.organisationService.Organisation(organisationName, true).subscribe({
      next: (organisation: Organisation) => {
        this.OrganisationDisplay = organisation;
      },
      error: serverError => {
        this.error = serverError.error.detail;
      }
    });
  }

  Join(): void {
    this.error = '';
    this.membershipMessage = '';

    if (!this.OrganisationDisplay) {
      this.error = 'No organisation to display';
    } else {
      this.organisationService
        .Join(this.OrganisationDisplay.organisationID)
        .subscribe({
          next: members => {
            if (this.OrganisationDisplay) {
              this.OrganisationDisplay.organisationMember = true;
              this.OrganisationDisplay.members = members;
              this.membershipMessage = 'you have joined the group';
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  Leave(): void {
    if (!this.OrganisationDisplay) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';
      this.membershipMessage = '';

      this.organisationService
        .Leave(this.OrganisationDisplay.organisationID)
        .subscribe({
          next: members => {
            if (this.OrganisationDisplay) {
              this.OrganisationDisplay.organisationMember = false;
              this.OrganisationDisplay.members = members;
              this.membershipMessage = 'you have left the group';
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  Activate(): void {
    if (!this.OrganisationDisplay) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';

      this.organisationService
        .Activate(this.OrganisationDisplay.organisationID, true)
        .subscribe({
          next: _ => {
            if (this.OrganisationDisplay) {
              this.OrganisationDisplay.active = true;
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  DeActivate(): void {
    if (!this.OrganisationDisplay) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';

      this.organisationService
        .Activate(this.OrganisationDisplay.organisationID, false)
        .subscribe({
          next: _ => {
            if (this.OrganisationDisplay) {
              this.OrganisationDisplay.active = false;
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  Edit(): void {
    this.groupCopy = cloneDeep(this.OrganisationDisplay) as Organisation; // If we decide to cancel
    this.groupEdit = true;
  }

  Delete(): void {
    if (!this.OrganisationDisplay) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';
      if (
        confirm(`Are you sure you wish to permanently delete this group?
This cannot be undone.`)
      ) {
        this.organisationService
          .Delete(this.OrganisationDisplay.organisationID)
          .subscribe({
            next: _ => this.router.navigate(['/organisations', 'membership']), // this.Refresh.emit(),
            error: serverError => (this.error = serverError.error.detail)
          });
      }
    }
  }

  Cancel(): void {
    this.OrganisationDisplay = cloneDeep(this.groupCopy) as Organisation;
    this.groupEdit = false;
  }

  Complete(organisation: Organisation): void {
    this.OrganisationDisplay = organisation;
    this.groupEdit = false;
  }
}
