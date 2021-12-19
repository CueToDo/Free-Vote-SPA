// Angular
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
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
  @Input() organisation = new Organisation();
  @Output() organisationChange = new EventEmitter();

  @Output() Cancel = new EventEmitter();
  @Output() Complete = new EventEmitter<Organisation>();

  @ViewChild('groupName', { static: true }) elGroupName: ElementRef | undefined;
  @ViewChild('groupDescription', { static: true }) elGroupDescription:
    | ElementRef
    | undefined;
  @ViewChild('groupWebsite', { static: true }) elGroupWebsite:
    | ElementRef
    | undefined;
  @ViewChild('geoExtent', { static: true }) elGeoExtent: MatSelect | undefined;

  updatingPreview = false;
  disableWebsiteRefresh = true;
  isNew = false;

  private groups$: Subscription | undefined;
  private extents$: Subscription | undefined;

  public GeographicalExtentID = GeographicalExtentID;
  public GeographicalExtent = GeographicalExtent;

  extents: Kvp[] = [];

  get showCountries(): boolean {
    if (!this.organisation) {
      return false;
    }
    return this.appData.ShowCountries(this.organisation.geographicalExtentID);
  }

  get showRegions(): boolean {
    if (!this.organisation) {
      return false;
    }
    return this.appData.ShowRegions(this.organisation.geographicalExtentID);
  }

  get showCities(): boolean {
    if (!this.organisation) {
      return false;
    }
    return this.appData.ShowCities(this.organisation.geographicalExtentID);
  }

  error = '';

  constructor(
    private appData: AppDataService,
    private organisationsService: OrganisationsService
  ) {}

  ngOnInit(): void {
    this.extents$ = this.appData.GeographicalExtents().subscribe({
      next: extents => {
        console.log('EXTENTS', extents);
        this.extents = extents;
      },
      error: serverError => (this.error = serverError.error.detail)
    });
    this.checkWebsite();
    this.isNew = this.organisation.organisationID < 1;
  }

  public ClearError(): void {
    this.error = '';
    if (this.isNew) this.elGroupWebsite?.nativeElement.focus();
    else this.elGroupName?.nativeElement.focus();
  }

  nameComplete(): void {
    this.elGroupDescription?.nativeElement.focus();
  }

  descriptionComplete(): void {
    this.elGroupWebsite?.nativeElement.focus();
  }

  websiteComplete(): void {
    this.elGeoExtent?.focus();
  }

  extentSelected(extent: string): void {
    // NB: Value from a drop down will be a string
    // extent is a string, even if we did type it as a number
    const geoExtent = GeographicalExtent.get(extent);
    if (geoExtent && this.organisation) {
      this.organisation.geographicalExtent = geoExtent;
    }
  }
  checkWebsite(): void {
    this.disableWebsiteRefresh =
      (!this.organisation.organisationWebsite.startsWith('http://') &&
        !this.organisation.organisationWebsite.startsWith('https://')) ||
      !this.organisation.organisationWebsite.includes('.');
  }

  Update(): void {
    if (this.organisation) {
      if (this.appData.isUrlNameUnSafe(this.organisation.organisationName)) {
        if (
          confirm(
            'Organiation name contains invalid characters. Remove them now?'
          )
        ) {
          this.organisation.organisationName = this.appData.urlSafeName(
            this.organisation.organisationName
          );
        } else {
          return;
        }
      }

      this.error = '';
      const newGroup = this.organisation.organisationID < 1;

      this.groups$ = this.organisationsService
        .Update(this.organisation)
        .subscribe({
          next: organisation => {
            this.Complete.emit(organisation);
            if (newGroup) {
              this.organisation = new Organisation();
              this.organisation.geographicalExtentID =
                GeographicalExtentID.National.toString();
            }
          },
          error: serverError => {
            this.error = serverError.error.detail;
          }
        });
    }
  }

  FetchMetaData(): void {
    // If it's a newSource, it will be showLinkPreview
    // but could be called from point update where isNew is false and showLinkPreview is true
    if (this.organisation.organisationWebsite) {
      // Get Link metadata for preview
      // Also handled in new point in tags-and-points component
      this.updatingPreview = true;
      this.organisationsService
        .OrganisationWebsiteMetaDataFetch(
          this.organisation.organisationID,
          this.organisation.organisationWebsite
        )
        .subscribe({
          next: metaData => {
            this.organisation.organisationName = metaData.title;
            this.organisation.description = metaData.description;
            this.organisation.image = metaData.image;
            this.updatingPreview = false;
          },
          error: err => {
            this.error = err.error.detail;
            console.log('ERROR', err.error.detail);
            this.updatingPreview = false;
          }
        });
    }
  }

  CancelEdit(): void {
    this.Cancel.emit();
  }

  ngOnDestroy(): void {
    if (this.groups$) {
      this.groups$.unsubscribe();
    }
    if (this.extents$) {
      this.extents$.unsubscribe();
    }
  }
}
