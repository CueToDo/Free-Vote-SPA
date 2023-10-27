// Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';

// GLobals
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

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent implements AfterViewInit, OnDestroy {
  @Input() CurrentMembership = false;

  public organisations: Organisation[] = [];
  public organisationCount = 0;
  public organisationFilter = '';
  public waiting = false;
  public message = '';
  public error = '';

  // https://medium.com/better-programming/angular-manipulate-properly-the-dom-with-renderer-16a756508cba
  @ViewChild('trvOrgSearch', { static: false }) trvOrgSearch:
    | ElementRef
    | undefined;

  orgSearch$: Subscription | undefined;

  constructor(
    public appData: AppDataService,
    private groupsService: OrganisationsService,
    private ngZone: NgZone
  ) {}

  @Input() Refresh(): void {
    this.organisations = [];
    this.waiting = true;
    this.message = '';
    this.error = '';

    if (this.CurrentMembership) {
      this.groupsService
        .OrganisationMembership(this.organisationFilter)
        .subscribe({
          next: groups => {
            this.organisations = groups;
            this.organisationCount = groups.length;
            if (this.organisationCount === 0) {
              if (this.organisationFilter) {
                this.message =
                  'You are not a member of any groups that match the search';
              } else {
                this.message = 'You are not a member of any groups';
              }
            }
          },
          error: serverError => (this.error = serverError.error.detail),
          complete: () => {
            // Change was triggered outside angular (input debounce)
            // Force view refresh with ngZone.run
            this.ngZone.run(_ => (this.waiting = false));
          }
        });
    } else {
      this.groupsService
        .OrganisationsAvailable(this.organisationFilter)
        .subscribe({
          next: groups => {
            this.organisations = groups;
            this.organisationCount = groups.length;
            if (this.organisationCount === 0) {
              if (this.organisationFilter) {
                this.message =
                  'No organisations are available to join that match the search';
              } else {
                this.message = 'No more organisations are available to join';
              }
            }
          },
          error: serverError => (this.error = serverError.error.detail),
          complete: () => {
            // Force view refresh with ngZone.run
            this.ngZone.run(_ => (this.waiting = false));
          }
        });
    }
  }

  ngAfterViewInit() {
    // Debounce the keyup outside of angular zone
    // 2-way databinding already cleans up the slashtag
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
              // Fuzzy search on userInput
              this.Refresh(); // "As-is"
            }
          }
        });
    });
  }

  ngOnDestroy() {
    this.orgSearch$?.unsubscribe();
  }
}
