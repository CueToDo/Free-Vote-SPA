import { Constituency } from 'src/app/models/constituency';
// Angular
import { Component } from '@angular/core';

// Models
import { Kvp } from 'src/app/models/kvp.model';
import { LocalDataService } from 'src/app/services/local-data.service';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LookupsService } from 'src/app/services/lookups.service';

@Component({
  selector: 'app-constituency-search',
  templateUrl: './constituency-search.component.html',
  styleUrls: ['./constituency-search.component.css']
})
export class ConstituencySearchComponent {
  constituencySearch = '';
  postcodeSearch = '';
  fetchingConstituencies = false;
  constituenciesFetched = false;

  get constituencyCount(): number {
    if (!this.localData.constituencies) return 0;
    return this.localData.constituencies.length;
  }

  public error = '';

  constructor(
    public localData: LocalDataService,
    private appData: AppDataService,
    private lookupsService: LookupsService
  ) {}

  clearConstituencySearch() {
    this.constituencySearch = '';
    this.localData.constituencies = [];
  }

  clearPostcodeSearch() {
    this.postcodeSearch = '';
    this.localData.constituencies = [];
  }

  // Search by name - no longer used
  ConstituencySearch(): void {
    this.error = '';
    this.localData.constituencies = [];

    if (!this.constituencySearch || this.constituencySearch.length < 3) {
      this.error = 'Please enter at least 3 characters for the search';
      return;
    }
    this.fetchingConstituencies = true;
    this.constituenciesFetched = false;

    this.lookupsService.ConstituencySearch(this.constituencySearch).subscribe({
      next: value => {
        this.localData.constituencies = value; // new filtered list
        this.constituenciesFetched = true;

        if (this.constituencyCount === 0) {
          this.error = 'No constituencies found';
        }
      },
      error: err => {
        this.ShowError(err);
      },
      complete: () => {
        this.fetchingConstituencies = false;
      }
    });
  }

  PostcodeSearch(): void {
    this.error = '';
    this.localData.constituencies = [];

    if (!this.postcodeSearch || this.postcodeSearch.length < 5) {
      this.error = 'Please enter the full post code';
      return;
    }
    this.fetchingConstituencies = true;
    this.constituenciesFetched = false;

    this.lookupsService.ConstituencyForPostcode(this.postcodeSearch).subscribe({
      next: (value: Kvp) => {
        this.localData.constituencies.push(value);
        this.constituenciesFetched = true;

        if (this.constituencyCount === 0) {
          this.error = 'Constituency not found for this postcode';
        }
      },
      error: err => {
        this.ShowError(err);
      },
      complete: () => {
        this.fetchingConstituencies = false;
      }
    });
  }

  ShowError(err: any): void {
    this.fetchingConstituencies = false;

    if (err?.error?.detail) {
      this.error = err.error.detail;
    } else if (err?.error) {
      this.error = err.error;
    } else if (err) {
      this.error = err;
    }
  }

  // Ensure get whitespace right in template (autoformating was affecting this)
  RL(key: string) {
    return `/constituency/${this.appData.kebabUri(key)}`;
  }
}
