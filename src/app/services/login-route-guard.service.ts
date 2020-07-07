import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { LocalDataService } from './local-data.service';

@Injectable({ providedIn: 'root' })
export class LoginRouteGuardService implements CanActivate {

  currentDate: Date;

  constructor(private localData: LocalDataService) { }

  canActivate() {
    this.currentDate = new Date();
    return this.localData.loggedInToAuth0;
  }

  requiresLogin(url: string): boolean {
    return url.includes('/profile') || url.includes('/my/');
  }

}
