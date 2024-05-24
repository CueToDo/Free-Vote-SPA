// Angular
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Lodash https://github.com/lodash/lodash/issues/3192
import { cloneDeep } from 'lodash-es';

// Models
import { GeographicalExtentID } from 'src/app/models/enums';
import { Organisation } from 'src/app/models/organisation.model';

// Services
import { HttpExtraService } from 'src/app/services/http-extra.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { OrganisationsService } from 'src/app/services/organisations.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { OrganisationEditComponent } from '../organisation-edit/organisation-edit.component';

import { NgIf, NgClass, NgFor } from '@angular/common';
import { WebsitePreviewComponent } from '../../public/website-preview/website-preview.component';

@Component({
  selector: 'app-organisation',
  templateUrl: 'organisation.component.html',
  styleUrls: ['organisation.component.css'],
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    NgClass,
    NgFor,
    OrganisationEditComponent,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    WebsitePreviewComponent
  ]
})
export class OrganisationComponent implements OnInit {
  public organisation = new Organisation();
  public organisationCopyForEdit = new Organisation();
  public GeographicalExtentID = GeographicalExtentID;

  organisationEdit = false;
  membershipMessage = '';

  creatingNewGroup = false;

  error = '';

  get showCountries(): boolean {
    if (!this.organisation) {
      return false;
    }
    return this.lookupsService.ShowCountries(
      this.organisation.geographicalExtentID
    );
  }

  get showRegions(): boolean {
    if (!this.organisation) {
      return false;
    }
    return this.lookupsService.ShowRegions(
      this.organisation.geographicalExtentID
    );
  }

  get showCities(): boolean {
    if (!this.organisation) {
      return false;
    }
    return this.lookupsService.ShowCities(
      this.organisation.geographicalExtentID
    );
  }

  issuesLink(group: string): string {
    if (!this.organisation) {
      return '';
    }
    return `/organisations/${this.httpXS.kebabUri(
      this.organisation.organisationName
    )}/${this.httpXS.kebabUri(group)}`;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private lookupsService: LookupsService,
    private organisationService: OrganisationsService,
    private httpXS: HttpExtraService
  ) {}

  ngOnInit(): void {
    this.getOrganisation();
  }

  getOrganisation(): void {
    let organisationSlug =
      this.activatedRoute.snapshot.params['organisationSlug'];

    organisationSlug = this.httpXS.unKebabUri(organisationSlug);
    let dc_id = this.activatedRoute.snapshot.params['dc_id'];

    this.organisationService
      .Organisation(organisationSlug, dc_id, true)
      .subscribe({
        next: (organisation: Organisation) => {
          Object.assign(this.organisation, organisation);
          Object.assign(this.organisationCopyForEdit, organisation);
        },
        error: serverError => {
          this.error = serverError.error.detail;
        }
      });
  }

  Join(): void {
    this.error = '';
    this.membershipMessage = '';

    if (!this.organisation) {
      this.error = 'No organisation to display';
    } else {
      this.organisationService
        .Join(this.organisation.organisationID)
        .subscribe({
          next: members => {
            if (this.organisation) {
              this.organisation.organisationMember = true;
              this.organisation.members = members;
              this.membershipMessage = 'you have joined the group';
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  Leave(): void {
    if (!this.organisation) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';
      this.membershipMessage = '';

      this.organisationService
        .Leave(this.organisation.organisationID)
        .subscribe({
          next: members => {
            if (this.organisation) {
              this.organisation.organisationMember = false;
              this.organisation.members = members;
              this.membershipMessage = 'you have left the group';
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  Activate(): void {
    if (!this.organisation) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';

      this.organisationService
        .Activate(this.organisation.organisationID, true)
        .subscribe({
          next: _ => {
            if (this.organisation) {
              this.organisation.active = true;
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  DeActivate(): void {
    if (!this.organisation) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';

      this.organisationService
        .Activate(this.organisation.organisationID, false)
        .subscribe({
          next: _ => {
            if (this.organisation) {
              this.organisation.active = false;
            }
          },
          error: serverError => (this.error = serverError.error.detail)
        });
    }
  }

  Edit(): void {
    // this.organisationCopy = cloneDeep(this.OrganisationDisplay) as Organisation; // If we decide to cancel
    this.organisationEdit = true;
  }

  Delete(): void {
    if (!this.organisation) {
      this.error = 'No organisation to display';
    } else {
      this.error = '';
      if (
        confirm(`Are you sure you wish to permanently delete this group?
This cannot be undone.`)
      ) {
        this.organisationService
          .Delete(this.organisation.organisationID)
          .subscribe({
            next: _ => this.router.navigate(['/organisations', 'membership']), // this.Refresh.emit(),
            error: serverError => (this.error = serverError.error.detail)
          });
      }
    }
  }

  Cancel(): void {
    this.organisationEdit = false;
  }

  Complete(): void {
    this.organisation = cloneDeep(this.organisationCopyForEdit) as Organisation;
    this.organisationEdit = false;
  }
}
