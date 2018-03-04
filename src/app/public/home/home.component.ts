import { Component, OnInit } from '@angular/core';

import {CoreDataService} from '../../services/coredata.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private coreDataService: CoreDataService) { }

  ngOnInit() {
    this.coreDataService.SetPageTitle('Home');
  }

}
