import { Constituency } from './../models/constituency';
// Angular
import { Injectable } from '@angular/core';

// rxjs
import { map, Observable, of, tap } from 'rxjs';

// Models, enums
import { Country } from 'src/app/models/country.model';
import { Kvp } from 'src/app/models/kvp.model';
import { GeographicalExtentID, PointTypesEnum } from 'src/app/models/enums';

// Services
import { LocalDataService } from './local-data.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class LookupsService {
  // Cached lookups - could add more
  private pointTypes: Kvp[] = [];
  private organisationTypes: Kvp[] = [];
  private extents: Kvp[] = []; // GeographicalExtent of group
  private countries: Country[] = [];

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

  public OrganisationTypes(): Observable<Kvp[]> {
    if (!!this.organisationTypes && this.organisationTypes.length > 0) {
      return of(this.organisationTypes);
    } else {
      return this.httpService.get('lookups/organisation-types').pipe(
        map(types => types as Kvp[]),
        tap(types => (this.organisationTypes = types))
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
    if (!!this.extents && this.extents.length > 0) return of(this.extents);

    return this.httpService.get('lookups/geographicalExtents').pipe(
      map(value => value as Kvp[]),
      tap(extents => (this.extents = extents))
    );
  }

  GetCountries(): Observable<Country[]> {
    if (!!this.countries && this.countries.length > 0)
      return of(this.countries);

    return this.httpService
      .get('lookups/countries')
      .pipe(map(value => value as Country[]));
  }

  GetCities(countryID: string): Observable<Kvp[]> {
    return this.httpService
      .get('lookups/cities/' + countryID)
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
