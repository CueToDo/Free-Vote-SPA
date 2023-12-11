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
  fetchingConstituencies = false;
  constituenciesFetched = false;
  constituencies: Kvp[] = [];

  get constituencyCount(): number {
    if (!this.constituencies) return 0;
    return this.constituencies.length;
  }

  public error = '';

  constructor(
    public localData: LocalDataService,
    private appData: AppDataService,
    private lookupsService: LookupsService
  ) {}

  clearConstituencySearch() {
    this.constituencySearch = '';
    this.constituencies = [];
  }

  // Search by name - no longer used
  ConstituencySearch(): void {
    if (!this.constituencySearch || this.constituencySearch.length < 3) {
      this.constituencies = [];
      return;
    }
    this.fetchingConstituencies = true;
    this.constituenciesFetched = false;

    this.lookupsService.ConstituencySearch(this.constituencySearch).subscribe({
      next: value => {
        this.constituencies = value; // new filtered list
        this.constituenciesFetched = true;

        if (this.constituencyCount === 1) {
          this.constituencySearch = this.constituencies[0].key;

          this.localData.freeVoteProfile.constituency = this.constituencySearch;
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
