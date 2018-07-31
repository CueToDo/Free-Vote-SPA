import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';

import { Tag } from '../models/tag.model';

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
