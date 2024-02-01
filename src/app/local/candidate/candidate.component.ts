// Angular
import { Component, EventEmitter, Input, Output } from '@angular/core';

// Models
import { Candidate } from 'src/app/models/candidate';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css']
})
export class CandidateComponent {
  @Input() isMPs = false;
  @Input() constituencyID = 0;
  @Input() candidate = new Candidate();
  @Input() candidateSelected = '';
  @Input() isFutureElection = false;
  @Input() showAddButton = false;
  @Input() showRemoveButton = false;

  @Output() ElectionCandidateAdd = new EventEmitter<number>();
  @Output() ElectionCandidateRemove = new EventEmitter<number>();

  get mailto(): string {
    if (!!this.candidate.publicEmailAddress)
      return `mailto:${this.candidate.publicEmailAddress}`;
    return '';
  }

  get writeToThem(): string {
    var pc = this.localData.freeVoteProfile.postcode.replace(' ', '+');
    var referrer = encodeURIComponent(this.localData.websiteUrlWTS);
    // mapit MemberID does not match They Work For You ID
    // who=${this.twfyMemberID}&
    return `https://www.writetothem.com/write?a=westminstermp&pc=${pc}&fyr_extref=${referrer}`;
  }

  constructor(
    private appData: AppDataService,
    private localData: LocalDataService
  ) {}

  get selected(): boolean {
    // match on hyphenated surnames when full name is kebabed in url
    return (
      this.appData.kebabUri(this.candidate.name) ==
      this.appData.kebabUri(this.candidateSelected)
    );
  }

  ngOnInit(): void {
    if (this.candidate.isCurrentMP) {
      var searchText = this.candidate.name;
      this.candidate.ukParliamentUrl = `https://members.parliament.uk/members/Commons?SearchText=${searchText}&ForParliament=Current`;

      // Should only write to your own MP
      if (this.constituencyID == this.localData.ConstituencyIDVoter) {
        this.candidate.writeToThemUrl = this.writeToThem;
      }
    }
  }

  AddCandidate(): void {
    this.ElectionCandidateAdd.emit(this.candidate.politicianID);
  }

  RemoveCandidate(): void {
    this.ElectionCandidateRemove.emit(this.candidate.politicianID);
  }
}
