// Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// rxjs
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  take
} from 'rxjs';

// Models
import { Kvp } from 'src/app/models/kvp.model';

// Services
import { DemocracyClubService } from 'src/app/services/democracy-club.service';

// Globals
import * as globals from 'src/app/globals';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DialogData {
  name: string;
}

@Component({
    selector: 'app-party-select',
    templateUrl: './party-select.component.html',
    styleUrls: ['./party-select.component.css'],
    standalone: true,
    imports: [FormsModule, NgFor, MatButtonModule, NgIf]
})
export class PartySelectComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trvMinorPartySearch', { static: true }) trvMinorPartySearch:
    | ElementRef
    | undefined;

  partiesMajor: Kvp[] = [];
  partiesMinor: Kvp[] = [];
  partyIDSelected = 0;

  partiesMinorSearch$: Subscription | undefined;

  searchPartyName = '';
  searching = false;

  error = '';

  constructor(
    private democracyClubService: DemocracyClubService,
    public dialogRef: MatDialogRef<PartySelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.democracyClubService
      .PartiesMajor()
      .pipe(take(1))
      .subscribe({
        next: value => {
          this.partiesMajor = value as Kvp[];
          this.partyIDSelected = value[0].value;
        }
      });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.partiesMinorSearch$ = fromEvent<KeyboardEvent>(
        this.trvMinorPartySearch?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(600), distinctUntilChanged())
        .subscribe({
          next: key => {
            if (!globals.KeyRestrictions.includes(key.key)) {
              this.searchMinorParty(true);
            }
          }
        });
    });
  }

  searchMinorParty(auto: boolean): void {
    if (this.searching) return;

    if (!this.searchPartyName || this.searchPartyName.length < 3) {
      if (auto) return;
      this.error = 'Please enter at least 3 characters for the search';
      return;
    }

    this.ngZone.run(_ => {
      this.error = '';
      this.searching = true;
      this.democracyClubService
        .PartiesMinor(this.searchPartyName)
        .pipe(take(1))
        .subscribe({
          next: parties => {
            this.searching = false;
            this.partiesMinor = parties;
          }
        });
    });
  }

  majorPartySelected() {
    const parties = this.partiesMajor.filter(
      p => p.value == this.partyIDSelected
    );
    const party = parties[0];
    this.partySelected(party);
  }

  minorPartySelected(party: Kvp): void {
    this.partySelected(party);
  }

  partySelected(party: Kvp): void {
    this.dialogRef.close(party);
  }

  cancel(): void {
    const party: Kvp = { key: '', value: 0 };
    this.dialogRef.close(party);
  }

  ngOnDestroy(): void {
    this.partiesMinorSearch$?.unsubscribe();
  }
}
