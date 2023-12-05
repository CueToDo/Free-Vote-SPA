import { Constituency } from './../models/constituency';
// Angular
import { Injectable } from '@angular/core';

// rxjs
import { map, Observable, of, tap } from 'rxjs';

// Models, enums
import { Country } from 'src/app/models/country.model';
import { Kvp } from 'src/app/models/kvp.model';
import { GeographicalExtentID, PointTypesEnum } from 'src/app/models/enums';
import { VotingArea } from 'src/app/models/FreeVoteProfile';

// Services
import { LocalDataService } from './local-data.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class LookupsService {
  // Lookup - could add more
  private pointTypes: Kvp[] = [];
  private extents: Kvp[] = []; // GeographicalExtent of group

  // Not looked up in database - static types
  public porQTypes = [
    { key: 'Action', value: 1 },
    { key: 'Question', value: 2 },
    { key: 'View', value: 3 }
  ] as Kvp[];

  constructor(
    private localData: LocalDataService,
    private httpService: HttpService
  ) {}

  InitialiseStrapline(): void {
    // this.localData.strapline = localStorage.getItem('strapline');
    // strapline is not saved to localStorage, just to localData (in-memory)
    // '' | null is the string 'null', not an empty string
    // string value 'null' is truthy

    if (!this.localData.strapline) {
      this.httpService
        .get(`lookups/website-strapline/${this.localData.website}`)
        .subscribe(strapline => {
          this.localData.strapline = strapline.value;
        });
    }
  }

  public PointTypes(): Observable<Kvp[]> {
    if (!!this.pointTypes && this.pointTypes.length > 0) {
      return of(this.pointTypes);
    } else {
      return this.httpService.get('lookups/point-types').pipe(
        map(types => types as Kvp[]),
        tap(types => (this.pointTypes = types))
      );
    }
  }

  PointType(pointTypeID: number): Observable<string> {
    // Don't subscribe, just return map within pipe
    return this.PointTypes().pipe(
      map(response => response.filter(pt => pt.value === pointTypeID)[0].key)
    );
  }

  ShowSource(pointTypeID: PointTypesEnum): boolean {
    switch (pointTypeID) {
      // It doesn't matter WHO said it - should not sway vote
      case PointTypesEnum.Fact:
      case PointTypesEnum.Quote:
      case PointTypesEnum.CommentOrEditorial:
      case PointTypesEnum.RecommendedReading:
      case PointTypesEnum.RecommendedListening:
      case PointTypesEnum.RecommendedViewing:
      case PointTypesEnum.ReportOrSurvey:
      case PointTypesEnum.NewsReport:
      case PointTypesEnum.Petition:
      case PointTypesEnum.Tweet:
        return true;
      default:
        return false;
    }
  }

  // Database returns a List of Lookup values - a mumerical database ID and a string display Value
  GeographicalExtents(): Observable<Kvp[]> {
    if (!!this.extents && this.extents.length > 0) {
      console.log('RETURNING', this.extents);
      return of(this.extents);
    } else {
      console.log('GETTING');
      return this.httpService.get('lookups/geographicalExtents').pipe(
        map(value => value as Kvp[]),
        tap(extents => (this.extents = extents))
      );
    }
  }

  GetCountries(): Observable<Country[]> {
    return this.httpService
      .get('lookups/countries')
      .pipe(map(value => value as Country[]));
  }

  GetCities(countryID: string): Observable<Kvp[]> {
    return this.httpService
      .get('lookups/cities/' + countryID)
      .pipe(map(value => value as Kvp[]));
  }

  PostCodeSearch(postcode: string): Observable<VotingArea> {
    return this.httpService
      .get(`democracyClub/mapIt/${postcode}`)
      .pipe(map(value => value as VotingArea));
  }

  Constituency(constituency: string): Observable<Constituency> {
    return this.httpService.get(`lookups/constituency/${constituency}`).pipe(
      tap(value => console.log(value)),
      map(value => value as Constituency)
    );
  }

  // No longer used - now use postcode lookup
  ConstituencySearch(like: string): Observable<Kvp[]> {
    return this.httpService
      .get(`lookups/constituencysearch/${like}`)
      .pipe(map(value => value as Kvp[]));
  }

  CountrySave(country: string): Observable<number> {
    return this.httpService
      .get(`lookups/countrySave/${country}`)
      .pipe(map(value => +value));
  }

  CitySave(countryID: string, city: string): Observable<number> {
    return this.httpService
      .get(`lookups/citySave/${countryID}/${city}`)
      .pipe(map(value => +value));
  }

  ShowCountries(geographicalExtentID: string): boolean {
    switch (geographicalExtentID) {
      // Show Countries if region is National:
      case GeographicalExtentID.National.toString():
        return true;
      default:
        return false;
    }
  }

  ShowRegions(geographicalExtentID: string): boolean {
    switch (geographicalExtentID) {
      // Don't Show Regions if:
      case GeographicalExtentID.GlobalOrganisation.toString():
      case GeographicalExtentID.National.toString():
      case GeographicalExtentID.City.toString():
      case GeographicalExtentID.PrivateOrganisation.toString():
        return false;
      default:
        return true;
    }
  }

  ShowCities(geographicalExtentID: string): boolean {
    switch (geographicalExtentID) {
      // Don't Show Cities if:
      case GeographicalExtentID.GlobalOrganisation.toString():
      case GeographicalExtentID.National.toString():
      case GeographicalExtentID.Regional.toString():
      case GeographicalExtentID.PrivateOrganisation.toString():
        return false;
      default:
        return true;
    }
  }
}
