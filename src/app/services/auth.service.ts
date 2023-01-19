// angular
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// rxjs
import { Observable, of, Subject, BehaviorSubject, throwError } from 'rxjs';
import { tap, map, concatMap } from 'rxjs/operators';

// auth0
import { AuthService, User } from '@auth0/auth0-angular';

// Services
import { LocalDataService } from './local-data.service';

@Injectable({
  providedIn: 'root'
})
export class Auth0Wrapper {
  // Auth0 logged in status, profile and FreeVote jwt:

  // Used by interceptor service - interrogated rather than relying on push
  // Always save to localdata
  public get LoggedInToAuth0(): boolean {
    return this.localData.GetItem('loggedInToAuth0') == 'true';
  }

  public set LoggedInToAuth0(loggedIn: boolean) {
    this.localData.SetItem('loggedInToAuth0', loggedIn ? 'true' : 'false');
    if (this.LoggedInToAuth0 != loggedIn) {
      this.localData.ClearExistingJwt(); // Discard any previous voter or anonymous Jwt
    }
  }

  public auth0Profile: User | null | undefined; // Auth0 Profile Data saved to app on login

  public IsAuth0Callback = false; // Set in callback component

  public HaveAuth0User = new Subject<boolean>();

  private haveAuth0User$(): Observable<boolean> {
    if (this.IsAuth0Callback) {
      this.localData.Log('WAIT for user to be returned after callback');
      return this.HaveAuth0User; // wait for user to be returned after callback
    } else {
      this.localData.Log(
        'Not a callback - no need to wait for user to be returned'
      );
      return of(true); // we're ready
    }
  }

  private jwtFetched$ = new Subject<boolean>();

  constructor(
    private localData: LocalDataService,
    @Inject(PLATFORM_ID) private platformId: object,
    private httpClient: HttpClient,
    private auth0Service: AuthService // configFactory: AuthClientConfig, // navigator: AbstractNavigator, // authState: AuthState
  ) {}

  SetUpAuth0Subscriptions() {
    // Auth setup on client only
    // Now that we inject auth0Service, do we need to wait for creation using createAuth0Client?

    if (isPlatformBrowser(this.platformId)) {
      // subscribe to auth0Service.isAuthenticated$
      this.auth0Service.isAuthenticated$.subscribe(isAuthenticated => {
        this.LoggedInToAuth0 = isAuthenticated;
        this.localData.Log(`Auth0 subscription ${isAuthenticated}`);
      });

      // Subscribe to getUser for login and logout
      this.auth0Service.user$
        .pipe(
          concatMap((user: User | null | undefined) => {
            this.auth0Profile = user;
            this.IsAuth0Callback = false;
            this.HaveAuth0User.next(true);

            const loggedIn = !!user;

            // Always ClearExistingJwt BEFORE getting new ApiJwt for signed in or signed out user
            this.localData.Log(
              `Clear on have user from Auth0 - get fresh api jwt. LoggedIn:${loggedIn} User email:${user?.email}`
            );
            this.localData.ClearExistingJwt();

            // Now we can call the api for a jwt
            return this.getApiJwt$();
          })
        )
        .subscribe({
          next: () => {},
          error: error => {
            console.log(
              'ERROR: localAuthSetup, user subscription, getApiJwt',
              error
            );
            this.localData.Log(
              `ERROR: localAuthSetup, user subscription, getApiJwt ${error}`
            );
          }
        });
    }
  }

  // A desired redirect path can be passed to login method
  // (e.g. from a route guard)
  login(redirectPath: string = '/recent'): void {
    this.localData.Log('LOG IN WITH REDIRECT<br>');

    // Clear session and start afresh
    this.LoggedInToAuth0 = false;
    this.localData.SignedOut(); // Clears local storage and communicates state change

    this.auth0Service.loginWithRedirect({
      appState: { target: redirectPath }
    });
    // You don't have to do anything when login completes.
    // You can subscribe to logon status elsewhere
    // However, get user's profile immediately for nav bar picture
  }

  logout(): void {
    // Call method to log out
    this.auth0Service.logout({
      returnTo: window.location.origin // window reference: Manual logout - No SSR issue
      // Above casues a reload and updates app if service worker hasn't done so
    });

    this.LoggedInToAuth0 = false;
    this.localData.SignedOut(); // And Communicate
  }

  // Where an anon user selects items by sessionID, so does signed in user
  // Anon sessionIDs should be renewed opportunistically and returned if updated?

  // The API JWT is the FreeVote user profile
  getApiJwt$(): Observable<boolean | undefined> {
    // It doesn't matter if you're not logged in with Auth0, you still need a FreeVote JWT
    // For Anon or authenticated

    // getApiJwt calls get, but get calls getApiJwt - need to prevent endless loop
    // Anon users have a jwt

    this.localData.Log('getApiJwt called');

    // Wait for user from Auth0 before getting api jwt from free.vote API
    return this.haveAuth0User$().pipe(
      concatMap(_ => {
        if (this.localData.GotFreeVoteJwt) {
          // Already have jwt - no need to do anything
          this.localData.Log('Already have API Jwt');
          return of(true);
        } else if (this.localData.GettingFreeVoteJwt) {
          // Don't issue request yet - now's not the time,
          // or must wait for existing request to complete
          this.localData.Log('Waiting for API Jwt');
          return this.jwtFetched$;
        } else {
          // Only the first jwt request comes down here

          this.localData.Log(
            `Ready to request ApiJwt from ${this.localData.apiUrl} and be intercepted to add auth token.`
          );

          this.localData.GettingFreeVoteJwt = true; // prevent infinite loop - and communicate

          // Don't add jwt in headers when we're getting jwt
          // This is the observable which will return a boolean

          return this.httpClient
            .get(
              this.localData.apiUrl +
                'profile/getApiJwt/' +
                this.localData.website
            )
            .pipe(
              tap(response => {
                if (!!response) {
                  this.localData.Log(`GOT JWT from Api: ${response}`);

                  this.localData.AssignServerValues(response); /// but new sessionid is not returned so can't be assigned (that's OK)
                  this.localData.SaveValues();

                  this.jwtFetched$.next(true); // Any subsequently queued requests are now unlocked
                  this.jwtFetched$.complete(); // the jwt request is complete, should now be able to make the actual queued request
                } else {
                  throwError(() => new Error('No JWT')); // must be handled by the subscriber
                }
              }),
              map(_ => {
                // we don't return the jwt, we return a boolean
                return true; // now fulfil the original (promise) which DIDN'T return jwtFetched$
              })
            );
        }
      })
    );
  }
}
