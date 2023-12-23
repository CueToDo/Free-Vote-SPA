// Angular
import { Component } from '@angular/core';

// Material
import { MatDialogRef } from '@angular/material/dialog';

// Services
import { Auth0Wrapper } from 'src/app/services/auth-wrapper.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css']
})
export class CookieConsentComponent {
  constructor(
    private dialogRef: MatDialogRef<CookieConsentComponent>,
    public auth0Wrapper: Auth0Wrapper,
    public localData: LocalDataService
  ) {}

  get loggedIn(): boolean {
    return this.auth0Wrapper.LoggedInToAuth0;
  }

  get name(): string {
    var displayName = '';

    displayName = this.localData.freeVoteProfile.givenName;

    if (
      !!this.localData.freeVoteProfile.givenName &&
      !!this.localData.freeVoteProfile.familyName
    )
      displayName += ' ';

    displayName += this.localData.freeVoteProfile.familyName;

    if (!!displayName && !!this.localData.freeVoteProfile.alias) {
      displayName += ` (${this.localData.freeVoteProfile.alias})`;
      return displayName;
    }

    if (!displayName && !!this.localData.freeVoteProfile.alias)
      displayName = this.localData.freeVoteProfile.alias;

    if (!!displayName) return displayName;

    return 'Anon user';
  }

  OK(): void {
    this.localData.cookieConsent = true;
    this.dialogRef.disableClose = false;
    this.dialogRef.close();
  }

  Logout(): void {
    this.auth0Wrapper.logout();
    this.localData.cookieConsent = false;
    this.dialogRef.disableClose = false;
    this.dialogRef.close();
  }
}
