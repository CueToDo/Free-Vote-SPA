import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { SignInStatus } from './coredata.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class LoginRouteGuardService implements CanActivate {

  currentDate: Date;

  constructor(private authenticationServide: AuthenticationService) { }

  canActivate() {
    this.currentDate = new Date()
    let signedIn = this.authenticationServide.SignInData.SignInStatus == SignInStatus.SignInSuccess;
    return signedIn;
  }
}
