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
import { MatSelect, MatSelectModule } from '@angular/material/select';

// rxjs
import { Subscription } from 'rxjs';

// Model
import { Country } from 'src/app/models/country.model';
import {
  GeographicalExtent,
  GeographicalExtentID,
  OrganisationTypes
} from 'src/app/models/enums';
import { Kvp } from 'src/app/models/kvp.model';
import { Organisation } from 'src/app/models/organisation.model';

// Components
import { CountriesComponent } from 'src/app/base/countries/countries.component';

// Services
import { LookupsService } from 'src/app/services/lookups.service';
import { OrganisationsService } from 'src/app/services/organisations.service';
import { MatRadioModule } from '@angular/material/radio';
import { ListComponent } from '../../base/list/list.component';
import { CountriesComponent as CountriesComponent_1 } from '../../base/countries/countries.component';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgClass, NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-organisation-edit',
    templateUrl: './organisation-edit.component.html',
    styleUrls: ['./organisation-edit.component.css'],
    standalone: true,
    imports: [NgClass, MatFormFieldModule, MatInputModule, FormsModule, NgIf, MatButtonModule, MatIconModule, MatTooltipModule, MatSelectModule, NgFor, MatOptionModule, CountriesComponent_1, ListComponent, MatRadioModule]
})
export class OrganisationEditComponent implements OnInit, OnDestroy {
  @Input() organisation = new Organisation();
  @Output() organisationChange = new EventEmitter<Organisation>();
  @Output() Complete = new EventEmitter();
  @Output() Cancel = new EventEmitter();

  @ViewChild('groupName', { static: true }) elGroupName: ElementRef | undefined;
  @ViewChild('groupDescription', { static: true }) elGroupDescription:
    | ElementRef
    | undefined;
  @ViewChild('groupWebsite', { static: true }) elGroupWebsite:
    | ElementRef
    | undefined;
  @ViewChild('geoExtent', { static: true }) elGeoExtent: MatSelect | undefined;
  @ViewChild('geoCountries', { static: false }) elGeoCountries:
    | CountriesComponent
    | undefined;

  updatingPreview = false;
  disableWebsiteRefresh = true;
  isNew = false;

  private organisation$: Subscription | undefined;
  private organisationTypes$: Subscription | undefined;
  private extents$: Subscription | undefined;

  public GeographicalExtentID = GeographicalExtentID;
  public GeographicalExtent = GeographicalExtent;

  extents: Kvp[] = [];
  organisationTypes: Kvp[] = [];
  allCountries: Country[] = [];

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

  error = '';

  constructor(
    private lookupsService: LookupsService,
    private organisationsService: OrganisationsService
  ) {}

  ngOnInit(): void {
    this.extents$ = this.lookupsService.GeographicalExtents().subscribe({
      next: extents => {
        this.extents = extents;
      },
      error: serverError => (this.error = serverError.error.detail)
    });

    this.organisationTypes$ = this.lookupsService
      .OrganisationTypes()
      .subscribe({
        next: organisationTypes => {
          this.organisationTypes = organisationTypes.filter(
            type => type.value != +OrganisationTypes.Any
          );
        },
        error: serverError => (this.error = serverError.error.detail)
      });

    this.checkWebsite();
    this.isNew = this.organisation.organisationID < 1;

    // Get list of all countries
    // ToDo this could be cached rather than look up on each edit
    this.lookupsService.GetCountries().subscribe({
      next: countries => {
        this.allCountries = countries; // All countries
        this.SelectCountries();
      },
      error: serverError => (this.error = serverError.error.detail)
    });
  }

  SelectCountries() {
    const countryNames = this.organisation.countries.map(
      country => country.country
    );

    // Select countries in the full list, if it's in the organisation list
    this.allCountries.forEach(country => {
      if (countryNames.indexOf(country.country) > -1) country.selected = true;
    });
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
      // Organisation name will be validated and "slugged" in API

      this.error = '';
      const newOrganisation = this.organisation.organisationID < 1;

      this.organisation.countries = this.elGeoCountries?.Selected!;

      this.organisation$ = this.organisationsService
        .Update(this.organisation)
        .subscribe({
          next: organisation => {
            this.organisationChange.emit(organisation); // Pass value back to parent
            this.Complete.emit(); // Tell parent the edit is complete
            if (newOrganisation) {
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
            if (!this.organisation.organisationName)
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
    if (this.organisation$) this.organisation$.unsubscribe();
    if (this.organisationTypes$) this.organisationTypes$.unsubscribe();
    if (this.extents$) this.extents$.unsubscribe();
  }
}
