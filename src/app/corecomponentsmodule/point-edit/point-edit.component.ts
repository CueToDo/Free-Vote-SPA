import { PointsService } from './../../services/points.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';

import { CoreDataService } from '../../services/coredata.service';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css']
})
export class PointEditComponent implements OnInit {

  inputPointID: number = -1;

  ckeditorContent: string = '<p>Some html</p>';

  form: FormGroup;
  point = new FormControl("", Validators.required);

  slashTag: string;
  tagDisplay: string;

  constructor(private formBuilder: FormBuilder, private coreDataService: CoreDataService, private pointsService: PointsService) {

    this.coreDataService.SetPageTitle('new point');
    this.slashTag = coreDataService.SlashTag;
    this.tagDisplay = coreDataService.TagDisplay;

    this.form = formBuilder.group({
      point: this.point
    });

  }

  ngOnInit() {

  }

  PointUpdate(point: string, draft: boolean) {

    this.pointsService.PointUpdate(this.inputPointID, point, draft)
      .then(
        response => {
          console.log(response);
        })
  }

  onSubmit(f: NgForm) {
    console.log(f);
    this.PointUpdate(f.value.point, f.value.draft);
  }

}