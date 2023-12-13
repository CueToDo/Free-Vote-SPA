import { DemocracyClubService } from 'src/app/services/democracy-club.service';
import { Constituency } from 'src/app/models/constituency';
// Angular
import { Component } from '@angular/core';

// Models
import { Kvp } from 'src/app/models/kvp.model';
import { LocalDataService } from 'src/app/services/local-data.service';
import { CandidateSearchResult } from 'src/app/models/candidate';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LookupsService } from 'src/app/services/lookups.service';

@Component({
  selector: 'app-constituency-search',
  templateUrl: './constituency-search.component.html',
  styleUrls: ['./constituency-search.component.css']
})
export class ConstituencySearchComponent {
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
    private democracyClubService: DemocracyClubService
  ) {}

  clearSearch() {
    this.error = '';
    this.constituencySearch = '';
    this.postcodeSearch = '';
    this.candidateSearch = '';
    this.localData.constituencies = [];
    this.localData.candidateSearchResults = [];
  }

  // Search by name - no longer used
  ConstituencySearch(): void {
    this.error = '';
    this.localData.constituencies = [];
    this.localData.candidateSearchResults = [];

    if (!this.constituencySearch || this.constituencySearch.length < 3) {
      this.error = 'Please enter at least 3 characters for the search';
      return;
    }
    this.searching = true;

    this.lookupsService.ConstituencySearch(this.constituencySearch).subscribe({
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
        this.searching = false;
      }
    });
  }

  PostcodeSearch(): void {
    this.error = '';
    this.localData.constituencies = [];
    this.localData.candidateSearchResults = [];

    if (!this.postcodeSearch || this.postcodeSearch.length < 5) {
      this.error = 'Please enter the full post code';
      return;
    }
    this.searching = true;

    this.lookupsService.ConstituencyForPostcode(this.postcodeSearch).subscribe({
      next: (value: Kvp) => {
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
    this.error = '';
    this.localData.constituencies = [];
    this.localData.candidateSearchResults = [];

    if (!this.candidateSearch || this.candidateSearch.length < 4) {
      this.error = 'Please enter at least 4 characters of the candidates name';
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

  constituencyDateLink(constituency: string, electionDate: string) {
    const kebabDate = this.appData.kebabUri(electionDate);
    return `${this.constituencyLink(constituency)}/${kebabDate}`;
  }
}
