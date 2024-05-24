// Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';

// Material
import { MatDialog } from '@angular/material/dialog';

// rxjs
import { tap, map, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs/internal/Subscription';

// Models
import { Kvp } from '../../models/kvp.model';
import {
  FreeVoteProfile,
  ProfilePictureOption
} from 'src/app/models/FreeVoteProfile';
import { ProfilePicture } from 'src/app/models/Image.model';

// Services
import { AuthService } from 'src/app/services/auth.service';
import { DemocracyClubService } from 'src/app/services/democracy-club.service';
import { HttpService } from 'src/app/services/http.service';
import { HttpExtraService } from 'src/app/services/http-extra.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { ProfileService } from 'src/app/services/profile.service';

// Components
import { DeleteAccountComponent } from 'src/app/my/delete-account/delete-account.component';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgIf, NgClass } from '@angular/common';
import { CkeUniversalComponent } from '../../public/cke-universal/cke-universal.component';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  preserveWhitespaces: true,
  standalone: true,
  imports: [
    NgIf,
    MatRadioModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    CkeUniversalComponent
  ]
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  // https://medium.com/better-programming/angular-manipulate-properly-the-dom-with-renderer-16a756508cba
  // Use static false when element has *ngIf
  // use hidden on any conditionally inserted parent NOT ngIf
  // hookup runOutsideAngular in ngAfterViewInit
  @ViewChild('tvConstituency', { static: false }) tvConstituency:
    | ElementRef
    | undefined;

  public photoUrl = '';
  PhotoUrl$: Subscription | undefined;

  countries: Kvp[] = [];
  cities: Kvp[] = [];

  // For Routerlink to local
  public get constituencyLink(): string {
    return `/constituency/${this.httpXS.kebabUri(this.localData.Constituency)}`;
  }

  postcode = '';
  constituencyID = 0;
  wardID = '';

  // Save old values when begin edit
  oldProfile = new FreeVoteProfile();
  public uploadPercentDone = 0;

  editing = false;

  lookingUpPostcode = false;
  uploading = false;
  saving = false;
  success = false;
  public error = false;
  public updateMessage = '';

  dialogRef: any;

  constructor(
    public authService: AuthService,
    private democracyClubService: DemocracyClubService,
    public localData: LocalDataService,
    private httpService: HttpService,
    private httpXS: HttpExtraService,
    private profileService: ProfileService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.postcode = this.localData.freeVoteProfile.postcode;

    this.PhotoUrl$ = this.authService.PhotoUrl$.subscribe(
      photoUrl => (this.photoUrl = photoUrl)
    );
  }

  ngAfterViewInit() {
    // Debounce the keyup outside of angular zone
    // 2-way databinding already cleans up the slashtag
    // This is just for delayed search
    // this.ngZone.runOutsideAngular(() => {
    //   this.constituencySearch$ = fromEvent<KeyboardEvent>(
    //     this.tvConstituency?.nativeElement,
    //     'keyup'
    //   )
    //     .pipe(debounceTime(300), distinctUntilChanged())
    //     .subscribe({
    //       next: _ => {
    //         // Fuzzy search on userInput
    //         this.ConstituencySearch(this.constituencySearch); // "As-is"
    //       }
    //     });
    // });
  }

  edit(): void {
    this.error = false;
    this.updateMessage = '';
    this.success = false;
    this.editing = true;

    this.oldProfile = Object.assign({}, this.localData.freeVoteProfile);
  }

  save(): void {
    this.Saving();

    this.localData.freeVoteProfile.constituencyID = this.constituencyID;
    this.localData.freeVoteProfile.wardID = this.wardID;

    this.profileService.SaveProfile(this.localData.freeVoteProfile).subscribe({
      next: result => {
        if (result) {
          this.updateMessage = 'saved';

          this.localData.SaveValues();

          // Save in old profile
          this.oldProfile = Object.assign({}, this.localData.freeVoteProfile);

          this.Saved(true);
        } else {
          this.updateMessage = 'error';
          this.error = true;
          this.localData.freeVoteProfile = Object.assign({}, this.oldProfile);
        }
      },
      error: err => this.ShowError(err)
    });
  }

  deleteAccount(): void {
    this.dialogRef = this.dialog.open(DeleteAccountComponent, {
      width: '320px',
      data: {
        name: `${this.localData.freeVoteProfile.givenName} ${this.localData.freeVoteProfile.familyName}`
      }
    });

    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result == 'delete') {
        this.profileService.DELETE_ME().subscribe({
          next: () => {
            this.updateMessage = 'Thank you and goodbye';
            this.authService.signOut();
          },
          error: err => this.ShowError(err)
        });
      }
    });
  }

  cancel(): void {
    this.saving = false;
    this.error = false;
    this.success = true;
    this.updateMessage = 'cancelled';

    this.localData.freeVoteProfile = Object.assign({}, this.oldProfile);

    this.editing = false;
  }

  deleteProfilePicture(): void {
    this.Saving();

    this.httpService.profilePictureDelete().subscribe({
      next: () => {
        this.localData.freeVoteProfile.profilePicture = '';
        this.localData.freeVoteProfile.profilePictureOptionID = '1';
        this.Saved(false);
      },
      error: serverError => this.ShowError(serverError.error.detail)
    });
  }

  profilePictureSelected(event: Event): void {
    this.Saving();
    this.uploading = true;
    this.uploadPercentDone = 0;

    const files: FileList | null = (event.target as HTMLInputElement).files;

    if (!!files) {
      const picture: File = files[0] as File;

      this.httpService
        .uploadProfilePicture(picture)
        .pipe(
          tap((serverEvent: HttpEvent<ProfilePicture>) => {
            // tap changes nothing in the pipe. What came in goes out
            if (serverEvent !== null) {
              switch (serverEvent.type) {
                case HttpEventType.Sent: // 0
                  console.log(`Uploading file of size ${picture.size}.`);
                  break;
                case HttpEventType.UploadProgress: // 1
                case HttpEventType.DownloadProgress: // 3
                  // Compute and show the % done:
                  const total = serverEvent.total;
                  if (total) {
                    const percentDone = Math.round(
                      (100 * serverEvent.loaded) / total
                    );
                    this.uploadPercentDone = percentDone;
                    console.log(`File is ${percentDone}% uploaded.`);
                  }
                  break;
                case HttpEventType.Response: // 4
                  console.log(`File was completely uploaded!`);
                  console.log(
                    (serverEvent as HttpResponse<ProfilePicture>).body
                  );
                  const pictureUrl = (
                    serverEvent as HttpResponse<ProfilePicture>
                  ).body?.pictureUrl;
                  if (pictureUrl) {
                    this.localData.freeVoteProfile.profilePicture = pictureUrl;
                  }
                  break;
                case HttpEventType.ResponseHeader: // 2
                  console.log(`Response Header: ${serverEvent.type}.`);
                  break;
                case HttpEventType.User: // 5
                  console.log(`Surprising upload event: ${serverEvent.type}.`);
              }
            }
          }),
          filter(
            (serverEvent: HttpEvent<ProfilePicture>) =>
              serverEvent.type === HttpEventType.Response
          ),
          tap((serverEvent: HttpEvent<ProfilePicture>) =>
            console.log(serverEvent)
          ),
          map((serverEvent: HttpEvent<ProfilePicture>) => {
            return (serverEvent as HttpResponse<ProfilePicture>).body
              ?.pictureUrl;
          })
        )
        .subscribe({
          next: file => {
            if (file) {
              this.localData.freeVoteProfile.profilePicture = file;
              this.localData.freeVoteProfile.profilePictureOptionID = '2';
              this.localData.SaveValues();
              this.Saved(false);
            }
          },
          error: serverError => this.ShowError(serverError.error.detail)
        });
    }
  }

  profilePictureOptionUpdate(): void {
    this.Saving();

    const profilePicture = {
      profilePictureOptionID:
        this.localData.freeVoteProfile.profilePictureOptionID,
      socialMediaProfilePicture: this.photoUrl // sent whether used or not
    } as ProfilePictureOption;

    this.profileService.profilePictureOptionUpdate(profilePicture).subscribe({
      next: () => this.Saved(false),
      error: serverError => this.ShowError(serverError)
    });
  }

  onConstituencySelect(constituency: Kvp) {
    this.localData.freeVoteProfile.constituency = constituency.key;
  }

  lookupPostCode() {
    this.error = false;
    this.updateMessage = '';
    if (!!this.postcode) {
      this.lookingUpPostcode = true;
      this.democracyClubService
        .ConstituencyForPostcode(this.postcode)
        .subscribe({
          next: constituency => {
            // Geographical
            this.localData.freeVoteProfile.postcode = constituency.postcode;
            this.localData.freeVoteProfile.countryId = constituency.countryID;
            this.localData.freeVoteProfile.cityId = constituency.cityID;
            this.localData.freeVoteProfile.country = constituency.country;
            this.localData.freeVoteProfile.city = constituency.city;

            // National Politics
            this.localData.freeVoteProfile.constituency =
              constituency.constituency;
            this.constituencyID = constituency.constituencyID;

            // Local Politics
            this.localData.freeVoteProfile.ward = constituency.ward;
            this.localData.freeVoteProfile.council = constituency.council;
            this.wardID = constituency.wardID;
            this.lookingUpPostcode = false;
          },
          error: err => {
            this.error = true;
            this.updateMessage = err.error.detail;
            console.log(this.updateMessage);
            this.lookingUpPostcode = false;
          }
        });
    }
  }

  Saving(): void {
    this.localData.updatingProfile = true;
    this.saving = true;
    this.updateMessage = 'saving';
    this.success = false;
    this.error = false;
  }

  Saved(complete: boolean): void {
    // End the edit
    this.localData.updatingProfile = false;
    this.updateMessage = 'saved';
    this.uploading = false;
    this.saving = false;
    this.success = true;
    this.editing = !complete;
  }

  ShowError(err: any): void {
    this.saving = false;
    this.success = false;

    if (err?.error?.detail) {
      this.updateMessage = err.error.detail;
    } else if (err?.error) {
      this.updateMessage = err.error;
    } else if (err) {
      this.updateMessage = err;
    }
    this.error = true;
  }

  ngOnDestroy(): void {
    this.PhotoUrl$?.unsubscribe();
  }
}
