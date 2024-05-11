// Angular
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate } from '@angular/router';

// Services
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoginRouteGuardService implements CanActivate {
  private loggedIn = false;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.SignedIn$.subscribe(
        loggedIn => (this.loggedIn = loggedIn)
      );
    }
  }

  canActivate(): boolean {
    return this.loggedIn;
  }

  requiresLogin(url: string): boolean {
    return url.includes('/profile') || url.includes('/my/');
  }
}
