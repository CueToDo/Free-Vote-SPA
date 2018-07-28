import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Cookie } from 'ng2-cookies';

import { SignInStatuses } from '../models/enums';
import { SignInData } from '../models/signin.model';

@Injectable()
export class CoreDataService {

  public SpaDomain: string;
  public Website: string;
  public ServiceUrl: string;

  // All Pages?
  public PageTitle: string;
  public SlashTag: string;
  public TagDisplay: string;

  // http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
  private tagDisplaySubject = new Subject<string>();
  private titleSubject = new Subject<string>();

  public get SignInData(): SignInData {

    let signInData = new SignInData();

    if (Cookie.get('SignInData') !== '') {
      signInData = JSON.parse(Cookie.get('SignInData').valueOf());
    }

    return signInData;
  }

  constructor() {

    // check if running locally to determine service url
    this.SpaDomain = window.location.origin.split('//')[1].split(':')[0].replace('api.', '');

    if (this.SpaDomain === 'localhost') {
      this.Website = 'free.vote';
      this.ServiceUrl = 'http://localhost:56529/';
    } else {
      this.Website = this.SpaDomain;
      this.ServiceUrl = 'https://api.free.vote/';
    }

    console.log({ Website: this.Website, ServiceUrl: this.ServiceUrl });
  }

  SignedIn(): boolean {
    const signedIn = this.SignInData.SignInStatus === SignInStatuses.SignInSuccess;
    // console.log('Menu Component Sign In Check: ' + signedIn);
    return signedIn;
  }

  SetTagRoute(tagRoute: string) {

    this.SlashTag = tagRoute;
    this.PageTitle = this.TagDisplay;

    this.tagDisplaySubject.next(this.TagDisplay);
    this.titleSubject.next(this.TagDisplay);

    return;
  }

  GetTagDisplay(): Observable<string> {
    return this.tagDisplaySubject.asObservable();
  }

  SetPageTitle(pageTitle: string) {
    this.PageTitle = pageTitle;
    this.titleSubject.next(pageTitle);
  }

  GetPageTitle(): Observable<string> {
    return this.titleSubject.asObservable();
  }

}
