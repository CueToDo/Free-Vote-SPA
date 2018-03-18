import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { SignInData, SignInStatus } from './coredata.service';
import { CoreDataService } from './coredata.service';

@Injectable()
export class LoginRouteGuardService implements CanActivate {

  currentDate: Date;

  constructor(private coreDataService: CoreDataService) { }

  canActivate() {
    this.currentDate = new Date()
    let signedIn = this.coreDataService.SignInData.SignInStatus == SignInStatus.SignInSuccess;
    return signedIn;
  }
}
