
// Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { concatMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Models, enums
import { PorQ } from 'src/app/models/porq.model';
import { PorQTypes } from 'src/app/models/enums';
import { PorQSelectionResult } from 'src/app/models/porq.model';
import { Point, PointSelectionResult } from 'src/app/models/point.model';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { PsandQsService } from 'src/app/services/psandqs.service';
import { PointsService } from 'src/app/services/points.service';

@Component({
  selector: 'app-porq-details',
  templateUrl: './porq-details.component.html',
  styleUrls: ['./porq-details.component.css']
})
export class PorqDetailsComponent implements OnInit {

  groupName: string;
  subGroupName: string;
  issueTitle: string;

  porQID: number;
  public porQ: PorQ;

  pointCount: number;
  public points: Point[];

  public PorQTypes = PorQTypes;

  editNewPoint = false;

  error = '';

  constructor(
    private activeRoute: ActivatedRoute,
    public appData: AppDataService,
    private psAndQsService: PsandQsService, private pointsService: PointsService) { }

  ngOnInit(): void {

    console.log('back in the room');

    const routeParams = this.activeRoute.snapshot.params;

    this.porQID = routeParams.porqId;
    this.groupName = this.appData.unKebabUri(routeParams.groupName);
    this.subGroupName = this.appData.unKebabUri(routeParams.subGroupName);
    this.issueTitle = this.appData.unKebabUri(routeParams.issue);

    this.psAndQsService.PorQSelectSpecific(this.porQID)
      .subscribe(
        {
          next: (psr: PorQSelectionResult) => {
            if (psr.psOrQs.length === 1) {
              this.porQ = psr.psOrQs[0];
            } else {
              this.error = 'The requested question, perspective or proposal coul dnot be found.';
            }
          },
          error: serverError => {
            this.error = serverError.error.detail;
          }
        }
      );

    this.getPoints();
  }

  getPoints() {
    this.pointsService.PorQPoints(this.porQID).subscribe(
      {
        next: (psr: PointSelectionResult) => {
          this.pointCount = psr.pointCount;
          this.points = psr.points;
        },
        error: serverError => this.error = serverError.error.detail
      }
    );
  }

  newPoint() {
    this.editNewPoint = true;
  }

  cancelNewPoint() {
    this.editNewPoint = false;
  }

  attachNewPoint($event) {

    this.editNewPoint = false; // point saved

    // now attach to this porQ
    this.psAndQsService.PointAttachToPorQ($event, this.porQ.porQID)
      .pipe(
        // point attached, now fetch all points for PorQ
        concatMap(res => this.pointsService.PorQPoints(this.porQ.porQID)
        )
      )
      .subscribe(
        {
          next: (psr: PointSelectionResult) => this.points = psr.points,
          error: serverError => this.error = serverError.error.detail
        }
      );
  }

  onPointDeleted(pointID: number) {
    this.getPoints();
  }

}
