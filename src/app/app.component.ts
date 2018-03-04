import { Component } from '@angular/core';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

//Rx
import { Observable } from 'rxjs/Rx';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

import { CoreDataService } from './services/coredata.service';
import { FBTestComponent } from './fbtest/fbtest.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy {

  title = 'Free.Vote';
  strapline = 'express yourself honestly, disagree without fear, agree without favour';
  pageTitle = "";

  pageTitleSubscription: Subscription;

  constructor(private coreDataService: CoreDataService) {
    console.log('appcomponent constructor');
    this.pageTitleSubscription = this.coreDataService.GetPageTitle()
      .subscribe(pageTitle => {
        console.log('App Component PAGETITLE:' + pageTitle);
        this.pageTitle = pageTitle;
      });
  }

  ngOnInit(){
    console.log('appcomponent onInit');
  }

  ngOnDestroy() {
    this.pageTitleSubscription.unsubscribe();
  }

}
