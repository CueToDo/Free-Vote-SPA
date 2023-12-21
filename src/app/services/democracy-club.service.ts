// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable, map } from 'rxjs';

// Models
import { Candidate, CandidateSearchResult } from '../models/candidate';

// Services
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class DemocracyClubService {
  constructor(private httpService: HttpService) {}

  Candidates(
    constituencyID: string,
    electionDate: string
  ): Observable<Candidate[]> {
    return this.httpService
      .get(`democracyClub/candidates/${constituencyID}/${electionDate}`)
      .pipe(
        map(value => {
          return value as Candidate[];
        })
      );
  }

  ConstituencyElectionDates(constituency: string): Observable<string[]> {
    return this.httpService
      .get(`democracyClub/electiondates/${constituency}`)
      .pipe(
        map(value => {
          return value as string[];
        })
      );
  }

  ElectionCandidateSearch(
    candidateName: string,
    electedOnly: boolean
  ): Observable<CandidateSearchResult[]> {
    return this.httpService
      .get(
        `democracyClub/electionCandidateSearch/${candidateName}/${electedOnly}`
      )
      .pipe(
        map(value => {
          return value as CandidateSearchResult[];
        })
      );
  }

  ElectedPreviously(
    constituencyID: number,
    currentMPid: number
  ): Observable<Candidate[]> {
    return this.httpService
      .get(`democracyClub/electedPreviously/${constituencyID}/${currentMPid}`)
      .pipe(
        map(value => {
          return value as Candidate[];
        })
      );
  }

  ConstituencySamplePostCode(constituencyID: number): Observable<string> {
    return this.httpService
      .get(`democracyClub/constituencySamplePostCode/${constituencyID}`)
      .pipe(map(postcode => postcode.value));
  }
}
