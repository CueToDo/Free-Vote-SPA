import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { RequestOptionsArgs, Headers  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Cookie } from 'ng2-cookies';

import { } from 'rxjs/add/operator/map';

@Injectable()
export class HttpClientService {

  private readonly spaDomain: string;
  //private readonly serviceUrl: string = 'http://localhost:56529/';
  private readonly serviceUrl: string = 'http://api.free.vote/';

  private sessionID: string = Cookie.get('SessionID').valueOf();;
  private jwt: string = Cookie.get('JWT').valueOf();

  constructor(private httpClient: HttpClient) {

    this.spaDomain = window.location.origin.split("//")[1].split(":")[0].replace('api.','');

    if (this.spaDomain == 'localhost') this.spaDomain = 'free.vote';

    console.log({ SPADomain: this.spaDomain, SessionID: this.sessionID, JWT: this.jwt })

    if (!this.jwt && !this.sessionID) {

      //If there's no JWT then must get SessionID
      this.SessionIDNew()
        .then(sessionID => {
          Cookie.set('SessionID', sessionID);
          console.log(sessionID);
        })
    }
  }


  SessionIDNew(): Promise<string> {
    return this.post('authentication/sessionidnew/', {})
      .then(response => response.SessionID);
  }


  RequestHeaders() {

    //https://stackoverflow.com/questions/45286764/angular-4-3-httpclient-doesnt-send-header/45286959#45286959
    //The instances of the new HttpHeader class are immutable objects.
    //state cannot be changed after creation

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Website', this.spaDomain)
      .set('SessionID', this.sessionID)
      .set('JWT', this.jwt);

    return { headers: headers };
  }


  get(url): Promise<any> {
    return this.httpClient.get(this.serviceUrl + url, this.RequestHeaders()).toPromise();
  }


  post(url, data): Promise<any> {

    return this.httpClient
      .post(this.serviceUrl + url,
        JSON.stringify(data),
        this.RequestHeaders())
      .toPromise();
  }

}