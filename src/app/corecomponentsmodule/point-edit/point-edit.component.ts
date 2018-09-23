import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CoreDataService } from '../../coreservices/coredata.service';
import { PointsService } from './../../coreservices/points.service';
import { Router } from '@angular/router';

import { PointEdit } from '../../models/point.model';
import { Kvp } from '../../models/kvp.model';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css']
})
export class PointEditComponent implements OnInit {

  @Input() pointEdit: PointEdit;
  @Output() Cancel = new EventEmitter();

  selectedPointType;

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
    // Point Edit is cast from Point where SlashTags is an array - auto-conversion joins with ',' but must work with js array
    console.log('SlashTags: ', this.pointEdit.SlashTags);
    this.pointEdit.SlashTags = this.pointEdit.SlashTags.toString().replace(/,/g, ' '); // global replace - sick
    this.pointTypes = this.coreDataService.PointTypes;
    if (this.pointEdit) {
      console.log('SlashTags: ', this.pointEdit.SlashTags);
    } else {
      this.pointEdit = { 'PointID': -1, 'PointHTML': '', 'SlashTags': '', 'Draft': true };
    }
  }

  onCKEBlur() { this.userTouched = true; }

  onSubmit() {
    console.log(this.pointEdit.SlashTags);
    this.pointsService.PointUpdate(this.pointEdit)
      .then(response => {
        console.log('response:' + response);
        this.pointEdit.PointID = response;
      })
      .catch(serverError => this.error = serverError.error.error);
  }

  onCancel() {
    this.Cancel.next();
  }

  onChange(val) {
    console.log(val);
  }
}
