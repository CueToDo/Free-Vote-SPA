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

  point: string;
  slashTags: string;
  draft: boolean;
  error: string;
  userTouched = false;

  constructor(private coreDataService: CoreDataService, private pointsService: PointsService) {

    this.coreDataService.SetPageTitle('new point');

  }

  ngOnInit() {

  }

  PointUpdate(point: string, slashTags: string, draft: boolean) {

    this.pointsService.PointUpdate(this.inputPointID, point, slashTags, draft)
      .then(response => {
        console.log('response:' + response);
        this.inputPointID = response;
      })
      .catch(serverError => this.error = serverError.error.error);
  }

  onSubmit() {
    this.PointUpdate(this.point, this.slashTags, this.draft);
  }

  onCKEBlur() { this.userTouched = true; }

}
