import { LookupsService } from 'src/app/services/lookups.service';
// Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// Globals
import * as globals from 'src/app/globals';

// Model
import { Organisation } from 'src/app/models/organisation.model';

// Services
import { AppDataService } from '../../services/app-data.service';
import { OrganisationsService } from 'src/app/services/organisations.service';
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  Subscription
} from 'rxjs';
import { LocalDataService } from 'src/app/services/local-data.service';
import { Kvp } from 'src/app/models/kvp.model';
import { OrganisationTypes } from 'src/app/models/enums';

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public waiting = false;
  public message = '';
  public error = '';

  fetchComplete = false;

  // https://medium.com/better-programming/angular-manipulate-properly-the-dom-with-renderer-16a756508cba
  @ViewChild('trvOrgSearch', { static: false }) trvOrgSearch:
    | ElementRef
    | undefined;

  orgSearch$: Subscription | undefined;

  organisationTypes: Kvp[] = [];
  organisations: Organisation[] = [];

  // Properties to save to local data
  get organisationFilter(): string {
    return this.localData.organisationFilter;
  }

  set organisationFilter(value: string) {
    this.localData.organisationFilter = value;
  }

  get organisationTypeID(): OrganisationTypes {
    return this.localData.organisationTypeID;
  }

  set organisationTypeID(value: OrganisationTypes) {
    this.localData.organisationTypeID = value;
  }

  alreadyMember = true;

  constructor(
    public appData: AppDataService,
    private localData: LocalDataService,
    private lookupsService: LookupsService,
    private groupsService: OrganisationsService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.lookupsService.OrganisationTypes().subscribe({
      next: organisationTypes => (this.organisationTypes = organisationTypes)
    });
  }

  ngAfterViewInit() {
    // Debounce the keyup outside of angular zone
    // This is just for delayed search
    this.ngZone.runOutsideAngular(() => {
      this.orgSearch$ = fromEvent<KeyboardEvent>(
        this.trvOrgSearch?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe({
          next: key => {
            if (!globals.KeyRestrictions.includes(key.key)) {
              if (this.organisationFilter.length >= 3) this.Refresh(); // "As-is"
            }
          }
        });
    });
  }

  FetchOrganisations(): void {
    this.error = '';
    if (this.fetchComplete) return;

    this.ngZone.run(_ => (this.waiting = true));

    this.groupsService
      .OrganisationSearch(
        this.organisationTypeID,
        this.organisationFilter,
        this.alreadyMember
      )
      .subscribe({
        next: organisations => {
          this.organisations = organisations;
          if (organisations.length === 0) {
            if (this.organisationFilter) {
              if (this.alreadyMember)
                this.message =
                  'You are not a member of any organisations that match the search';
              else
                this.message =
                  'No organisations are available to join that match the search';
            } else {
              if (this.alreadyMember)
                this.message = 'You are not a member of any organisations';
              else this.message = 'No more organisations are available to join';
            }
          }
          this.fetchComplete = true;
        },
        error: serverError => (this.error = serverError.error.detail),
        complete: () => {
          // Change was triggered outside angular (input debounce)
          // Force view refresh with ngZone.run
          this.ngZone.run(_ => (this.waiting = false));
        }
      });
  }

  AutoFetchOrganisations(): void {
    if (
      this.organisationFilter.length < 3 &&
      this.organisationTypeID != OrganisationTypes.CampaignGroup
    ) {
      // https://stackoverflow.com/questions/27747437/typescript-enum-switch-not-working
      switch (+this.organisationTypeID) {
        case OrganisationTypes.Any:
          this.message =
            'minimum 3 characters required to filter on any organisation';
          break;
        case OrganisationTypes.Party:
          this.message =
            'minimum 3 characters required to filter on political parties';
          break;
      }
      return;
    }
    this.FetchOrganisations();
  }

  ClearFilter() {
    this.localData.organisationFilter = '';
    this.fetchComplete = false;
    this.organisations = [];
    this.message = '';
    this.error = '';
  }

  Refresh(): void {
    this.fetchComplete = false;
    this.organisations = [];
    this.message = '';
    this.error = '';

    this.AutoFetchOrganisations();
  }

  ngOnDestroy() {
    this.orgSearch$?.unsubscribe();
  }
}
