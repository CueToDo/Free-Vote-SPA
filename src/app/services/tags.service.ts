import { AppSettingsModule } from '../app.settings.module'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from './http-client.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Injectable()
export class TagsService {

  private WebAPIUrl = AppSettingsModule.ServiceUrl + "Tags/trending/free.vote";

  constructor(private httpClientService: HttpClientService) {
    console.log('tags.service');
    console.log('WebAPIUrl:' + this.WebAPIUrl);
  }

  //OnInit() work with Directives and Components. 
  //They do not work with other types, like a service 


  Trending(): Observable<any> {
    return this.httpClientService
      .get(this.WebAPIUrl)
  }
}

export class Tag {
  TagName: string;
  TagWeight: number;
}