import { Auth0Wrapper } from 'src/app/services/auth.service';
// angular
import { Component, OnInit, OnDestroy } from '@angular/core';

// auth0
import { AuthService } from '@auth0/auth0-angular';

// rxjs
import { Subscription } from 'rxjs';

// FreeVote Services
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html'
})
export class CallbackComponent implements OnInit, OnDestroy {
  // Used by Auth0 only after sign in attempt

  private callback$: Subscription | undefined;

  error = '';
  targetRoute = '';

  constructor(
    public auth0Service: AuthService,
    private auth0Wrapper: Auth0Wrapper,
    public localData: LocalDataService // private router: Router
  ) {}

  ngOnInit(): void {
    // Don't call this.appDataService.PageTitleChangeSubject$.next
    // app.component subscribes to this and calls this.location.replaceState
    // This prevents completion of Auth0 login

    // Do very little here - danger of invalid state
    // https://community.auth0.com/t/invalid-state-on-reload-auth0-callback-url-using-auth0-spa-js-and-angular-8/36469/3

    this.auth0Wrapper.IsAuth0Callback = true;

    this.callback$ = this.auth0Service.handleRedirectCallback().subscribe({
      next: result => {
        this.localData.Log(result.appState?.target + '');
        // this.router.navigate([result]);
      },
      error: serverError => {
        if (serverError.error.detail) {
          this.error = serverError.error.detail;
        } else if (serverError.error.message) {
          this.error = serverError.error.message;
        } else if (serverError.error) {
          this.error = serverError.error;
        } else if (serverError) {
          this.error = serverError;
        }
        this.localData.Log(`Calback component error: ${this.error}`);
      }
    });
  }

  signOut(): void {
    this.auth0Service.logout();
  }

  ngOnDestroy(): void {
    this.callback$?.unsubscribe();
  }
}
