import { Component, OnInit } from '@angular/core';

import { CoreDataService } from '../../coreservices/coredata.service';

@Component({
  templateUrl: './point-of-the-week.component.html',
  styleUrls: ['./point-of-the-week.component.css']
})
export class PointOfTheWeekComponent implements OnInit {

  constructor(private coreDataService: CoreDataService) {
    this.coreDataService.SetPageTitle('point of the week');
  }

  ngOnInit() {

  }

}
