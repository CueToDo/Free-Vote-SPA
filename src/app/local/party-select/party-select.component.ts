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

export interface DialogData {
  name: string;
}

@Component({
  selector: 'app-party-select',
  templateUrl: './party-select.component.html',
  styleUrls: ['./party-select.component.css']
})
export class PartySelectComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trvMinorPartySearch', { static: true }) trvMinorPartySearch:
    | ElementRef
    | undefined;

  partyID = 0;

  partiesMajor: Kvp[] = [];
  partiesMinor: Kvp[] = [];

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
          this.partyID = value[0].value;
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

  partySelected(): void {
    this.dialogRef.close(this.partyID);
  }

  minorPartySelected(partyID: number): void {
    this.partyID = partyID;
    this.partySelected();
  }

  cancel(): void {
    this.dialogRef.close(0);
  }

  ngOnDestroy(): void {
    this.partiesMinorSearch$?.unsubscribe();
  }
}
