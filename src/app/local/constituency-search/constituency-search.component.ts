// Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';

// rxjs
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  fromEvent
} from 'rxjs';

// Globals
import * as globals from 'src/app/globals';

// Models
import { CandidateSearchResult } from 'src/app/models/candidate';
import { Kvp } from 'src/app/models/kvp.model';
import { LocalDataService } from 'src/app/services/local-data.service';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { DemocracyClubService } from 'src/app/services/democracy-club.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { unsubscribe } from 'diagnostics_channel';
import { Constituency } from 'src/app/models/constituency';

@Component({
  selector: 'app-constituency-search',
  templateUrl: './constituency-search.component.html',
  styleUrls: ['./constituency-search.component.css']
})
export class ConstituencySearchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trvConstituencySearch', { static: true }) trvConstituencySearch:
    | ElementRef
    | undefined;

  @ViewChild('trvPostcodeSearch', { static: true }) trvPostcodeSearch:
    | ElementRef
    | undefined;

  @ViewChild('trvCandidateSearch', { static: true }) trvCandidateSearch:
    | ElementRef
    | undefined;

  constituencySearch$: Subscription | undefined;
  postCodeKeyUp$: Subscription | undefined;
  candidateSearch$: Subscription | undefined;

  // Search values
  constituencySearch = '';
  postcodeSearch = '';
  candidateSearch = '';

  searching = false;

  get constituencyCount(): number {
    if (!this.localData.constituencies) return 0;
    return this.localData.constituencies.length;
  }

  get candidateCount(): number {
    if (!this.localData.candidateSearchResults) return 0;
    return this.localData.candidateSearchResults.length;
  }

  public error = '';

  constructor(
    public localData: LocalDataService,
    private appData: AppDataService,
    private lookupsService: LookupsService,
    private democracyClubService: DemocracyClubService,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    // Debounce the keyup outside of angular zone
    // 2-way databinding already cleans up the slashtag
    // This is just for delayed search
    this.ngZone.runOutsideAngular(() => {
      this.constituencySearch$ = fromEvent<KeyboardEvent>(
        this.trvConstituencySearch?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe({
          next: key => {
            this.error = '';
            if (!globals.KeyRestrictions.includes(key.key)) {
              this.ConstituencySearch();
            }
          }
        });

      // Just clear the previous error if user switches to postcode search
      this.postCodeKeyUp$ = fromEvent<KeyboardEvent>(
        this.trvPostcodeSearch?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe({
          next: _ => {
            this.ngZone.run(_ => {
              this.constituencySearch = '';
              this.candidateSearch = '';
              this.localData.candidateSearchResults = [];
            });
          }
        });

      this.candidateSearch$ = fromEvent<KeyboardEvent>(
        this.trvCandidateSearch?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe({
          next: key => {
            this.error = '';
            if (!globals.KeyRestrictions.includes(key.key)) {
              this.CandidateSearch();
            }
          }
        });
    });
  }

  clearSearch() {
    this.error = '';
    this.constituencySearch = '';
    this.postcodeSearch = '';
    this.candidateSearch = '';
    this.localData.constituencies = [];
    this.localData.candidateSearchResults = [];
  }

  ConstituencySearch(): void {
    this.ngZone.run(_ => {
      this.error = '';
      this.postcodeSearch = '';
      this.candidateSearch = '';
      this.localData.constituencies = [];
      this.localData.candidateSearchResults = [];

      if (!this.constituencySearch || this.constituencySearch.length < 3) {
        this.error = 'Please enter at least 3 characters for the search';
        return;
      }

      this.searching = true;

      this.lookupsService
        .ConstituencySearch(this.constituencySearch)
        .subscribe({
          next: value => {
            this.localData.constituencies = value; // new filtered list

            if (this.constituencyCount === 0) {
              this.error = 'No constituencies found';
            }
          },
          error: err => {
            this.ShowError(err);
          },
          complete: () => {
            // Change was triggered outside angular (input debounce)
            // Force view refresh with ngZone.run
            this.ngZone.run(_ => (this.searching = false));
          }
        });
    });
  }

  PostcodeSearch(): void {
    this.error = '';
    this.constituencySearch = '';
    this.candidateSearch = '';
    this.localData.constituencies = [];
    this.localData.candidateSearchResults = [];

    if (!this.postcodeSearch || this.postcodeSearch.length < 5) {
      this.error = 'Please enter the full post code';
      return;
    }
    this.searching = true;

    this.lookupsService.ConstituencyForPostcode(this.postcodeSearch).subscribe({
      next: (value: Constituency) => {
        this.localData.constituencies.push(value);

        if (this.constituencyCount === 0) {
          this.error = 'Constituency not found for this postcode';
        }
      },
      error: err => {
        this.ShowError(err);
      },
      complete: () => {
        this.searching = false;
      }
    });
  }

  CandidateSearch() {
    this.ngZone.run(_ => {
      this.error = '';
      this.constituencySearch = '';
      this.postcodeSearch = '';
      this.localData.constituencies = [];
      this.localData.candidateSearchResults = [];

      this.candidateSearch = this.candidateSearch.replace('%', '');

      if (!this.candidateSearch || this.candidateSearch.length < 3) {
        this.error =
          'Please enter at least 3 characters of the candidates name';
        return;
      }
      this.searching = true;

      this.democracyClubService
        .ElectionCandidateSearch(this.candidateSearch)
        .subscribe({
          next: (value: CandidateSearchResult[]) => {
            this.localData.candidateSearchResults = value;

            if (this.candidateCount === 0) {
              this.error = `No candidates found matching this name: "${this.candidateSearch}"`;
            }
          },
          error: err => {
            this.ShowError(err);
          },
          complete: () => {
            this.searching = false;
          }
        });
    });
  }

  ShowError(err: any): void {
    this.searching = false;

    if (err?.error?.detail) {
      this.error = err.error.detail;
    } else if (err?.error) {
      this.error = err.error;
    } else if (err) {
      this.error = err;
    }
  }

  constituencyLink(constituency: string) {
    var kebabConstituency = this.appData.kebabUri(constituency);
    kebabConstituency = kebabConstituency.replace('%2C', ','); // commas acceptable in routerlink
    return `/constituency/${kebabConstituency}`;
  }

  constituencyDateLink(
    constituency: string,
    electionDate: string,
    candidateName: string
  ) {
    const kebabDate = this.appData.kebabUri(electionDate);
    const kebabName = this.appData.kebabUri(candidateName);
    return `${this.constituencyLink(constituency)}/${kebabDate}/${kebabName}`;
  }

  ngOnDestroy() {
    this.constituencySearch$?.unsubscribe();
    this.postCodeKeyUp$?.unsubscribe();
    this.candidateSearch$?.unsubscribe();
  }
}
