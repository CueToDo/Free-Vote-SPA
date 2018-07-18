import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { RequestOptionsArgs, Headers  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Cookie } from 'ng2-cookies';

import { } from 'rxjs/add/operator/map';

import { CoreDataService } from './coredata.service';
import { SignInStatuses } from '../models/enums';
import { SignInData } from '../models/signin.model';

@Injectable()
export class HttpClientService {

  private website: string;
  private serviceUrl: string;

  private sessionID(): string {
    const id: string = Cookie.get('SessionID').valueOf();
    return id === '' ? '0' : id;
  }

  constructor(private httpClient: HttpClient, private coreDataService: CoreDataService) {

    this.website = coreDataService.Website;
    this.serviceUrl = coreDataService.ServiceUrl;

    if (!coreDataService.SignInData.JWT) {
      console.log('NO JWT - renew SessionID in constructor');
      this.SessionKeepAlive();
    }
  }

  SessionKeepAlive() {
    // If there's no JWT then must get SessionID
    this.SessionIDRenew()
      .then(sessionID => {
        Cookie.set('SessionID', sessionID);
      });
  }

  SessionIDRenew(): Promise<string> {
    return this.get('authentication/sessionidrenew/' + this.sessionID())
      .then(response => response.SessionID);
  }


  RequestHeaders() {



    // https://stackoverflow.com/questions/45286764/angular-4-3-httpclient-doesnt-send-header/45286959#45286959
    // The instances of the new HttpHeader class are immutable objects.
    // state cannot be changed after creation

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Website', this.website)
      .set('SessionID', this.sessionID())
      .set('JWT', this.coreDataService.SignInData.JWT);

    return { headers: headers };
  }


  get(url): Promise<any> {
    if (!url.includes('sessionidrenew')) { this.SessionKeepAlive(); }
    return this.httpClient.get(this.serviceUrl + url, this.RequestHeaders()).toPromise();
  }


  post(url, data): Promise<any> {

    this.SessionKeepAlive();

    return this.httpClient
      .post(this.serviceUrl + url,
        JSON.stringify(data),
        this.RequestHeaders())
      .toPromise();
  }

}
