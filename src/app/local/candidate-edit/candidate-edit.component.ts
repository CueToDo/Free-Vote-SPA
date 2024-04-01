// Angular
import { Component, Inject } from '@angular/core';

// Material
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material/dialog';

// Models, enums
import { Candidate } from 'src/app/models/candidate.model';
import { PoliticalParties } from 'src/app/models/enums';
import { Kvp } from 'src/app/models/kvp.model';

// Services
import { DemocracyClubService } from 'src/app/services/democracy-club.service';

// Other
import { cloneDeep } from 'lodash-es';
import { PartySelectComponent } from '../party-select/party-select.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-candidate-edit',
    templateUrl: './candidate-edit.component.html',
    styleUrls: ['./candidate-edit.component.css'],
    standalone: true,
    imports: [NgClass, NgIf, FormsModule, MatButtonModule]
})
export class CandidateEditComponent {
  public candidate = new Candidate();

  public error = '';

  public PoliticalParties = PoliticalParties;

  public constructor(
    private candidateEditDialogRef: MatDialogRef<CandidateEditComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      candidate: Candidate;
    },
    private democracyClubService: DemocracyClubService,
    public matDialogOpener: MatDialog
  ) {}

  ngOnInit() {
    this.candidate = cloneDeep(this.data.candidate);
    this.candidate.updated =
      false; /* original candidate doesn't have "updated" */
  }

  SelectParty() {
    // Must get user to select party before adding candidate to election
    let partySelectDialogConfig = new MatDialogConfig();
    partySelectDialogConfig.disableClose = true;
    partySelectDialogConfig.maxWidth = '90vw';
    partySelectDialogConfig.maxHeight = '90vh';
    partySelectDialogConfig.data = { name: this.candidate.name };

    const partySelectDialogRef = this.matDialogOpener.open(
      PartySelectComponent,
      partySelectDialogConfig
    );

    partySelectDialogRef.afterClosed().subscribe({
      next: (party: Kvp) => {
        this.candidate.party = party.key;
        this.candidate.partyID = party.value;
      },
      error: error => this.ShowError(error)
    });
  }

  Close() {
    this.candidateEditDialogRef.disableClose = false;
    this.candidateEditDialogRef.close(this.candidate);
  }

  Save() {
    if (
      !confirm(
        `Are you sure you wish to save these details for ${this.candidate.name}?`
      )
    )
      return;

    if (!!this.candidate.name) {
      this.error = '';
      this.democracyClubService.PoliticianUpdate(this.candidate).subscribe({
        next: (somebodyElected: boolean) => {
          this.candidate.updated = true;
          this.candidate.somebodyElected = somebodyElected;
          this.Close();
        },
        error: error => this.ShowError(error)
      });
    } else {
      this.error = 'Politician name must be provided';
    }
  }

  ShowError(err: any) {
    if (err?.error?.detail) {
      this.error = err.error.detail;
    } else if (err?.error) {
      this.error = err.error;
    } else if (err) {
      this.error = err;
    }
  }
}
