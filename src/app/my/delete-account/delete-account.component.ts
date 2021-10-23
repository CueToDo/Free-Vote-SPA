// Angular
import { Component, Inject } from '@angular/core';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Free Vote
import { LocalDataService } from 'src/app/services/local-data.service';

export interface DialogData {
  name: string;
  response: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.css']
})
export class DeleteAccountComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onDelete() {
    this.dialogRef.close(this.data.response);
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
