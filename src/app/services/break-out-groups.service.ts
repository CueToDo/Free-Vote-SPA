// Angular
import { Injectable } from '@angular/core';

// rxjs
import { map, Observable, of, tap } from 'rxjs';

// Models
import {
  BreakoutGroup,
  CharacterTheme
} from 'src/app/models/break-out-group.model';
import { Kvp } from 'src/app/models/kvp.model';

// Services
import { HttpService } from 'src/app/services/http.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { F } from '@angular/cdk/keycodes';

@Injectable({
  providedIn: 'root'
})
export class BreakOutGroupsService {
  constructor(
    private httpClientService: HttpService,
    private appData: AppDataService
  ) {}

  characterThemes: CharacterTheme[] = [];
  breakoutGroupCache: BreakoutGroup[] = [];

  BreakoutRooms(tagDIsplay: string): Observable<Kvp[]> {
    return this.httpClientService
      .get(`breakoutGroups/roomsAvailable/${tagDIsplay}`)
      .pipe(map(returnData => returnData as Kvp[]));
  }

  CharacterThemes(): Observable<CharacterTheme[]> {
    if (!!this.characterThemes && this.characterThemes.length > 0) {
      return of(this.characterThemes);
    }

    return this.httpClientService.get('breakoutGroups/characterThemes').pipe(
      tap(
        returnData => (this.characterThemes = returnData as CharacterTheme[])
      ),
      map(returnData => returnData as CharacterTheme[])
    );
  }

  // https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
  ArrayUnique(array: BreakoutGroup[]): BreakoutGroup[] {
    var a = array.concat();

    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i].breakoutGroupID === a[j].breakoutGroupID) a.splice(j--, 1);
        console.log('post splice', a);
      }
    }

    return a;
  }

  // Add newGroups to breakoutGroups - remove any duplicates
  AddGroups(newGroups: BreakoutGroup[]): void {
    console.log('newGroups', newGroups);
    this.breakoutGroupCache = this.ArrayUnique(
      this.breakoutGroupCache.concat(newGroups)
    );
    console.log('cache', this.breakoutGroupCache);
  }

  BreakoutGroupsForTag(
    tagDisplay: string,
    refresh: boolean
  ): Observable<BreakoutGroup[]> {
    let breakoutGroupsFiltered: BreakoutGroup[];

    // Check cache first if not refreshing
    if (!refresh && !!this.breakoutGroupCache) {
      breakoutGroupsFiltered = this.breakoutGroupCache.filter(
        breakoutGroup => breakoutGroup.tagDisplay === tagDisplay
      );

      if (!!breakoutGroupsFiltered && breakoutGroupsFiltered.length >= 1) {
        return of(breakoutGroupsFiltered); // No need to search
      }
    }

    this.breakoutGroupCache = [];

    // Fetch from API, add to cache and return BOGs for Tag
    return this.httpClientService
      .get(`breakoutGroups/breakoutGroupsForTag/${tagDisplay}`)
      .pipe(
        // save copy for break-out group membership in different points
        tap(BoGsForTag => this.AddGroups(BoGsForTag as BreakoutGroup[])),
        map(BoGsForTag => BoGsForTag as BreakoutGroup[])
      );
  }

  // Just those I'm a member of
  GroupMembership(
    tagDisplay: string,
    refresh: boolean
  ): Observable<BreakoutGroup[]> {
    return this.BreakoutGroupsForTag(tagDisplay, refresh).pipe(
      tap(BoGsForTag => console.log(refresh, 'GroupMembership', BoGsForTag)),
      map(BoGsForTag =>
        BoGsForTag.filter(function (bog) {
          return bog.member;
        })
      )
    );
  }

  // no need to refresh if refreshed for Membership
  GroupsAvailable(
    tagDisplay: string,
    refresh: boolean
  ): Observable<BreakoutGroup[]> {
    return this.BreakoutGroupsForTag(tagDisplay, refresh).pipe(
      tap(BoGsForTag => console.log(refresh, 'GroupsAvailable', BoGsForTag)),
      map(BoGsForTag =>
        BoGsForTag.filter(function (bog) {
          return !bog.member && bog.spacesAvailable > 0;
        })
      )
    );
  }

  GroupStart(
    tagDisplay: string,
    breakoutRoomID: number,
    characterThemeID: number
  ): Observable<boolean> {
    return this.httpClientService.get(
      `breakoutGroups/start/${tagDisplay}/${breakoutRoomID}/${characterThemeID}`
    );
  }

  GroupJoin(groupID: number): Observable<boolean> {
    return this.httpClientService.get(`breakoutGroups/join/${groupID}`);
  }
}
