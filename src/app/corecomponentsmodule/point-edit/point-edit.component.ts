import { Component, OnInit } from '@angular/core';
import { Validators, NgForm } from '@angular/forms';

import { CoreDataService } from '../../coreservices/coredata.service';
import { PointsService } from './../../coreservices/points.service';
import { Router } from '@angular/router';

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

  pointTypes: Array<[number, string]>;

  constructor(private router: Router, private coreDataService: CoreDataService, private pointsService: PointsService) {
    coreDataService.SetPageTitle(router.url);
  }

  ngOnInit() {
    this.pointTypes = this.coreDataService.PointTypes;
    console.log('POINT-EDIT COMPONENT');
    console.log(this.pointTypes);
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
