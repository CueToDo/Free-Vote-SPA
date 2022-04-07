// Angular
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Models
import { TagCloudTypes } from '../models/enums';
import { Tag } from '../models/tag.model';
import { ByOn } from '../models/ByOn.model';

// Services
import { LocalDataService } from './local-data.service';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class TagsService {
  constructor(
    private localData: LocalDataService,
    private httpService: HttpService
  ) {}

  // OnInit() works with Directives and Components.
  // It does not work with other types, like a service

  // App start only - get previous Alias and Topic Selected from Local Storage or database
  // But NOT on return from sign out
  InitialisePreviousSlashTagSelected(): void {
    // LocalData LoadValues (called from its constructor) handles initial set up

    if (!this.localData.PreviousSlashTagSelected) {
      this.TagLatestActivity().subscribe({
        next: previousSlashTagSelected => {
          this.localData.PreviousSlashTagSelected = previousSlashTagSelected;
        },
        error: error =>
          console.log('Server Error on getting trending topics', error)
      });
    } else if (this.localData.PreviousTopicSelected === 'SignedOut') {
      this.localData.PreviousSlashTagSelected = '';
    }
  }

  TagLatestActivity(): Observable<string> {
    return this.httpService.get('tags/tagLatestActivity');
  }

  // // Following not necessary on INITIALISE??
  // // BehaviourSubjects already initialised with empty topic
  // this.SetByOnTopic(this.previousAliasSelected, this.PreviousTopicSelected);

  // New SlashTag selected in tags component, tag search and new point
  SetSlashTag(slashTag: string): void {
    this.localData.PreviousSlashTagSelected = slashTag;
    this.localData.ActiveAliasForFilter = '';
  }

  TagSearch(tagsearch: string): Observable<Tag[]> {
    // get rid of slash and dash
    tagsearch = tagsearch.split('/').join('');
    tagsearch = tagsearch.split('-').join('');

    let WebAPIUrl = `tags/search/${tagsearch}`;

    return this.httpService.get(WebAPIUrl).pipe(map(data => data as Tag[]));
  }

  TagCloud(type: TagCloudTypes): Observable<Tag[]> {
    let WebAPIUrl = '';

    switch (type) {
      case TagCloudTypes.Recent:
        WebAPIUrl = 'tags/cloud/recent';
        break;
      default:
        WebAPIUrl = 'tags/cloud/trending';
        break;
    }

    return this.httpService.get(WebAPIUrl).pipe(map(data => data as Tag[]));
  }

  ByAliases(dateFrom: string, dateTo: string): Observable<ByOn[]> {
    const WebAPIUrl = 'tags/byaliases';

    const postData = { dateFrom, dateTo };

    return this.httpService
      .post(WebAPIUrl, postData)
      .pipe(map(data => data as ByOn[])); // A "ByOn" cloud
  }

  TopicsByAlias(
    byAlias: string,
    dateFrom: string,
    dateTo: string
  ): Observable<ByOn[]> {
    const WebAPIUrl = 'tags/byalias';

    const postData = { byAlias: byAlias, dateFrom: dateFrom, dateTo: dateTo };

    return this.httpService
      .post(WebAPIUrl, postData)
      .pipe(map(data => data as ByOn[])); // A "ByOn" cloud
  }
}
