// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';

// rxjs
import { tap, map, filter } from 'rxjs/operators';

// Models
import { Kvp } from '../../models/kvp.model';
import { FreeVoteProfile } from 'src/app/models/FreeVoteProfile';

// Services
import { AppDataService } from './../../services/app-data.service';
import { LocalDataService } from './../../services/local-data.service';
import { HttpService } from 'src/app/services/http.service';
import { ProfilePicture } from 'src/app/models/Image.model';


@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {

  countries: Kvp[];
  cities: Kvp[];

  // Save old values when begin edit
  oldProfile = new FreeVoteProfile();
  public uploadPercentDone: number;

  editing = false;
  editNewCountry = false;
  editNewCity = false;

  uploading = false;
  saving = false;
  success = false;
  error = false;
  updateMessage = '';

  constructor(
    private appDataService: AppDataService,
    public localData: LocalDataService,
    private httpService: HttpService
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
  }

  edit(): void {
    this.error = false;
    this.success = false;
    this.editing = true;
    this.updateMessage = '';

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
      this.appDataService.SaveProfile(this.localData.freeVoteProfile).subscribe(
        {
          next:
            result => {
              if (result) {
                this.updateMessage = 'saved';

                // Value/IDs updated now update local display text
                this.localData.freeVoteProfile.country =
                  this.appDataService.GetKVPKey(this.countries, parseInt(this.localData.freeVoteProfile.countryId, 10));

                this.localData.freeVoteProfile.city =
                  this.appDataService.GetKVPKey(this.cities, parseInt(this.localData.freeVoteProfile.cityId, 10));

                this.localData.SaveValues();

                // Save in old profile
                this.oldProfile = Object.assign({}, this.localData.freeVoteProfile);

                this.Saved();

              } else {

                this.updateMessage = 'error';
                this.error = true;
                this.localData.freeVoteProfile = Object.assign({}, this.oldProfile);
                console.log(this.localData.freeVoteProfile);
              }
            },
          error: err => this.ShowError(err)
        }
      );
    }

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
    this.httpService.profilePictureDelete().subscribe(
      {
        next: () => {
          this.localData.freeVoteProfile.profilePicture = '';
          this.localData.freeVoteProfile.profilePictureOptionID = '1';
        },
        error: serverError => this.ShowError(serverError.error.detail)
      }
    );
  }

  profilePictureSelected(event: Event): void {

    this.uploading = true;
    this.uploadPercentDone = 0;

    const files: FileList | null = (event.target as HTMLInputElement).files;

    if (!!files) {

      const picture: File = files[0] as File;

      this.httpService.uploadProfilePicture(picture)
        .pipe(
          tap((serverEvent: HttpEvent<ProfilePicture>) => {
            // tap changes nothing in the pipe. What came in goes out
            if (serverEvent !== null) {
              switch (serverEvent.type) {
                case HttpEventType.Sent:
                  console.log(`Uploading file of size ${picture.size}.`);
                  break;
                case HttpEventType.UploadProgress:
                  // Compute and show the % done:
                  const percentDone = Math.round(100 * serverEvent.loaded / serverEvent.total!);
                  this.uploadPercentDone = percentDone;
                  console.log(`File is ${percentDone}% uploaded.`);
                  break;
                case HttpEventType.Response:
                  console.log(`File was completely uploaded!`);
                  console.log((serverEvent as HttpResponse<ProfilePicture>).body);
                  this.localData.freeVoteProfile.profilePicture = (serverEvent as HttpResponse<ProfilePicture>).body!.pictureUrl;
                  break;
                default:
                  console.log(`Surprising upload event: ${serverEvent.type}.`);
              }
            }
          }),
          filter((serverEvent: HttpEvent<ProfilePicture>) => serverEvent.type === HttpEventType.Response),
          tap((serverEvent: HttpEvent<ProfilePicture>) => console.log(serverEvent)),
          map((serverEvent: HttpEvent<ProfilePicture>) => {
            return (serverEvent as HttpResponse<ProfilePicture>).body!.pictureUrl;
          })
        ).subscribe(
          {
            next: file => {
              this.localData.freeVoteProfile.profilePicture = file;
              this.localData.freeVoteProfile.profilePictureOptionID = '2';
              this.localData.SaveValues();
            },
            error: serverError => this.ShowError(serverError.error.detail),
            complete: () => this.uploading = false
          }
        );
    }
  }

  profilePictureOptionUpdate(): void {
    this.appDataService.profilePictureOptionUpdate(this.localData.freeVoteProfile.profilePictureOptionID).subscribe(
      {
        next: () => { },
        error: serverError => this.ShowError(serverError.error.detail)
      }
    );
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
    this.appDataService.GetCountries().subscribe(
      value => {
        this.countries = value;
        this.GetCities(this.localData.freeVoteProfile.countryId, false);
      }
    );
  }

  GetCities(countryId: string, newCountry: boolean): void {
    this.appDataService.GetCities(countryId).subscribe(
      value => {
        this.cities = value;
        if (newCountry) {
          this.localData.freeVoteProfile.cityId = value[0].value.toString();
        }
      }
    );
  }

  saveCountry(): void {

    this.Saving();

    this.appDataService.CountrySave(this.localData.freeVoteProfile.country).subscribe(
      {
        next: countryID => {
          this.localData.freeVoteProfile.countryId = countryID.toString();
          this.GetCountries();
          this.editNewCountry = false;
        },
        error: err => this.ShowError(err)
      }
    );
  }

  saveCity(): void {

    this.Saving();

    this.appDataService.CitySave(this.localData.freeVoteProfile.countryId,
      this.localData.freeVoteProfile.city).subscribe(
        {
          next: cityID => {
            this.localData.freeVoteProfile.cityId = cityID.toString();
            this.GetCities(this.localData.freeVoteProfile.countryId, false);
            this.editNewCity = false;
          },
          error: err => this.ShowError(err)
        }
      );
  }

  Saving(): void {
    this.saving = true;
    this.updateMessage = 'saving';
    this.success = false;
    this.error = false;
  }

  Saved(): void {
    // End the edit
    this.saving = false;
    this.success = true;
    this.editing = false;
    this.editNewCountry = false;
    this.editNewCity = false;
  }

  ShowError(err: any): void {
    if (err.error.detail) {
      this.updateMessage = err.error.detail;
    } else if (err.error) {
      this.updateMessage = err.error;
    } else if (err) {
      this.updateMessage = err;
    }
    this.error = true;
  }

}
