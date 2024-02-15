// Angular
import { Component, Inject } from '@angular/core';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Models, enums
import { Candidate } from 'src/app/models/candidate.model';
import { PoliticalParties } from 'src/app/models/enums';

// Services
import { DemocracyClubService } from 'src/app/services/democracy-club.service';

// Other
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-candidate-edit',
  templateUrl: './candidate-edit.component.html',
  styleUrls: ['./candidate-edit.component.css']
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
    private democracyClubService: DemocracyClubService
  ) {}

  ngOnInit() {
    this.candidate = cloneDeep(this.data.candidate);
    this.candidate.updated =
      false; /* original candidate doesn't have "updated" */
  }

  SelectParty() {}

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
      this.democracyClubService.PoliticianUpdate(this.candidate).subscribe({
        next: () => {
          this.candidate.updated = true;
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
