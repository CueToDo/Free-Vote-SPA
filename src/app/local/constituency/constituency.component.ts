// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

// rxjs
import { Subscription, of, switchMap, take } from 'rxjs';

// Models
import { Candidate } from 'src/app/models/candidate.model';
import { Constituency } from 'src/app/models/constituency.model';
import { ElectionDate } from 'src/app/models/electionDate';

// Services
import { BasicService } from 'src/app/services/basic.service';
import { CandidateAddComponent } from '../candidate-add/candidate-add.component';
import { DemocracyClubService } from 'src/app/services/democracy-club.service';
import { HttpExtraService } from 'src/app/services/http-extra.service';
import { LocalDataService } from 'src/app/services/local-data.service';

// Components
import { CandidateComponent } from '../candidate/candidate.component';

@Component({
  selector: 'app-constituency',
  templateUrl: './constituency.component.html',
  styleUrls: ['./constituency.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgFor,
    CandidateComponent,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ]
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

  get showAddButton(): boolean {
    return (
      this.isFutureElection &&
      this.localData.freeVoteProfile.email == 'alex@q2do.com'
    );
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

  get allowViewVoteShare(): boolean {
    const parsedDate = new Date(this.electionDate);
    const today = new Date();
    return parsedDate < today;
  }

  get findThatPostCode(): string {
    return `https://findthatpostcode.uk/areas/${this.constituencyDetails.gss}.html`;
  }

  // Assuming DemocracyClub now using latest constituency GSS
  get importCandidatesForGSS(): string {
    return `https://localhost:44389/democracyClub/ImportCandidatesForGSS/${this.constituencyDetails.gss}`;
  }

  showVoteShare = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private basicService: BasicService,
    public localData: LocalDataService,
    private democracyClubService: DemocracyClubService,
    public dialog: MatDialog,
    private httpXS: HttpExtraService
  ) {}

  ngOnInit(): void {
    this.searching = true;

    const routeParams = this.activatedRoute.snapshot.params;

    var constituencyName = this.httpXS.unKebabUri(routeParams['constituency']);
    this.electionDate = this.httpXS.unKebabUri(routeParams['electionDate']);

    this.candidateSelected = decodeURIComponent(
      this.httpXS.unKebabUri(routeParams['candidateName'])
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
            this.constituencyDetails.constituency == this.localData.Constituency
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

  ReselectMPs() {
    this.searching = true;

    this.democracyClubService
      .ElectedPreviously(this.constituencyDetails.constituencyID)
      .subscribe({
        next: MPs => {
          this.MPs = MPs;
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
      electionID: this.electionIDSelected,
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
        error: serverError =>
          (this.candidateRemoveError = this.basicService.getError(serverError))
      });
  }

  ToggleShowVoteShare() {
    this.showVoteShare = !this.showVoteShare;
  }

  ngOnDestroy(): void {
    if (this.candidates$) {
      this.candidates$.unsubscribe();
    }
  }
}
