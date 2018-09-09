import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { CoreDataService } from '../../coreservices/coredata.service';
import { PointsService } from './../../coreservices/points.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css']
})
export class PointEditComponent implements OnInit {

  @Output() Cancel = new EventEmitter();

  inputPointID = -1;
  selectedPointType;

  ckeditorContent = '<p>Some html</p>';

  point: string;
  slashTags: string;
  draft: boolean;
  error: string;
  userTouched = false;

  // pointTypes: Array<[number, string]>;
  pointTypes: Map<string, string>;
  arrPointTypes: Array<[string, string]>;

  constructor(private router: Router, private coreDataService: CoreDataService, private pointsService: PointsService) {
    coreDataService.SetPageTitle(router.url);
  }

  ngOnInit() {
    this.pointTypes = this.coreDataService.PointTypes;
    this.arrPointTypes = this.coreDataService.ArrayFromMap(this.pointTypes);
    console.log(this.arrPointTypes);
  }

  PointUpdate(point: string, slashTags: string, draft: boolean) {

    this.pointsService.PointUpdate(this.inputPointID, point, slashTags, draft)
      .then(response => {
        console.log('response:' + response);
        this.inputPointID = response;
      })
      .catch(serverError => this.error = serverError.error.error);
  }

  onCKEBlur() { this.userTouched = true; }

  onSubmit() {
    this.PointUpdate(this.point, this.slashTags, this.draft);
  }

  onCancel() {
    this.Cancel.next();
  }

  onChange(val) {
    console.log(val);
  }
}
