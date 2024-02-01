// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription, of, switchMap, take } from 'rxjs';

// Models
import { Candidate } from 'src/app/models/candidate';
import { Constituency } from 'src/app/models/constituency';
import { ElectionDate } from 'src/app/models/electionDate';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { DemocracyClubService } from 'src/app/services/democracy-club.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CandidateAddComponent } from '../candidate-add/candidate-add.component';

@Component({
  selector: 'app-constituency',
  templateUrl: './constituency.component.html',
  styleUrls: ['./constituency.component.css']
})
export class ConstituencyComponent implements OnInit, OnDestroy {
  searching = false;
  dateChange = false;
  error = '';
  candidateRemoveError = '';

  private candidates$: Subscription | undefined;

  constituencyDetails = new Constituency();

  candidates: Candidate[] = [];
  MPs: Candidate[] = [];
  candidateSelected = '';

  get constituencyUrl(): string {
    // We only have mapItConstituencyIDs where these have been retrieved by PostCode
    // No known way to do this by constituency name
    if (this.constituencyDetails.mapItConstituencyID == 0) return '';
    return `https://mapit.mysociety.org/area/${this.constituencyDetails.mapItConstituencyID}.html`;
  }

  electionDate = '';
  ElectionDates: ElectionDate[] = [];

  get electionSelected(): ElectionDate | null {
    if (!this.ElectionDates || this.ElectionDates.length == 0) return null;
    return this.ElectionDates.filter(
      s => s.electionDate == this.electionDate
    )[0];
  }

  get electionIDSelected(): number {
    if (!this.electionSelected) return 0;
    return this.electionSelected.electionID;
  }

  get isFutureElection(): boolean {
    if (
      !this.electionDate ||
      !this.ElectionDates ||
      this.ElectionDates.length == 0
    )
      return false;
    const electionDateSelected = new Date(this.electionDate);
    const now = new Date();
    return electionDateSelected.getTime() > now.getTime();
  }

  get showRemoveButton(): boolean {
    return (
      this.isFutureElection &&
      this.localData.freeVoteProfile.email == 'alex@q2do.com'
    );
  }

  get constituencyIDSelected(): number {
    if (!this.electionSelected) return 0;
    return this.electionSelected.constituencyID;
  }

  get constituencySelected(): string {
    if (!this.electionSelected) return '';

    var selected = this.electionSelected?.constituency;

    if (selected == this.constituencyDetails.constituency) return '';

    return selected;
  }

  politician(politicianID: number): string {
    const candidate = this.candidates.filter(
      c => c.politicianID == politicianID
    )[0];
    if (!candidate) return '';
    return candidate.name;
  }

  // Was this constituency subject to a name/boundary chnage in 2023 review?
  get boundaryChange2023(): boolean {
    return (
      this.constituencyDetails.boundaryReview == 1 &&
      this.constituencyDetails.nameChangeThisReview
    );
  }

  wikiLinkToBoundaryChanges =
    'https://en.wikipedia.org/wiki/2023_Periodic_Review_of_Westminster_constituencies';

  get compassWA1Link(): string {
    if (!!this.constituencyDetails.gen0GSS)
      return `https://winasone.org.uk/constituency/${this.constituencyDetails.gen0GSS}`;
    return '';
  }

  get pollingReportLink(): string {
    if (!!this.constituencyDetails.gen0GSS)
      return `https://pollingreport.uk/seats/${this.constituencyDetails.gen0GSS}`;
    return '';
  }

  private whoCanIVoteForSamplePostCode = '';

  get whoCanIVoteFor(): string {
    if (!this.whoCanIVoteForSamplePostCode) return '';

    const postcode = encodeURIComponent(this.whoCanIVoteForSamplePostCode);
    return `https://whocanivotefor.co.uk/elections/${postcode}`;
  }

  // ElectoralCalculus predicts result of 2024 election and can be shown in following cases:
  // Only using new constituencies after boundary change

