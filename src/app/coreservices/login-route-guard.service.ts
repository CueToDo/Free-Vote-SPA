import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { SignInStatuses } from './enums';
import { SignInData } from './classes';
import { CoreDataService } from './coredata.service';

@Injectable()
export class LoginRouteGuardService implements CanActivate {

  currentDate: Date;

  constructor(private coreDataService: CoreDataService) { }

  canActivate() {
    this.currentDate = new Date();
    const signedIn = this.coreDataService.SignInData.SignInStatus === SignInStatuses.SignInSuccess;
    return signedIn;
  }
}
