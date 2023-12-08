// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable, map } from 'rxjs';

// Models
import { Candidate } from '../models/candidate';

// Services
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class DemocracyClubService {
  constructor(private httpService: HttpService) {}

  Candidates(
    constituencyID: string,
    nextElection: boolean
  ): Observable<Candidate[]> {
    return this.httpService
      .get(`democracyClub/candidates/${constituencyID}/${nextElection}`)
      .pipe(
        map(value => {
          console.log(value);
          return value as Candidate[];
        })
      );
  }
}