  // Link to the ElectoralCalculus website - won't necessarily be shown
  get electoralCalculus(): string {
    var constituency = this.constituencyDetails.constituency;
    return `https://www.electoralcalculus.co.uk/fcgi-bin/calcwork23.py?seat=${constituency}`;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    private appData: AppDataService,
    private democracyClubService: DemocracyClubService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searching = true;

    const routeParams = this.activatedRoute.snapshot.params;

    var constituencyName = this.appData.unKebabUri(routeParams['constituency']);
    this.electionDate = this.appData.unKebabUri(routeParams['electionDate']);

    this.candidateSelected = decodeURIComponent(
      this.appData.unKebabUri(routeParams['candidateName'])
    );

    var constituencyLookup = this.democracyClubService
      .Constituency(constituencyName) // from this observable
      .pipe(
        switchMap(constituency => {
          this.constituencyDetails = constituency; // map
          // switch to another observable (which depends on previous)
          return this.democracyClubService.ElectedPreviously(
            constituency.constituencyID
          );
        }),
        switchMap(MPs => {
          this.MPs = MPs; // map
          // switch to another (unrelated) observable
          if (
            this.constituencyDetails.constituency ==
            this.localData.freeVoteProfile.constituency
          )
            return of(this.localData.freeVoteProfile.postcode);

          return this.democracyClubService.ConstituencySamplePostCode(
            this.constituencyDetails.constituencyID,
            this.constituencyDetails.constituency
          );
        }),
        switchMap(samplePostCode => {
          this.whoCanIVoteForSamplePostCode = samplePostCode; // map
          // switch to another (unrelated) observable
          return this.democracyClubService.ConstituencyElectionDates(
            this.constituencyDetails.constituency
          );
        }),
        switchMap((dates: ElectionDate[]) => {
          this.ElectionDates = dates; // map

          // and switch to another observable (which depends on previous)
          if (!dates || dates.length == 0) {
            return of([]); // return empty candidates array for new constituencies
          }

          if (!this.electionDate) {
            this.electionDate = dates[0].electionDate;
          }

          return this.democracyClubService.ElectionCandidates(
            this.constituencyIDSelected,
            this.electionDate
          );
        })
      );

    // Subscribe to the Observable<Candidate[]>
    this.candidates$ = constituencyLookup.subscribe({
      next: candidates => {
        this.candidates = candidates;
        this.searching = false;
      },
      complete: () => {
        this.searching = false;
      },
      error: serverError => {
        this.error = serverError?.error?.detail;
        this.searching = false;
      }
    });
  }

  ReselectCandidates() {
    this.dateChange = true;

    this.candidates$ = this.democracyClubService
      .ElectionCandidates(this.constituencyIDSelected, this.electionDate)
      .pipe(take(1))
      .subscribe({
        next: candidates => (this.candidates = candidates),
        error: serverError => (this.error = serverError.error.detail),
        complete: () => (this.dateChange = false)
      });
  }

  AddCandidate(): void {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      constituency: this.constituencyDetails.constituency,
      constituencyID: this.constituencyDetails.constituencyID
    };
    dialogConfig.minWidth = '600px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.maxHeight = '90vh';

    const dialogRef = this.dialog.open(CandidateAddComponent, dialogConfig);

    dialogRef.afterClosed().subscribe({
      next: (added: boolean) => {
        if (!!added) {
          this.ReselectCandidates();
        }
      }
    });
  }

  ElectionCandidateRemove(politicianID: number): void {
    this.candidateRemoveError = '';

    if (
      !confirm(
        `Are you sure you wish to remove ${this.politician(
          politicianID
        )} from the election on ${this.electionDate} in ${
          this.constituencyDetails.constituency
        }?`
      )
    )
      return;

    this.democracyClubService
      .ElectionCandidateRemove(
        this.electionIDSelected,
        this.constituencyDetails.constituencyID,
        politicianID
      )
      .pipe(take(1))
      .subscribe({
        next: () => this.ReselectCandidates(),
        error: serverError => this.ShowCandidateRemoveError(serverError)
      });
  }

  ShowCandidateRemoveError(err: any) {
    this.searching = false;

    if (err?.error?.detail) {
      this.candidateRemoveError = err.error.detail;
    } else if (err?.error) {
      this.candidateRemoveError = err.error;
    } else if (err) {
      this.candidateRemoveError = err;
    }
  }

  ngOnDestroy(): void {
    if (this.candidates$) {
      this.candidates$.unsubscribe();
    }
  }
}
