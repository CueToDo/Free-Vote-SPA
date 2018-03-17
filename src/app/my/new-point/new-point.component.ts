import { Component, OnInit } from '@angular/core';

import { CoreDataService } from '../../services/coredata.service';

@Component({
  templateUrl: './new-point.component.html',
  styleUrls: ['./new-point.component.css']
})
export class NewPointComponent implements OnInit {

  ckeditorContent: string = '<p>Some html</p>';

  constructor(private coreDataService: CoreDataService) { 
    this.coreDataService.SetPageTitle('new point');
  }

  ngOnInit() {
  }

}
