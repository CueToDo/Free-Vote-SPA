import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import { TagDisplayPipe } from './tag-display.pipe';

@Injectable()
export class CoreDataService {

  constructor(private tagDisplayPipe: TagDisplayPipe) { }

  public PageTitle: string;
  public TagRoute: string;
  public TagDisplay: string;

  //http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
  private tagDisplaySubject = new Subject<string>();
  private titleSubject = new Subject<string>();

  SetTagRoute(tagRoute: string) {

    this.TagRoute = tagRoute;
    this.TagDisplay = this.tagDisplayPipe.transform(tagRoute);
    this.PageTitle = this.TagDisplay;

    this.tagDisplaySubject.next(this.TagDisplay);
    this.titleSubject.next(this.TagDisplay);

    return
  }

  GetTagDisplay(): Observable<string> {
    return this.tagDisplaySubject.asObservable();
  }

  SetPageTitle(pageTitle: string) {
    this.PageTitle = pageTitle;
    this.titleSubject.next(pageTitle)
  }

  GetPageTitle(): Observable<string> {
    return this.titleSubject.asObservable();
  }



}
