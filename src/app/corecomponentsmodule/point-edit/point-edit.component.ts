import { Component, OnInit } from '@angular/core';
import { Validators, NgForm } from '@angular/forms';

import { CoreDataService } from '../../coreservices/coredata.service';
import { PointsService } from './../../coreservices/points.service';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css']
})
export class PointEditComponent implements OnInit {

  inputPointID = -1;

  ckeditorContent = '<p>Some html</p>';

  point;
  draft;

  slashTag: string;
  tagDisplay: string;

  constructor(private coreDataService: CoreDataService, private pointsService: PointsService) {

    this.coreDataService.SetPageTitle('new point');
    this.slashTag = coreDataService.SlashTag;
    this.tagDisplay = coreDataService.TagDisplay;

  }

  ngOnInit() {

  }

  PointUpdate(point: string, draft: boolean) {

    this.pointsService.PointUpdate(this.inputPointID, point, draft)
      .then(response => console.log(response));
  }

  onSubmit() {
    this.PointUpdate(this.point, this.draft);
  }

}
