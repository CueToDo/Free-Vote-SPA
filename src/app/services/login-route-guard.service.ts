import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthenticationService, SignInStatus } from './authentication.service';

@Injectable()
export class LoginRouteGuardService implements CanActivate {

  currentDate: Date;

  constructor(private authenticationServide: AuthenticationService) { }

  canActivate() {
    this.currentDate = new Date()
    let signedIn = this.authenticationServide.SignInData.SignInResult == SignInStatus.SignInSuccess;
    return signedIn;
  }
}
