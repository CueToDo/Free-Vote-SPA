// Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// Material
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

// rxjs
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  of,
  switchMap
} from 'rxjs';

// Models
import { Candidate } from 'src/app/models/candidate.model';

// Services
import { DemocracyClubService } from 'src/app/services/democracy-club.service';

// Globals
import * as globals from 'src/app/globals';
import { PartySelectComponent } from '../party-select/party-select.component';
import { Kvp } from 'src/app/models/kvp.model';
import { CandidateComponent } from '../candidate/candidate.component';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-candidate-add',
    templateUrl: './candidate-add.component.html',
    styleUrls: ['./candidate-add.component.css'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule, FormsModule, NgIf, NgFor, CandidateComponent]
})
export class CandidateAddComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trvPoliticianSearch', { static: true }) trvPoliticianSearch:
    | ElementRef
    | undefined;

  politicianNameEntry$: Subscription | undefined;
  politicianSearch$: Subscription | undefined;

  politicianNameLike = '';

  candidates: Candidate[] = [];

  partiesMajor$: Subscription | undefined;

  searching = false;
  error = '';

  constructor(
    private democracyClubService: DemocracyClubService,
    private ngZone: NgZone,
    private candidateAddDialogRef: MatDialogRef<CandidateAddComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      electionID: number;
      constituency: string;
      constituencyID: number;
    },
    public matDialog: MatDialog
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    // Debounce the keyup outside of angular zone
    // This is just for delayed search
    this.ngZone.runOutsideAngular(() => {
      this.politicianNameEntry$ = fromEvent<KeyboardEvent>(
        this.trvPoliticianSearch?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe({
          next: key => {
            if (!globals.KeyRestrictions.includes(key.key)) {
              this.politicianSearch(true);
            }
          }
        });
    });
  }

  // Courtesy Bard!
  toTitleCase(input: string): string {
    return input
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  politicianSearch(auto: boolean) {
    this.ngZone.run(_ => {
      if (!this.politicianNameLike || this.politicianNameLike.length < 3) {
        if (auto) return;
        this.error =
          'Please enter at least 3 characters of the candidates name';
        return;
      }

      this.error = '';
      this.searching = true;

      this.politicianSearch$ = this.democracyClubService
        .ElectionCandidateSearch(this.politicianNameLike, false, false)
        .subscribe({
          next: (value: Candidate[]) => {
            this.candidates = value;

            if (value.length === 0) {
              this.error = `No candidates found matching this name: "${this.politicianNameLike}"`;
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

  ElectionCandidateAdd(politicianID: number): void {
    if (politicianID == 0) {
      this.politicianNameLike = this.toTitleCase(this.politicianNameLike);
      if (
        confirm(`Create new politician with name "${this.politicianNameLike}"?`)
      ) {
        this.democracyClubService
          .PoliticianAdd(0, this.politicianNameLike, 0)
          .subscribe({
            next: () => {
              this.politicianSearch(true);
            },
            error: error => this.ShowError(error)
          });
      }
      return;
    }
    const politician = this.candidates.filter(
      c => c.politicianID == politicianID
    )[0];

    if (politician.partyID == 0) {
      // Must get user to select party before adding candidate to election
      let partySelectDialogConfig = new MatDialogConfig();
      partySelectDialogConfig.disableClose = true;
      partySelectDialogConfig.maxWidth = '90vw';
      partySelectDialogConfig.maxHeight = '90vh';
      partySelectDialogConfig.data = { name: politician.name };

      const partySelectDialogRef = this.matDialog.open(
        PartySelectComponent,
        partySelectDialogConfig
      );

      partySelectDialogRef
        .afterClosed()
        .pipe(
          switchMap((party: Kvp) => {
            if (party.value == 0) {
              return of(false);
            }
            politician.partyID = party.value;
            return this.democracyClubService.ElectionCandidateAdd(
              this.data.electionID,
              this.data.constituencyID,
              politicianID,
              politician.partyID
            );
          })
        )
        .subscribe({
          next: added => {
            if (added) {
              this.candidateAddDialogRef.disableClose = false;
              this.candidateAddDialogRef.close(added);
            }
          },
          error: error => this.ShowError(error)
        });
    } else {
      // No need to open dialog for party
      this.democracyClubService
        .ElectionCandidateAdd(
          this.data.electionID,
          this.data.constituencyID,
          politicianID,
          politician.partyID
        )
        .subscribe({
          next: added => {
            this.candidateAddDialogRef.disableClose = false;
            this.candidateAddDialogRef.close(added);
          },
          error: error => this.ShowError(error)
        });
    }
  }

  Clear() {
    this.politicianNameLike = '';
    this.candidates = [];
    this.error = '';
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

  ngOnDestroy() {
    this.politicianNameEntry$?.unsubscribe();
    this.politicianSearch$?.unsubscribe();
    this.partiesMajor$?.unsubscribe();
  }
}
