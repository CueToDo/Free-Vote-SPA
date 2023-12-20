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
  @Input() CurrentMembership = false;

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

  get MinFilterLength(): boolean {
    if (this.organisationFilter.length == 0) return false; // Don't search, but don't show error
    if (this.organisationFilter.length < 3) {
      this.error = 'Minimum 3 characters required for search';
      return false;
    }
    return true;
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

  FetchMemberOrganisations(): void {
    this.error = '';
    if (this.fetchComplete) return;

    this.ngZone.run(_ => (this.waiting = true));

    this.groupsService
      .OrganisationMembership(this.organisationFilter, this.organisationTypeID)
      .subscribe({
        next: organisations => {
          this.organisations = organisations;
          if (organisations.length === 0) {
            if (this.organisationFilter) {
              this.message =
                'You are not a member of any organisations that match the search';
            } else {
              this.message = 'You are not a member of any organisations';
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

  AutoFetchMemberOrganisations(): void {
    if (!this.MinFilterLength) return;

    this.FetchMemberOrganisations();
  }

  FetchOrganisationsAvailable(): void {
    this.error = '';
    if (this.fetchComplete) return;
    if (!this.MinFilterLength) return;

    this.ngZone.run(_ => (this.waiting = true));

    this.groupsService
      .OrganisationsAvailable(this.organisationFilter)
      .subscribe({
        next: organisations => {
          this.organisations = organisations;
          if (organisations.length === 0) {
            if (this.organisationFilter) {
              this.message =
                'No organisations are available to join that match the search';
            } else {
              this.message = 'No more organisations are available to join';
            }
          }
          this.fetchComplete = true;
        },
        error: serverError => (this.error = serverError.error.detail),
        complete: () => {
          // Force view refresh with ngZone.run
          this.ngZone.run(_ => (this.waiting = false));
        }
      });
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

    if (this.CurrentMembership) {
      this.AutoFetchMemberOrganisations();
    } else {
      this.FetchOrganisationsAvailable();
    }
  }

  ngOnDestroy() {
    this.orgSearch$?.unsubscribe();
  }
}
