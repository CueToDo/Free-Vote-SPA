// Angular
import { Component, EventEmitter, Input, Output } from '@angular/core';

// Material
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

// Models, Enums
import { Candidate } from 'src/app/models/candidate.model';
import { PoliticalParties } from 'src/app/models/enums';

// Componments
import { CandidateEditComponent } from '../candidate-edit/candidate-edit.component';

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

  public PoliticalParties = PoliticalParties;

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
    private localData: LocalDataService,
    public matDialog: MatDialog
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

  EditCandidate() {
    if (this.isMPs) return;

    let candidateEditDialogConfig = new MatDialogConfig();
    candidateEditDialogConfig.disableClose = true;
    // candidateEditDialogConfig.maxWidth = '90vw';
    candidateEditDialogConfig.maxHeight = '95vh';
    candidateEditDialogConfig.data = { candidate: this.candidate };

    const candidateEditDialogRef = this.matDialog.open(
      CandidateEditComponent,
      candidateEditDialogConfig
    );

    candidateEditDialogRef.afterClosed().subscribe({
      next: (candidateEdit: Candidate) => {
        if (candidateEdit.updated) this.candidate = candidateEdit;
      }
    });
  }
}
