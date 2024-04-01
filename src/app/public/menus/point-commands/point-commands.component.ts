// Angular
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

// Models
import { Point, PointFeedback } from 'src/app/models/point.model';
import { PointSupportLevels } from 'src/app/models/enums';
import { PointsService } from 'src/app/services/points.service';
import { NbspPipe } from '../../../custommodule/pipes/nbsp.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgClass } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-point-commands',
    templateUrl: './point-commands.component.html',
    styleUrls: ['./point-commands.component.css'],
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, NgIf, MatIconModule, MatTooltipModule, NgClass, NbspPipe]
})
export class PointCommandsComponent implements OnInit {
  @Input() point = new Point();

  // Point Owner
  @Output() Edit = new EventEmitter();
  @Output() Delete = new EventEmitter();

  @Output() AddLocalTags = new EventEmitter();

  // Flags
  @Output() Favourite = new EventEmitter();
  @Output() Important = new EventEmitter();
  @Output() Anon = new EventEmitter();

  @Output() Error = new EventEmitter<string>();

  PointSupportLevels = PointSupportLevels;

  get favoriteIcon(): string {
    if (!this.point) {
      this.Error.emit('Missing: point');
      return '';
    } else {
      return this.point.isFavourite ? 'favorite' : 'favorite_border';
    }
  }

  constructor(private pointsService: PointsService) {}

  ngOnInit(): void {}

  // Point Owner Commands
  edit() {
    this.Edit.emit();
  }

  delete() {
    this.Delete.emit();
  }

  // Point Feedback

  pointFeedback(pointSupportLevel: PointSupportLevels): void {
    if (!this.point) {
      this.Error.emit('Missing: point');
    } else {
      if (!this.point.pointFeedback.feedbackIsUpdatable) {
        alert('Feedback is not updatable');
      } else {
        if (
          this.point.pointFeedback.supportLevelID === pointSupportLevel &&
          !this.point.pointFeedback.pointModified
        ) {
          // If clicked on the current support level then delete it
          if (confirm('Are you sure you wish to delete your feedback?')) {
            pointSupportLevel = PointSupportLevels.None;
          } else {
            return; // Cancel feedback delete
          }
        }

        const feedbackGiven = this.point.pointFeedback.feedbackGiven;

        this.pointsService
          .PointFeedback(this.point.pointID, pointSupportLevel, '', false)
          .subscribe({
            next: response => {
              console.log('FEEDBACK API RESPONSE', response);
              if (this.point) {
                this.point.pointFeedback = response as PointFeedback;
              }
              console.log(
                'CLIENT DATA UPDATED PointSupportlevel: ',
                this.point?.pointFeedback?.supportLevelID
              );
              if (feedbackGiven && !response.feedbackGiven) {
                this.point.totalFeedback -= 1;
              } else if (!feedbackGiven && response.feedbackGiven) {
                this.point.totalFeedback += 1;
              }
            },
            error: serverError => {
              console.log('PointFeedback Error', serverError);
              this.Error.emit(serverError.error.detail);
            }
          });
      }
    }
  }

  occupyHandSignals() {
    window.open(
      'https://en.m.wikipedia.org/wiki/Occupy_movement_hand_signals',
      '_blank'
    );
  }

  addLocalTags() {
    this.AddLocalTags.emit();
  }

  favourite() {
    this.Favourite.emit();
  }

  // important() {
  //   this.Important.emit();
  // }

  anon() {
    this.Anon.emit();
  }
}
