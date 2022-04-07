// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

// FreeVote
import {
  FreeVoteProfile,
  ProfilePictureOption
} from 'src/app/models/FreeVoteProfile';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private httpService: HttpService) {}

  SaveProfile(profile: FreeVoteProfile): Observable<boolean> {
    return this.httpService.post('profile/profilesave', profile);
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
