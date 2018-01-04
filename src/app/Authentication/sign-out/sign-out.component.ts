import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SignOutComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,) {
    this.authenticationService.SignOut();
   }

  ngOnInit() {
  }

}
