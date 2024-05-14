// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

import { HttpService } from './http.service';

// Models
import {
  FreeVoteProfile,
  ProfileEditFormData,
  ProfilePictureOption
} from 'src/app/models/FreeVoteProfile';

// Services
import { LocalDataService } from './local-data.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private localData: LocalDataService,
    private httpService: HttpService
  ) {}

  GetProfile(): Observable<FreeVoteProfile> {
    return this.httpService.get(`profile/voter/${this.localData.SPAWebsite}`);
  }

  SaveProfile(profile: FreeVoteProfile): Observable<boolean> {
    const profileUpdate = {
      alias: profile.alias,
      firstName: profile.givenName,
      lastName: profile.familyName,
      postcode: profile.postcode,
      countryID: Number(profile.countryId),
      cityID: Number(profile.cityId),
      constituencyID: Number(profile.constituencyID),
      wardID: Number(profile.wardID)
    } as ProfileEditFormData;

    return this.httpService.post('profile/profilesave', profileUpdate);
  }

  // Voter Delete
  DELETE_ME() {
    return this.httpService.get('profile/voterdelete');
  }

  profilePictureOptionUpdate(
    profilePicture: ProfilePictureOption
  ): Observable<string> {
    return this.httpService.post(
      'profile/profilePictureOption',
      profilePicture
    );
  }
}
