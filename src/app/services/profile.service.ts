// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

// FreeVote
import {
  FreeVoteProfile,
  ProfileEditFormData,
  ProfilePictureOption
} from 'src/app/models/FreeVoteProfile';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private httpService: HttpService) {}

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
