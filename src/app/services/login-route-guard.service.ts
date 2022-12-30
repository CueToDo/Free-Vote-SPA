// Angular
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

// Auth0
import { AuthService } from '@auth0/auth0-angular';

@Injectable({ providedIn: 'root' })
export class LoginRouteGuardService implements CanActivate {
  private loggedIn = false;

  constructor(private auth0Service: AuthService) {
    this.auth0Service.isAuthenticated$.subscribe(
      loggedIn => (this.loggedIn = loggedIn)
    );
  }

  canActivate(): boolean {
    return this.loggedIn;
  }

  requiresLogin(url: string): boolean {
    return url.includes('/profile') || url.includes('/my/');
  }
}
