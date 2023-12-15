// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription, concatMap, map, of, switchMap } from 'rxjs';

// Models
import { Candidate, CandidateSearchResult } from 'src/app/models/candidate';
import { Constituency } from 'src/app/models/constituency';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { DemocracyClubService } from 'src/app/services/democracy-club.service';

@Component({
  selector: 'app-constituency',
  templateUrl: './constituency.component.html',
  styleUrls: ['./constituency.component.css']
})
export class ConstituencyComponent implements OnInit, OnDestroy {
  searching = false;
  dateChange = false;
  error = '';

  private candidates$: Subscription | undefined;

  constituencyDetails = new Constituency();
  get newConstituency(): boolean {
    return (
      this.constituencyDetails.post2023 && !this.constituencyDetails.pre2023
    );
  }
  get discontinuedConstituency(): boolean {
    return (
      !this.constituencyDetails.post2023 && this.constituencyDetails.pre2023
    );
  }
  get nameChange(): boolean {
    return this.constituencyDetails.oldName != this.constituencyDetails.newName;
  }
  get isNew(): boolean {
    return (
      this.constituencyDetails.constituency == this.constituencyDetails.newName
    );
  }
  get otherName(): string {
    if (this.isNew) return this.constituencyDetails.oldName;
    return this.constituencyDetails.newName;
  }

  candidates: Candidate[] = [];
  exMPs: Candidate[] = [];
  candidateSelected = '';

  get constituencyUrl(): string {
    // We only have mapItConstituencyIDs where these have been retrieved by PostCode
    // No known way to do this by constituency name
    if (this.constituencyDetails.mapItConstituencyID == '0') return '';
    return `https://mapit.mysociety.org/area/${this.constituencyDetails.mapItConstituencyID}.html`;
  }

  electionDate = '';
  ElectionDates: string[] = [];

  get currentMP(): Candidate {
    var mp = new Candidate();
    mp.name = this.constituencyDetails.politician;
    mp.electedOnOrBefore = this.constituencyDetails.electedOnOrBefore;
    mp.party = this.constituencyDetails.party;
    mp.partyWebsite = this.constituencyDetails.partyWebsite;
    mp.image = this.constituencyDetails.politicianImage;
    mp.twfyUrl = `https://www.theyworkforyou.com${this.constituencyDetails.politicianTwfyUrl}`;

    var searchText = this.constituencyDetails.politician;
    mp.ukParliamentUrl = `https://members.parliament.uk/members/Commons?SearchText=${searchText}&ForParliament=Current`;

    if (
      this.constituencyDetails.constituencyID ==
      this.localData.ConstituencyIDVoter
    ) {
      mp.writeToThemUrl = this.writeToThem;
    }

    mp.personalUrl = this.constituencyDetails.politicianWebsite;
    return mp;
  }

  get writeToThem(): string {
    var pc = this.localData.freeVoteProfile.postcode.replace(' ', '+');
    var referrer = encodeURIComponent(this.localData.websiteUrlWTS);
    // mapit MemberID does not match They Work For You ID
    // who=${this.twfyMemberID}&
    return `https://www.writetothem.com/write?a=westminstermp&pc=${pc}&fyr_extref=${referrer}`;
  }

  get whoCanIVoteFor(): string {
    const postcode = encodeURIComponent(this.samplePostCode);
    if (!!postcode) return `https://whocanivotefor.co.uk/elections/${postcode}`;
    return '';
  }

  get electoralCalculus(): string {
    var constituency = this.constituencyDetails.constituency;
    if (!!this.constituencyDetails.newName)
      constituency = this.constituencyDetails.newName;
    return `https://www.electoralcalculus.co.uk/fcgi-bin/calcwork23.py?seat=${constituency}`;
  }

  private samplePostCode = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    private appData: AppDataService,
    private lookupsService: LookupsService,
    private democracyClubService: DemocracyClubService
  ) {}

  ngOnInit(): void {
    this.searching = true;

    const routeParams = this.activatedRoute.snapshot.params;

    var constituencyName = this.appData.unKebabUri(routeParams['constituency']);
    var electionDate = this.appData.unKebabUri(routeParams['electionDate']);
    this.candidateSelected = decodeURIComponent(
      this.appData.unKebabUri(routeParams['candidateName'])
    );

    var constituencyLookup = this.lookupsService
      .Constituency(constituencyName) // from this observable
      .pipe(
        switchMap(constituency => {
          this.constituencyDetails = constituency; // map

          // switch to another observable (which depends on previous)
          return this.democracyClubService.ElectedPreviously(
            constituency.constituencyID,
            constituency.politicianID
          );
        }),
        switchMap(exMPs => {
          this.exMPs = exMPs; // map

          // switch to another (unrelated) observable
          if (
            this.constituencyDetails.constituency ==
            this.localData.freeVoteProfile.constituency
          )
            return of(this.localData.freeVoteProfile.postcode);

          return this.democracyClubService.ConstituencySamplePostCode(
            this.constituencyDetails.constituencyID
          );
        }),
        switchMap(samplePostCode => {
          this.samplePostCode = samplePostCode; // map

          // switch to another (unrelated) observable
          return this.democracyClubService.ConstituencyElectionDates(
            this.constituencyDetails.constituency
          );
        }),
        switchMap(dates => {
          this.ElectionDates = dates; // map
          // and switch to another observable (which depends on previous)
          if (!!electionDate) this.electionDate = electionDate;
          else this.electionDate = dates[dates.length - 1];

          return this.democracyClubService.Candidates(
            this.constituencyDetails.constituencyID.toString(),
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
      error: serverError => {
        this.error = serverError.error.detail;
        this.searching = false;
      }
    });
  }

  onDateChange() {
    this.dateChange = true;
    this.candidates$ = this.democracyClubService
      .Candidates(
        this.constituencyDetails.constituencyID.toString(),
        this.electionDate
      )
      .subscribe({
        next: candidates => (this.candidates = candidates),
        error: serverError => (this.error = serverError.error.detail),
        complete: () => (this.dateChange = false)
      });
  }

  ngOnDestroy(): void {
    if (this.candidates$) {
      this.candidates$.unsubscribe();
    }
  }
}
