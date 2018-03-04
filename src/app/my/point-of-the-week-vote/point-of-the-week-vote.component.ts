import { Component, OnInit } from '@angular/core';

import { CoreDataService } from '../../services/coredata.service';

@Component({
  selector: 'app-point-of-the-week-vote',
  templateUrl: './point-of-the-week-vote.component.html',
  styleUrls: ['./point-of-the-week-vote.component.css']
})
export class PointOfTheWeekVoteComponent implements OnInit {

  constructor(private coreDataService: CoreDataService) {
    this.coreDataService.SetPageTitle('point of the week VOTE');
   }

  ngOnInit() {
  }

}
