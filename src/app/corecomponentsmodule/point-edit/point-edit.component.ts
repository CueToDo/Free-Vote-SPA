import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { CoreDataService } from '../../services/coredata.service';

@Component({
  selector: 'app-point-edit',
  templateUrl: './point-edit.component.html',
  styleUrls: ['./point-edit.component.css']
})
export class PointEditComponent implements OnInit {

  ckeditorContent: string = '<p>Some html</p>';

  form: FormGroup;
  point = new FormControl("", Validators.required);

  slashTag: string;
  tagDisplay: string;

  constructor(private formBuilder: FormBuilder, private coreDataService: CoreDataService) {

    this.coreDataService.SetPageTitle('new point');
    this.slashTag = coreDataService.SlashTag;
    this.tagDisplay = coreDataService.TagDisplay;

    this.form = formBuilder.group({
      point: this.point
    });

  }

  ngOnInit() {

  }

  onSubmit(){

  }

}