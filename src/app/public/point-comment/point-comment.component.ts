// Angular
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

// Services
import { PointsService } from 'src/app/services/points.service';

@Component({
  selector: 'app-point-comment',
  templateUrl: './point-comment.component.html',
  styleUrls: ['./point-comment.component.css']
})
export class PointCommentComponent implements OnInit {
  @Input() ParentPointID = 0;
  @Input() Comment = '';

  @Output() CancelEdit = new EventEmitter();
  @Output() CompleteEdit = new EventEmitter();

  error = '';

  constructor(private pointsService: PointsService) {}

  ngOnInit(): void {}

  onCKEBlur() {}

  Cancel() {
    this.CancelEdit.emit();
  }

  onSubmit() {
    this.pointsService
      .PointCommentUpdate(this.ParentPointID, -1, this.Comment)
      .subscribe({
        next: _ => this.CompleteEdit.emit(),
        error: err => {
          this.error = err.error.detail;
        }
      });
  }
}
