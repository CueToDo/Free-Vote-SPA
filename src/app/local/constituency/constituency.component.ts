// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription, concatMap, map, of, switchMap } from 'rxjs';

// Models
import { Candidate } from 'src/app/models/candidate';
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
  public error = '';

  private candidates$: Subscription | undefined;

  public constituencyDetails = new Constituency();
  public candidates: Candidate[] = [];

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

  get postcode(): string {
    return this.localData.freeVoteProfile.postcode;
  }

  get nextElection(): string {
    const postcode = encodeURIComponent(this.postcode);
    return `https://whocanivotefor.co.uk/elections/${postcode}`;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    private appData: AppDataService,
    private lookupsService: LookupsService,
    private democracyClubService: DemocracyClubService
  ) {}

  ngOnInit(): void {
    const routeParams = this.activatedRoute.snapshot.params;

    var constituencyName = this.appData.unKebabUri(routeParams['constituency']);
    var electionDate = this.appData.unKebabUri(routeParams['electionDate']);

    var constituencyLookup = this.lookupsService
      .Constituency(constituencyName) // from this observable
      .pipe(
        switchMap(constituency => {
          this.constituencyDetails = constituency; // map
          // and switch to another observable
          return this.democracyClubService.ConstituencyElectionDates(
            constituency.constituency
          );
        }),
        switchMap(dates => {
          this.ElectionDates = dates; // map
          // and switch to another observable
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
      next: candidates => (this.candidates = candidates),
      error: serverError => (this.error = serverError.error.detail)
    });
  }

  clearDefault(el: any): void {
    if (el.defaultValue == el.value) el.value = '';
  }
  fillDefault(el: any): void {
    if (el.value == '') el.value = this.postcode;
  }

  onDateChange() {
    this.candidates$ = this.democracyClubService
      .Candidates(
        this.constituencyDetails.constituencyID.toString(),
        this.electionDate
      )
      .subscribe({
        next: candidates => (this.candidates = candidates),
        error: serverError => (this.error = serverError.error.detail)
      });
  }

  ngOnDestroy(): void {
    if (this.candidates$) {
      this.candidates$.unsubscribe();
    }
  }
}
