// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable, map, take } from 'rxjs';

// Models
import { Candidate } from '../models/candidate.model';
import { Constituency } from '../models/constituency.model';
import { ElectionDate } from '../models/electionDate';
import { Kvp } from '../models/kvp.model';

// Services
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class DemocracyClubService {
  constructor(private httpService: HttpService) {}

  Constituency(constituency: string): Observable<Constituency> {
    return this.httpService
      .get(`democracyClub/constituency/${constituency}`)
      .pipe(
        take(1),
        map(value => value as Constituency)
      );
  }

  ConstituencySearch(like: string): Observable<Constituency[]> {
    return this.httpService
      .get(`democracyClub/constituencysearch/${like}`)
      .pipe(
        take(1),
        map(value => value as Constituency[])
      );
  }

  ConstituencyForPostcode(postcode: string): Observable<Constituency> {
    return this.httpService
      .get(`democracyClub/constituencyForPostcode/${postcode}`)
      .pipe(
        take(1),
        map(value => value as Constituency)
      );
  }

  ConstituencySamplePostCode(
    constituencyID: number,
    constituencyName: string
  ): Observable<string> {
    return this.httpService
      .get(
        `democracyClub/constituencySamplePostCode/${constituencyID}/${constituencyName}`
      )
      .pipe(
        take(1),
        map(postcode => postcode.value)
      );
  }

  ConstituencyElectionDates(constituency: string): Observable<ElectionDate[]> {
    return this.httpService
      .get(`democracyClub/electiondates/${constituency}`)
      .pipe(map(value => value as ElectionDate[]));
  }

  PartiesMajor(): Observable<Kvp[]> {
    return this.httpService.get('democracyClub/partiesMajor').pipe(
      take(1),
      map(value => value as Kvp[])
    );
  }

  PartiesMinor(partyNameLike: string): Observable<Kvp[]> {
    return this.httpService
      .get(`democracyClub/partiesMinor/${partyNameLike}`)
      .pipe(
        take(1),
        map(value => value as Kvp[])
      );
  }

  PoliticianAdd(
    politicianID: number,
    politician: string,
    partyID: number
  ): Observable<string> {
    return this.httpService
      .get(
        `democracyClub/politicianAdd/${politicianID}/${politician}/${partyID}`
      )
      .pipe(take(1));
  }

  // Returns whether politician elected as a result of this update
  PoliticianUpdate(politician: Candidate): Observable<boolean> {
    return this.httpService
      .post('democracyClub/politicianUpdate', politician)
      .pipe(take(1));
  }

  ElectionCandidates(
    constituencyID: number,
    electionDate: string
  ): Observable<Candidate[]> {
    return this.httpService
      .get(`democracyClub/electionCandidates/${constituencyID}/${electionDate}`)
      .pipe(
        take(1),
        map(value => {
          return value as Candidate[];
        })
      );
  }

  ElectionCandidateSearch(
    candidateName: string,
    westminsterOnly: boolean,
    electedOnly: boolean
  ): Observable<Candidate[]> {
    return this.httpService
      .get(
        `democracyClub/electionCandidateSearch/${candidateName}/${westminsterOnly}/${electedOnly}`
      )
      .pipe(
        take(1),
        map(value => {
          return value as Candidate[];
        })
      );
  }

  ElectionCandidateAdd(
    electionID: number,
    constituencyID: number,
    politicianID: number,
    organisationID: number
  ): Observable<boolean> {
    return this.httpService
      .get(
        `democracyClub/electionCandidateAdd/${electionID}/${constituencyID}/${politicianID}/${organisationID}`
      )
      .pipe(take(1));
  }

  ElectionCandidateRemove(
    electionID: number,
    constituencyID: number,
    politicianID: number
  ): Observable<boolean> {
    return this.httpService
      .get(
        `democracyClub/electionCandidateRemove/${electionID}/${constituencyID}/${politicianID}`
      )
      .pipe(take(1));
  }

  ElectedPreviously(constituencyID: number): Observable<Candidate[]> {
    return this.httpService
      .get(`democracyClub/electedPreviously/${constituencyID}`)
      .pipe(
        take(1),
        map(value => {
          return value as Candidate[];
        })
      );
  }
}
