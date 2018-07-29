import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { CoreDataService } from './coredata.service';

@Injectable()
export class LoginRouteGuardService implements CanActivate {

  currentDate: Date;

  constructor(private coreDataService: CoreDataService) { }

  canActivate() {
    this.currentDate = new Date();
    return this.coreDataService.SignedIn();
  }
}
