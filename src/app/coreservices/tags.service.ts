import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClientService } from './http-client.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';


@Injectable()
export class TagsService {

  private WebAPIUrl = 'tags/trending';

  constructor(private httpClientService: HttpClientService) {
  }

  // OnInit() work with Directives and Components.
  // They do not work with other types, like a service


  Trending(): Promise<Tag[]> {
    return this.httpClientService
      .get(this.WebAPIUrl)
      .then(data => data as Tag[]);
  }

}


export class Tag {
  TagName: string;
  TagWeight: number;
}
