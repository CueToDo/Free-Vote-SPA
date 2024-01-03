// Angular
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Models
import { PointEditComponent } from '../point-edit/point-edit.component';

@Component({
  selector: 'app-point-create-new',
  templateUrl: './point-create-new.component.html',
  styleUrls: ['./point-create-new.component.css']
})
export class PointCreateNewComponent implements OnInit, AfterViewInit {
  @ViewChild('pointEdit') pointEditComponent!: PointEditComponent;

  constructor(
    private dialogRef: MatDialogRef<PointCreateNewComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      tag: string;
    }
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.dialogRef.disableClose = true;
    this.pointEditComponent.PrepareNewPoint(0, this.data.tag);
  }

  SaveComplete() {
    this.dialogRef.close(true);
  }

  Cancel() {
    this.dialogRef.close();
  }
}
