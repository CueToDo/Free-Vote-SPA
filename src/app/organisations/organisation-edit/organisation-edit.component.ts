
// Angular
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatSelect } from '@angular/material/select';

// rxjs
import { Subscription } from 'rxjs';

// Model
import { Kvp } from 'src/app/models/kvp.model';
import { GeographicalExtent, GeographicalExtentID } from 'src/app/models/enums';
import { Organisation } from 'src/app/models/organisation.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { OrganisationsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-organisation-edit',
  templateUrl: './organisation-edit.component.html',
  styleUrls: ['./organisation-edit.component.css']
})
export class OrganisationEditComponent implements OnInit, OnDestroy {

  @Input() organisation: Organisation;

  @Output() Cancel = new EventEmitter();
  @Output() Complete = new EventEmitter<Organisation>();

  @ViewChild('groupName', { static: true }) elGroupName: ElementRef;
  @ViewChild('groupDescription', { static: true }) elGroupDescription: ElementRef;
  @ViewChild('groupWebsite', { static: true }) elGroupWebsite: ElementRef;
  @ViewChild('geoExtent', { static: true }) elGeoExtent: MatSelect;


  private groups$: Subscription;
  private extents$: Subscription;

  public GeographicalExtentID = GeographicalExtentID;
  public GeographicalExtent = GeographicalExtent;

  extents: Kvp[];

  get showCountries(): boolean {
    return this.appData.ShowCountries(this.organisation.geographicalExtentID);
  }

  get showRegions(): boolean {
    return this.appData.ShowRegions(this.organisation.geographicalExtentID);
  }

  get showCities(): boolean {
    return this.appData.ShowCities(this.organisation.geographicalExtentID);
  }

  error = '';

  constructor(
    private appData: AppDataService,
    private groupsService: OrganisationsService
  ) { }

  ngOnInit(): void {

    this.extents$ = this.appData.GeographicalExtents().subscribe(
      {
        next: extents => this.extents = extents,
        error: serverError => this.error = serverError.error.detail
      }
    );

  }

  public ClearError() {
    this.error = '';
    this.elGroupName.nativeElement.focus();
  }

  nameComplete() {
    this.elGroupDescription.nativeElement.focus();
  }

  descriptionComplete() {
    this.elGroupWebsite.nativeElement.focus();
  }

  websiteComplete() {
    this.elGeoExtent.focus();
  }

  extentSelected(extent: string) {
    // NB: Value from a drop down will be a string
    // extent is a string, even if we did type it as a number
    this.organisation.geographicalExtent = GeographicalExtent.get(extent);
  }

  Update() {

    if (this.appData.isUrlNameUnSafe(this.organisation.organisationName)) {
      if (confirm('Sub Group name contains invalid characters. Remove them now?')) {
        this.organisation.organisationName = this.appData.urlSafeName(this.organisation.organisationName);
      } else {
        return;
      }
    }

    this.error = '';
    const newGroup = this.organisation.organisationID < 1;

    this.groups$ = this.groupsService.Update(this.organisation)
      .subscribe(
        {
          next: group => {
            this.Complete.emit(group);
            if (newGroup) {
              this.organisation = new Organisation();
              this.organisation.geographicalExtentID = GeographicalExtentID.National.toString();
            }
          },
          error: serverError => {
            this.error = serverError.error.detail;
          }
        }
      );

  }

  CancelEdit() {
    this.Cancel.emit();
  }

  ngOnDestroy() {
    if (this.groups$) { this.groups$.unsubscribe(); }
    if (this.extents$) { this.extents$.unsubscribe(); }
  }

}
