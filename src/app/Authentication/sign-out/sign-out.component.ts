import { CoreDataService } from './../../coreservices/coredata.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SignOutComponent implements OnInit {

  constructor(private coreDataService: CoreDataService) {
    this.coreDataService.SignOut();
   }

  ngOnInit() {
  }

}
