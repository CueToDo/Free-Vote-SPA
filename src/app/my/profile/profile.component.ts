// Angular
import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';

// Material
import { MatDialog } from '@angular/material/dialog';

// rxjs
import { fromEvent, Subscription } from 'rxjs';
import {
  tap,
  map,
  filter,
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';

// Models
import { Kvp } from '../../models/kvp.model';
import {
  FreeVoteProfile,
  ProfilePictureOption
} from 'src/app/models/FreeVoteProfile';

// Services
import { AuthService } from 'src/app/services/auth.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { HttpService } from 'src/app/services/http.service';
import { ProfilePicture } from 'src/app/models/Image.model';

// Components
import { DeleteAccountComponent } from 'src/app/my/delete-account/delete-account.component';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnDestroy {
  constituencySearch$: Subscription | undefined;

  // https://medium.com/better-programming/angular-manipulate-properly-the-dom-with-renderer-16a756508cba
  // Use static false when element has *ngIf
  // use hidden on any conditionally inserted parent NOT ngIf
  // hookup runOutsideAngular in ngAfterViewInit
  @ViewChild('tvConstituency', { static: false }) tvConstituency:
    | ElementRef
    | undefined;

  constituencySearch = '';
  fetchingConstituencies = false;

  countries: Kvp[] = [];
  cities: Kvp[] = [];
  constituencies: Kvp[] = [];
  constituenciesFetched = false;

  // Save old values when begin edit
  oldProfile = new FreeVoteProfile();
  public uploadPercentDone = 0;

  editing = false;
  editNewCountry = false;
  editNewCity = false;

  uploading = false;
  saving = false;
  success = false;
  public error = false;
  public updateMessage = '';

  dialogRef: any;

  constructor(
    private authService: AuthService,
    private appDataService: AppDataService,
    public localData: LocalDataService,
    private httpService: HttpService,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    // Debounce the keyup outside of angular zone
    // 2-way databinding already cleans up the slashtag
    // This is just for delayed search

    this.ngZone.runOutsideAngular(() => {
      this.constituencySearch$ = fromEvent<KeyboardEvent>(
        this.tvConstituency?.nativeElement,
        'keyup'
      )
        .pipe(debounceTime(1200), distinctUntilChanged())
        .subscribe({
          next: _ => {
            // Fuzzy search on userInput
            this.ConstituencySearch(this.constituencySearch); // "As-is"
          }
        });
    });
  }

  edit(): void {
    this.error = false;
    this.success = false;
    this.editing = true;

    this.oldProfile = Object.assign({}, this.localData.freeVoteProfile);

    this.GetCountries();
  }

  save(): void {
    if (this.editNewCountry) {
      // Save new text & get ID
      this.editNewCountry = false;
      this.editNewCity = true;
    } else if (this.editNewCity) {
      // Save new text & get ID
      this.editNewCity = false;
    } else {
      this.Saving();
      // Save selected ID
      this.appDataService
        .SaveProfile(this.localData.freeVoteProfile)
        .subscribe({
          next: result => {
            if (result) {
              this.updateMessage = 'saved';

              // Value/IDs updated now update local display text
              this.localData.freeVoteProfile.country =
                this.appDataService.GetKVPKey(
                  this.countries,
                  parseInt(this.localData.freeVoteProfile.countryId, 10)
                );

              this.localData.freeVoteProfile.city =
                this.appDataService.GetKVPKey(
                  this.cities,
                  parseInt(this.localData.freeVoteProfile.cityId, 10)
                );

              this.localData.freeVoteProfile.constituency =
                this.appDataService.GetKVPKey(
                  this.constituencies,
                  parseInt(this.localData.freeVoteProfile.constituencyID, 10)
                );

              this.localData.SaveValues();

              // Save in old profile
              this.oldProfile = Object.assign(
                {},
                this.localData.freeVoteProfile
              );

              this.Saved();
            } else {
              this.updateMessage = 'error';
              this.error = true;
              this.localData.freeVoteProfile = Object.assign(
                {},
                this.oldProfile
              );
              console.log(this.localData.freeVoteProfile);
            }
          },
          error: err => this.ShowError(err)
        });
    }
  }

  deleteAccount(): void {
    this.ShowError('Warning');

    this.dialogRef = this.dialog.open(DeleteAccountComponent, {
      width: '320px',
      data: {
        name: `${this.localData.freeVoteProfile.givenName} ${this.localData.freeVoteProfile.familyName}`
      }
    });

    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result == 'delete') {
        this.appDataService.DELETE_ME().subscribe({
          next: () => {
            this.updateMessage = 'Thank you and goodbye';
            this.authService.logout();
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
    this.editNewCountry = false;
    this.editNewCity = false;
  }

  deleteProfilePictue(): void {
    this.Saving();

    this.httpService.profilePictureDelete().subscribe({
      next: () => {
        this.localData.freeVoteProfile.profilePicture = '';
        this.localData.freeVoteProfile.profilePictureOptionID = '1';
        this.Saved();
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
              this.Saved();
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
      socialMediaProfilePicture: this.localData.auth0Profile.picture // sent whether used or not
    } as ProfilePictureOption;

    this.appDataService.profilePictureOptionUpdate(profilePicture).subscribe({
      next: () => this.Saved(),
      error: serverError => this.ShowError(serverError)
    });
  }

  newCountry(): void {
    this.editNewCountry = true;
    this.localData.freeVoteProfile.country = '';
    this.localData.freeVoteProfile.city = '';
  }

  newCity(): void {
    this.editNewCity = true;
    this.localData.freeVoteProfile.city = '';
  }

  onCountrySelect(countryId: string): void {
    // (already bound to profile countryId)
    this.GetCities(countryId, true);
    this.editNewCity = false;
  }

  GetCountries(): void {
    this.appDataService.GetCountries().subscribe({
      next: value => {
        this.countries = value;
        this.GetCities(this.localData.freeVoteProfile.countryId, false);
      }
    });
  }

  GetCities(countryId: string, newCountry: boolean): void {
    this.appDataService.GetCities(countryId).subscribe({
      next: value => {
        this.cities = value;
        if (newCountry) {
          this.localData.freeVoteProfile.cityId = value[0].value.toString();
        }
      }
    });
  }

  onConstituencySelect(constituencyID: string) {
    this.localData.freeVoteProfile.constituencyID = constituencyID;
  }

  ConstituencySearch(like: string): void {
    if (!like) return;

    this.ngZone.run(_ => {
      this.fetchingConstituencies = true;
      this.constituenciesFetched = false;
    });

    this.appDataService.ConstituencySearch(like).subscribe({
      next: value => {
        this.ngZone.run(_ => {
          this.constituencies = value; // new filtered list
          this.constituenciesFetched = true;

          // Does the new list contain the old value?
          if (
            this.constituencies.filter(
              x =>
                x.value.toString() ===
                this.localData.freeVoteProfile.constituencyID
            ).length !== 1
          ) {
            this.localData.freeVoteProfile.constituencyID =
              this.constituencies[0].value.toString();
          }
        });
      },
      error: err => {
        this.ShowError(err);
      },
      complete: () => {
        this.ngZone.run(_ => (this.fetchingConstituencies = false));
      }
    });
  }

  saveCountry(): void {
    this.Saving();

    this.appDataService
      .CountrySave(this.localData.freeVoteProfile.country)
      .subscribe({
        next: countryID => {
          this.localData.freeVoteProfile.countryId = countryID.toString();
          this.GetCountries();
          this.editNewCountry = false;
          this.Saved();
        },
        error: err => this.ShowError(err)
      });
  }

  saveCity(): void {
    this.Saving();

    this.appDataService
      .CitySave(
        this.localData.freeVoteProfile.countryId,
        this.localData.freeVoteProfile.city
      )
      .subscribe({
        next: cityID => {
          this.localData.freeVoteProfile.cityId = cityID.toString();
          this.GetCities(this.localData.freeVoteProfile.countryId, false);
          this.editNewCity = false;
          this.Saved();
        },
        error: err => this.ShowError(err)
      });
  }

  Saving(): void {
    this.localData.updatingProfile = true;
    this.saving = true;
    this.updateMessage = 'saving';
    this.success = false;
    this.error = false;
  }

  Saved(): void {
    // End the edit
    this.localData.updatingProfile = false;
    this.updateMessage = 'saved';
    this.uploading = false;
    this.saving = false;
    this.success = true;
    this.editing = false;
    this.editNewCountry = false;
    this.editNewCity = false;
  }

  ShowError(err: any): void {
    if (err?.error?.detail) {
      this.updateMessage = err.error.detail;
    } else if (err?.error) {
      this.updateMessage = err.error;
    } else if (err) {
      this.updateMessage = err;
    }
    this.error = true;
  }

  ngOnDestroy() {
    this.constituencySearch$?.unsubscribe();
  }
}
