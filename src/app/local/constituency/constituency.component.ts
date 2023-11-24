// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { Constituency } from 'src/app/models/constituency';

@Component({
  selector: 'app-constituency',
  templateUrl: './constituency.component.html',
  styleUrls: ['./constituency.component.css']
})
export class ConstituencyComponent implements OnInit, OnDestroy {
  public error = '';

  private constituencyDetails$: Subscription | undefined;

  public constituencyDetails = new Constituency();

  get mp(): string {
    return this.constituencyDetails.politician;
  }

  get party(): string {
    return this.constituencyDetails.party;
  }

  get mpImageUrl(): string {
    return `https://www.theyworkforyou.com${this.constituencyDetails.politicianImage}`;
  }

  get mpUrl(): string {
    return `https://www.theyworkforyou.com${this.constituencyDetails.politicianTwfyUrl}`;
  }

  get constituencyUrl(): string {
    return `https://mapit.mysociety.org/area/${this.constituencyDetails.mapItConstituencyID}.html`;
  }

  get writeToThem(): string {
    var pc = this.localData.freeVoteProfile.postcode.replace(' ', '+');
    var referrer = encodeURIComponent(this.localData.websiteUrlWTS);
    // mapit MemberID does not match They Work For You ID
    // who=${this.twfyMemberID}&
    return `https://www.writetothem.com/write?a=westminstermp&pc=${pc}&fyr_extref=${referrer}`;
  }

  get twfyMemberID(): string {
    return this.constituencyDetails.politicianTwfyMemberID;
  }

  get mpWebsite(): string {
    return this.constituencyDetails.politicianWebsite;
  }

  get postcode(): string {
    return this.localData.freeVoteProfile.postcode;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public localData: LocalDataService,
    private appData: AppDataService,
    private lookupsService: LookupsService
  ) {}

  ngOnInit(): void {
    const routeParams = this.activatedRoute.snapshot.params;

    var constituency = this.appData.unKebabUri(routeParams['constituency']);

    this.constituencyDetails$ = this.lookupsService
      .Constituency(constituency)
      .subscribe({
        next: constituency => (this.constituencyDetails = constituency),
        error: serverError => (this.error = serverError.error.detail)
      });
  }

  clearDefault(el: any): void {
    if (el.defaultValue == el.value) el.value = '';
  }
  fillDefault(el: any): void {
    if (el.value == '') el.value = this.postcode;
  }

  ngOnDestroy(): void {
    if (this.constituencyDetails$) {
      this.constituencyDetails$.unsubscribe();
    }
  }
}
