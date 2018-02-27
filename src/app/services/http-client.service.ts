import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { RequestOptionsArgs, Headers  } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Cookie } from 'ng2-cookies';

const ServiceUrl = 'http://localhost:56529/';
//const ServiceUrl = 'http://freevote-002-site1.btempurl.com/';
//const ServiceUrl = 'http://api.free.vote/';

@Injectable()
export class HttpClientService {

  letx=1;
  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
  }

  RequestHeaders() {
    //https://stackoverflow.com/questions/45286764/angular-4-3-httpclient-doesnt-send-header/45286959#45286959
    //The instances of the new HttpHeader class are immutable objects.
    //state cannot be changed after creation
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('SignInData', Cookie.get('SignInData').valueOf());
    return { headers: headers };
  }

  //Observable<Object>
  get(url) {
    return this.httpClient.get(ServiceUrl + url, this.RequestHeaders());
  }

  post(url, data) {
    return this.httpClient.post(ServiceUrl + url, JSON.stringify(data), this.RequestHeaders());
  }

}


