// Angular
import { Component, Inject } from '@angular/core';

// Material
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface DialogData {
  name: string;
  response: string;
}

@Component({
    selector: 'app-dialog',
    templateUrl: './delete-account.component.html',
    styleUrls: ['./delete-account.component.css'],
    standalone: true,
    imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule]
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
