import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

import { Subscription } from 'rxjs/Subscription';

import { CoreDataService } from './coreservices/coredata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'Free.Vote';
  strapline = 'express yourself honestly, disagree without fear, agree without favour';
  pageTitle = '';

  pageTitleSubscription: Subscription;

  constructor(private coreDataService: CoreDataService) {

    this.pageTitleSubscription = this.coreDataService.GetPageTitle()
      .subscribe(pageTitle => {
        this.pageTitle = pageTitle;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.pageTitleSubscription.unsubscribe();
  }

}
