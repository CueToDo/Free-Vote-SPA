// Angular
import { Injectable } from '@angular/core';

// rxjs
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  // Any subscriptions to the following must be unsubscribed (except in app.component)
  public RouteParamChange$ = new Subject<string>(); // next url with route parameters
  public TagsPointsActive$ = new Subject<boolean>(); // Point Selection - comm between tags and points and nav-items

  // For responsive viewing - BehaviourSubject provides initial value
  public DisplayWidth$ = new BehaviorSubject<number>(5); // Viewport width monitoring
  public InputSlashTagOnMobile$ = new BehaviorSubject<boolean>(false); // ToDo - needs resolving

  constructor() {}
}
