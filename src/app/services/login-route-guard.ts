import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable()
export class LoginRouteGuard implements CanActivate {

  constructor() { }

  canActivate()
  {
    return false;
  }
}
