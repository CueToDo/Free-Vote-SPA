// Angular
import { Injectable } from '@angular/core';

// rxjs
import { map, Observable, of, tap } from 'rxjs';

// Models
import {
  BreakoutGroup,
  Character,
  CharacterTheme
} from 'src/app/models/break-out-group.model';
import { Kvp } from 'src/app/models/kvp.model';

// Services
import { HttpService } from 'src/app/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class BreakOutGroupsService {
  constructor(private httpClientService: HttpService) {}

  BreakoutRooms(constituencyID: number, tagDisplay: string): Observable<Kvp[]> {
    return this.httpClientService
      .get(`breakoutGroups/roomsAvailable/${constituencyID}/${tagDisplay}`)
      .pipe(map(returnData => returnData as Kvp[]));
  }

  RoomCreate(roomName: string): Observable<number> {
    return this.httpClientService.get(`breakoutGroups/roomCreate/${roomName}`);
  }

  RoomInUse(roomID: number): Observable<boolean> {
    return this.httpClientService.get(`breakoutGroups/roomInUse/${roomID}`);
  }

  RoomDelete(roomID: number): Observable<boolean> {
    return this.httpClientService.get(`breakoutGroups/roomDelete/${roomID}`);
  }

  CharacterThemes(): Observable<CharacterTheme[]> {
    return this.httpClientService
      .get('breakoutGroups/characterThemes')
      .pipe(map(returnData => returnData as CharacterTheme[]));
  }

  CharacterThemeCreate(characterThemeName: string): Observable<number> {
    return this.httpClientService.get(
      `breakoutGroups/characterThemeCreate/${characterThemeName}`
    );
  }

  CharacterThemeInUse(themeID: number): Observable<boolean> {
    return this.httpClientService.get(`breakoutGroups/themeInUse/${themeID}`);
  }

  CharacterThemeDelete(themeID: number): Observable<boolean> {
    return this.httpClientService.get(`breakoutGroups/themeDelete/${themeID}`);
  }

  ThemeCharacters(themeID: number): Observable<Character[]> {
    return this.httpClientService
      .get(`breakoutGroups/themeCharacters/${themeID}`)
      .pipe(map(characters => characters as Character[]));
  }

  CharacterCreate(themeID: number, characterName: string): Observable<number> {
    console.log('CharacterCreate', characterName);
    return this.httpClientService.get(
      `breakoutGroups/characterCreate/${themeID}/${characterName}`
    );
  }

  CharacterDelete(themeID: number, characterID: number): Observable<boolean> {
    return this.httpClientService.get(
      `breakoutGroups/characterDelete/${themeID}/${characterID}`
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

  BreakoutGroupsForTag(
    constituencyID: number,
    tagDisplay: string
  ): Observable<BreakoutGroup[]> {
    return this.httpClientService
      .get(
        `breakoutGroups/breakoutGroupsForTag/${constituencyID}/${tagDisplay}`
      )
      .pipe(
        // save copy for break-out group membership in different points
        map(BoGsForTag => BoGsForTag as BreakoutGroup[])
      );
  }

  // Just those I'm a member of
  GroupMembership(
    constituencyID: number,
    tagDisplay: string,
    refresh: boolean
  ): Observable<BreakoutGroup[]> {
    return this.BreakoutGroupsForTag(constituencyID, tagDisplay).pipe(
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
    constituencyID: number,
    tagDisplay: string
  ): Observable<BreakoutGroup[]> {
    return this.BreakoutGroupsForTag(constituencyID, tagDisplay).pipe(
      map(BoGsForTag =>
        BoGsForTag.filter(function (bog) {
          return !bog.member && bog.spacesAvailable > 0;
        })
      )
    );
  }

  GroupStart(
    constituencyID: number,
    tagDisplay: string,
    breakoutRoomID: number,
    characterThemeID: number
  ): Observable<BreakoutGroup> {
    return this.httpClientService.get(
      `breakoutGroups/start/${constituencyID}/${tagDisplay}/${breakoutRoomID}/${characterThemeID}`
    );
  }

  GroupJoin(groupID: number): Observable<boolean> {
    return this.httpClientService.get(`breakoutGroups/join/${groupID}`);
  }

  GroupDelete(groupID: number): Observable<boolean> {
    return this.httpClientService.get(`breakoutGroups/delete/${groupID}`);
  }
}
