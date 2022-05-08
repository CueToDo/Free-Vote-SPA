import { AppDataService } from 'src/app/services/app-data.service';
// Angular
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-constituency',
  templateUrl: './constituency.component.html',
  styleUrls: ['./constituency.component.css']
})
export class ConstituencyComponent implements OnInit {
  constructor(public localData: LocalDataService) {}

  get mp(): string {
    return this.localData.freeVoteProfile.politician;
  }

  get mpImageUrl(): string {
    return `https://www.theyworkforyou.com${this.localData.freeVoteProfile.politicianImage}`;
  }

  get mpUrl(): string {
    return `https://www.theyworkforyou.com${this.localData.freeVoteProfile.politicianUrl}`;
  }

  get constituencyUrl(): string {
    return `https://mapit.mysociety.org/area/${this.localData.freeVoteProfile.mapItConstituencyID}.html`;
  }

  get writeToThem(): string {
    var pc = this.localData.freeVoteProfile.postcode.replace(' ', '+');
    var referrer = encodeURIComponent(this.localData.websiteUrlWTS);
    // mapit MemberID does not match They Work For You ID
    // who=${this.twfyMemberID}&
    return `https://www.writetothem.com/write?pc=${pc}&fyr_extref=${referrer}`;
  }

  get twfyMemberID(): string {
    return this.localData.freeVoteProfile.politicianTwfyMemberID;
  }

  get postcode(): string {
    return this.localData.freeVoteProfile.postcode;
  }

  ngOnInit(): void {}

  clearDefault(el: any): void {
    if (el.defaultValue == el.value) el.value = '';
  }
  fillDefault(el: any): void {
    if (el.value == '') el.value = this.postcode;
  }
}
