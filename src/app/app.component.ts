// Angular
import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OnInit, OnDestroy } from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

// rxjs
import { fromEvent } from 'rxjs';

// ngx-bootstrap
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';

// Auth0
import { AuthService } from './services/auth.service';

// FreeVote Models, Services
import { LocalDataService } from './services/local-data.service';
import { AppDataService } from './services/app-data.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { filter, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: false, autoClose: true } }]
})
export class AppComponent implements OnInit, OnDestroy {

  // App Component is instantiated once only and we don't need to manage unsubscribe for Subscriptions
  // https://medium.com/angular-in-depth/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0

  home = false;
  pageTitle = '';
  pageTitleToolTip = '';

  localAPI: string;

  widthBand: number; // 0 400, 1 550, 2 700, 3 800, 4 900

  public showBurger = false;
  public showVulcan = true;
  public imgVulcan = '../assets/Vulcan.png';
  public altVulcan = 'Vulcan';
  public under500 = false;


  constructor(
    private router: Router,
    private auth: AuthService,
    public localData: LocalDataService, /* inject to ensure constructed and values Loaded */
    public appData: AppDataService,
    private breakpointObserver: BreakpointObserver,
    private location: Location,
    private titleService: Title,
    @Inject(DOCUMENT) private htmlDocument: HTMLDocument) { }


  ngOnInit() {

    // https://stackoverflow.com/questions/39845082/angular-2-change-favicon-icon-as-per-configuration/45753615
    let favicon = 'favicon.ico';
    switch (this.localData.website) {
      case 'break-out.group':
        favicon = 'lightbulb-idea.ico';
        this.imgVulcan = '../assets/lightbulb-idea.png';
        this.altVulcan = 'lightbulb idea';
        break;
    }

    if (this.localData.GetItem('localAPI') === 'true') {
      this.localAPI = 'Local API';
    }

    this.htmlDocument.getElementById('appFavicon').setAttribute('href', `/assets/${favicon}?d=${Date.now()}`);

    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    this.auth.localAuthSetup();
    this.appData.InitialiseStrapline();

    // The app component is initialised when we come back from Auth0 login
    // Wait until we have a pukka free.vote jwt before doing the following

    if (!this.localData.loggingInToAuth0 && !this.localData.gettingFreeVoteJwt) {
      // Is this now queued and can proceed without the above guard?
      this.appData.InitialisePreviousSlashTagSelected();
      this.RouteOrParamsUpdated(this.router.url);
    }

    // Route and Route Parameters: Setup and subscribe to changes

    // Angular Workshop https://stackoverflow.com/questions/33520043/how-to-detect-a-route-change-in-angular
    // The app component is the main route change detector.
    // It can then dispense this throughout the app via coredata service
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        // broadcast showing tags
        this.RouteOrParamsUpdated(this.router.url);

      });

    // app.compnent responds to child component changes
    // ie route parameters changes that it can't detect itself
    this.appData.RouteParamChange$.subscribe(
      (url: string) => {
        this.RouteOrParamsUpdated(url);
      }
    );


    // Viewport Width: Setup and subscribe to changes

    this.SetVPW();

    // app component monitors width and broadcasts changes via appDataService
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.SetVPW();
      });

    // Observer breakpoints

    // https://alligator.io/angular/breakpoints-angular-cdk/
    this.breakpointObserver.observe(['(max-width: 600px)'])
      .subscribe((state: BreakpointState) => {
        this.showBurger = state.matches;
        this.appData.ShowBurger$.next(this.showBurger);
      });

    this.breakpointObserver.observe(['(max-width: 500px)'])
      .subscribe((state: BreakpointState) => {
        this.under500 = state.matches;
      });

    this.appData.InputSlashTagOnMobile$.subscribe(istom => {
      // InputSlashTagOnMobile
      // Triggered by HomeComponent (only) on begin or end input
      this.showVulcan = !istom;
    });

  }

  setDocTitle(title: string) {
    // https://blog.bitsrc.io/dynamic-page-titles-in-angular-98ce20b5c334
    this.titleService.setTitle(title);
  }

  public RouteOrParamsUpdated(url: string) {

    this.appData.Route = url;

    if (url === '/' || url === '' || url.indexOf('/callback') === 0) {
      // Home page
      this.home = true;
      this.pageTitle = '';
      this.setDocTitle(this.localData.website);
      // Set ShowVulcan to true on route change to home page
      // If home page emits InputSlashTagOnMobile in ngOnInit, get error
      // ExpressionChangedAfterItHasBeenCheckedError
      this.showVulcan = true;
    } else {
      this.home = false;
      if (url.indexOf('?') > 0) {
        url = url.split('?')[0]; // #176 discard query string for facebook shares
      }
      this.pageTitle = url;
      this.pageTitleToolTip = url === this.localData.PreviousSlashTagSelected
        ? 'SlashTag/' + this.localData.PreviousTopicSelected : url.substr(1);

      if (url.indexOf('slash-tags') > -1) {
        this.appData.PageName$.next('slashTags');
        this.setDocTitle('Slash Tags');
      } else if (url.indexOf('/my/details') > -1) {
        this.appData.PageName$.next('profile');
        this.setDocTitle('Voter Profile');
      } else {
        this.setDocTitle(this.localData.SlashTagToTopic(this.pageTitle));
      }

      // https://angular.io/api/common/Location#!#replaceState-anchor
      // change url in browser's address bar

      // When app is reloaded on callback, do not replaceState
      if (url) {
        this.location.replaceState(url);
      }

      // Only show Vulcan on home page
      // this will be updated on begin or end input on home page
      this.showVulcan = this.home;
    }

  }

  SetVPW() {

    const vpw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    let band: number;

    // Restict Weight and font-size for smaller screens
    if (vpw < 400) {
      band = 0;
    } else if (vpw < 550) {
      band = 1;
    } else if (vpw < 700) {
      band = 2;
    } else if (vpw < 800) {
      band = 3;
    } else if (vpw < 900) {
      band = 4;
    } else {
      band = 5;
    }

    if (this.widthBand !== band) {
      this.widthBand = band;
      this.appData.DisplayWidth$.next(band);
    }
  }

  toggleLocalAPI() {

    if (this.localData.GetItem('localAPI') === 'true') {
      this.localData.SetItem('localAPI', 'false');
      this.localAPI = '';
    } else {
      this.localData.SetItem('localAPI', 'true');
      this.localAPI = 'Local API';
    }

    this.localData.SetServiceURL();
  }

  ngOnDestroy() {
    // No need to create subscriptions to unsubscribe in app.component
  }

}
