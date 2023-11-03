// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// Model
import { Organisation } from '../models/organisation.model';
import { PagePreviewMetaData } from '../models/pagePreviewMetaData.model';

// Base Services
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class OrganisationsService {
  constructor(private httpClientService: HttpService) {}

  organisationsSelected: Organisation[] = [];

  OrganisationMembership(searchTerms: string): Observable<Organisation[]> {
    const postData = {
      SearchTerms: searchTerms
    };

    return this.httpClientService
      .post('organisations/membership', postData)
      .pipe(
        // save copy to look up organisationID in group-issues.component
        tap(
          returnData =>
            (this.organisationsSelected = returnData as Organisation[])
        ),
        map(returnData => returnData as Organisation[])
      );
  }

  OrganisationsAvailable(searchTerms: string): Observable<Organisation[]> {
    const postData = {
      SearchTerms: searchTerms
    };

    return this.httpClientService
      .post('organisations/available', postData)
      .pipe(
        // save copy to look up organisationID in group-issues.component
        tap(
          returnData =>
            (this.organisationsSelected = returnData as Organisation[])
        ),
        map(returnData => {
          const parsedJson = JSON.parse(returnData);
          const organisations = new Array();
          Object.assign(organisations, parsedJson);
          return organisations;
        })
      );
  }

  OrganisationSearchByName(organisationName: string): Observable<Organisation> {
    const postData = {
      SearchTerms: organisationName
    };

    return this.httpClientService.post('organisations/search', postData).pipe(
      // add organisation to saved organisations
      tap(returnData => {
        if (!this.organisationsSelected) {
          this.organisationsSelected = [returnData as Organisation];
        } else if (
          !this.organisationsSelected.includes(returnData as Organisation)
        ) {
          this.organisationsSelected.push(returnData as Organisation);
        }
      }),
      map(returnData => returnData as Organisation)
    );
  }

  Organisation(
    organisationName: string,
    refresh: boolean
  ): Observable<Organisation> {
    let organisationsFiltered: Organisation[];
    let organisationChosen: Organisation;

    if (!refresh && !!this.organisationsSelected) {
      organisationsFiltered = this.organisationsSelected.filter(
        organisation => organisation.organisationName === organisationName
      );
      if (!!organisationsFiltered && organisationsFiltered.length === 1) {
        organisationChosen = organisationsFiltered[0];
        return of(organisationChosen!); // No need to search
      }
    }

    return this.OrganisationSearchByName(organisationName);
  }

  Join(organisationID: number): Observable<number> {
    return this.httpClientService.get(`organisation/join/${organisationID}`);
  }

  Leave(organisationID: number): Observable<number> {
    return this.httpClientService.get(`organisation/leave/${organisationID}`);
  }

  Activate(organisationID: number, active: boolean): Observable<boolean> {
    return this.httpClientService.get(
      `organisation/activate/${organisationID}/${active ? 'Y' : 'N'}`
    );
  }

  Update(organisation: Organisation): Observable<Organisation> {
    return this.httpClientService.post('organisation/update', organisation);
  }

  OrganisationWebsiteMetaDataFetch(
    organisationID: number,
    organisationWebsiteUrl: string
  ): Observable<PagePreviewMetaData> {
    const postData = { ID: organisationID, websiteUrl: organisationWebsiteUrl };

    return this.httpClientService
      .post('organisation/organisationMetaDataFetch', postData)
      .pipe(map(result => result as PagePreviewMetaData));
  }

  Delete(organisationID: number): Observable<boolean> {
    return this.httpClientService.get(`organisation/delete/${organisationID}`);
  }
}
