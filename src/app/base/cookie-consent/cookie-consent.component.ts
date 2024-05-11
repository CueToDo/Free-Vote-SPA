// Angular
import { Component } from '@angular/core';

// Material
import { MatDialogRef } from '@angular/material/dialog';

// Services
import { LocalDataService } from 'src/app/services/local-data.service';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css'],
  standalone: true,
  imports: [NgIf, MatButtonModule]
})
export class CookieConsentComponent {
  constructor(
    private authService: AuthService,
    private dialogRef: MatDialogRef<CookieConsentComponent>,
    public localData: LocalDataService
  ) {}

  get loggedIn(): boolean {
    return this.authService.IsSignedIn;
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
    this.authService.signOut();
    this.localData.cookieConsent = false;
    this.dialogRef.disableClose = false;
    this.dialogRef.close();
  }
}
