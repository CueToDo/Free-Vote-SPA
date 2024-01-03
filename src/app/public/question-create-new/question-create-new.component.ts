import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuestionEditComponent } from '../question-edit/question-edit.component';

@Component({
  selector: 'app-question-create-new',
  templateUrl: './question-create-new.component.html',
  styleUrls: ['./question-create-new.component.css']
})
export class QuestionCreateNewComponent {
  @ViewChild('questionEdit') questionEditComponent!: QuestionEditComponent;

  constructor(
    private dialogRef: MatDialogRef<QuestionCreateNewComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      tag: string;
    }
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.dialogRef.disableClose = true;
    this.questionEditComponent.NewQuestion(this.data.tag);
  }

  SaveComplete() {
    this.dialogRef.close(true);
  }

  Cancel() {
    this.dialogRef.close();
  }
}
