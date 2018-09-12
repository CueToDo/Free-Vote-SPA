import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';

import { CoreDataService } from './coreservices/coredata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  // Subscriptions
  private routeChangeSubscription: any;

  title = 'https://free.vote';
  strapline = 'express yourself honestly, disagree without fear, agree without favour';
  pageTitle = '';

  pageTitleSubscription: Subscription;


  constructor(private router: Router, private coreDataService: CoreDataService) {

  }


  ngOnInit() {

    // Generally the page title is the slash tag or route
    // This can be overridden by calling SetPageTitle() in CoreDataService which app component subscribes to

    // Angular Workshop https://stackoverflow.com/questions/33520043/how-to-detect-a-route-change-in-angular
    this.routeChangeSubscription = this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        // You only receive NavigationStart events
        this.pageTitle = this.router.url;
        console.log(this.router.url);

      });



    this.pageTitleSubscription = this.coreDataService.GetPageTitle()
      .subscribe(pageTitle => {
        this.pageTitle = pageTitle;
      });

    this.coreDataService.GetPointTypes();
  }

  ngOnDestroy() {
    this.pageTitleSubscription.unsubscribe();
    this.routeChangeSubscription.unsubscribe();
    alert('destroyed');
  }

}
