import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CoreDataService } from '../../coreservices/coredata.service';
import { PointsService } from './../../coreservices/points.service';
import { Router } from '@angular/router';

import { Point } from '../../models/point.model';
import { Kvp } from '../../models/kvp.model';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css']
})
export class PointEditComponent implements OnInit {

  @Input() point: Point;
  @Output() Cancel = new EventEmitter();

  selectedPointType;

  ckeditorContent = '<p>Some html</p>';

  slashTags: string;
  draft: boolean;
  error: string;
  userTouched = false;

  // pointTypes: Array<[number, string]>;
  // https://stackoverflow.com/questions/47079366/expression-has-changed-after-it-was-checked-during-iteration-by-map-keys-in-angu/50749898
  pointTypes: Kvp[];

  // https://stackoverflow.com/questions/47079366/expression-has-changed-after-it-was-checked-during-iteration-by-map-keys-in-angu/50749898
  // pointKeys: IterableIterator<number>;

  constructor(private router: Router, private coreDataService: CoreDataService, private pointsService: PointsService) {
    coreDataService.SetPageTitle(router.url);
  }

  ngOnInit() {
    this.pointTypes = this.coreDataService.PointTypes;
    console.log(this.point.PointTypeID);
  }

  PointUpdate(point: string, slashTags: string, draft: boolean) {

    this.pointsService.PointUpdate(this.point.PointID, point, slashTags, draft)
      .then(response => {
        console.log('response:' + response);
        this.point.PointID = response;
      })
      .catch(serverError => this.error = serverError.error.error);
  }

  onCKEBlur() { this.userTouched = true; }

  onSubmit() {
    this.PointUpdate(this.point.PointText, this.slashTags, this.draft);
  }

  onCancel() {
    this.Cancel.next();
  }

  onChange(val) {
    console.log(val);
  }
}
