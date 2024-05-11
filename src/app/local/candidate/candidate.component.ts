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
import { AuthService } from 'src/app/services/auth.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { HttpExtraService } from 'src/app/services/http-extra.service';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css'],
  standalone: true,
  imports: [NgClass, NgIf, MatButtonModule]
})
export class CandidateComponent {
  @Input() isMPs = false;
  @Input() constituencyID = 0;
  @Input() candidate = new Candidate();
  @Input() candidateSelected = '';
  @Input() isFutureElection = false;
  @Input() showAddButton = false;
  @Input() showRemoveButton = false;
  @Input() showVoteShare = false;

  @Output() ElectionCandidateAdd = new EventEmitter<number>();
  @Output() ElectionCandidateRemove = new EventEmitter<number>();
  @Output() SomebodyElected = new EventEmitter<boolean>();

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
    private authService: AuthService,
    private httpXS: HttpExtraService,
    private localData: LocalDataService,
    public matDialog: MatDialog
  ) {}

  get selected(): boolean {
    // match on hyphenated surnames when full name is kebabed in url
    return (
      this.httpXS.kebabUri(this.candidate.name) ==
      this.httpXS.kebabUri(this.candidateSelected)
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
    if (this.localData.freeVoteProfile.email != 'alex@q2do.com') return;
    if (!this.authService.IsSignedIn) {
      alert('not logged in');
      return;
    }

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
        if (candidateEdit.somebodyElected) this.SomebodyElected.emit(true);
      }
    });
  }
}
