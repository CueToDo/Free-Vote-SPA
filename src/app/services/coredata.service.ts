import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import { TagDisplayPipe } from './tag-display.pipe';

@Injectable()
export class CoreDataService {

  constructor(private tagDisplayPipe: TagDisplayPipe) { }

  //http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
  private subject = new Subject<string>();

  SetPageTitle(pageTitle: string) {
    console.log('core data service PAGETITLE: ' + pageTitle);
    this.subject.next(pageTitle)
  }

  GetPageTitle(): Observable<string> {
    return this.subject.asObservable();
  }

  TagRoute = "";

  TagDisplay(): string {
    return this.tagDisplayPipe.transform(this.TagRoute);
  }

}
