// Comments not permitted in json (package.json --host=127.0.0.1")
// https://stackoverflow.com/questions/72203399/suddenly-gets-could-not-read-source-map-in-vscode-using-angular

// Angular
import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ViewChild,
  OnDestroy,
  HostListener
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// rxjs
import { fromEvent } from 'rxjs';
import { filter, debounceTime, map } from 'rxjs/operators';

// Auth0
import { Auth0Wrapper } from 'src/app/services/auth-wrapper.service';

// FreeVote Services
import { AppService } from 'src/app/services/app.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { LookupsService } from 'src/app/services/lookups.service';
import { TagsService } from 'src/app/services/tags.service';
import { UpdateService } from 'src/app/services/update.service';

// FreeVote Components
import { NavBurgerComponent } from 'src/app/public/menus/nav-burger/nav-burger.component';
import { NavMainComponent } from 'src/app/public/menus/nav-main/nav-main.component';
import { MatDialog } from '@angular/material/dialog';
import { CookieConsentComponent } from './base/cookie-consent/cookie-consent.component';

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // App Component is instantiated once only and we don't need to manage unsubscribe for Subscriptions
  // https://medium.com/angular-in-depth/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0

  @ViewChild('burgerMenu') burgerMenu: NavBurgerComponent | undefined;
  @ViewChild('navMain') navMain: NavMainComponent | undefined;

  routeDisplay = '';
  pageTitleToolTip = '';

  offline = false;

  widthBand = 4; // 0 400, 1 550, 2 700, 3 800, 4 900
  showBurger = false;
  showBurgerMenu = false;

  showVulcan = true;
  imgVulcan = '../assets/Vulcan.png';
  altVulcan = 'Vulcan';
  under500 = false;

  constructor(
    private router: Router,
    public auth0Wrapper: Auth0Wrapper,
    public localData: LocalDataService /* inject to ensure constructed and values Loaded */,
    public appService: AppService,
    private lookupsService: LookupsService,
    private tagsService: TagsService,
    private breakpointObserver: BreakpointObserver,
    private location: Location,
    private titleService: Title,
    private sw: UpdateService,
    @Inject(DOCUMENT) private document: Document,
    // https://stackoverflow.com/questions/39085632/localstorage-is-not-defined-angular-universal
    @Inject(PLATFORM_ID) private platformId: object,
    private dialog: MatDialog
  ) {
    // Set up the subscription to version changes.
    // Service constructor sets up periodic checks
    this.sw.subscribeToUpdates();
  }

  ngOnInit(): void {
    this.localData.Log(`<br><br>APP Initialising`);
    this.localData.LoadClientValues();

    this.cookieConsent();

    // Do this before any API calls
    this.auth0Wrapper.SetUpAuth0Subscriptions();

    this.subscribeNetworkStatus();

    // https://stackoverflow.com/questions/39845082/angular-2-change-favicon-icon-as-per-configuration/45753615
    let favicon = 'favicon.ico';
    switch (this.localData.website) {
      case 'break-out.group':
        favicon = 'lightbulb-idea.ico';
        this.imgVulcan = '../assets/lightbulb-idea.png';
        this.altVulcan = 'lightbulb idea';
        break;
    }

    this.document
      .getElementById('appFavicon')
      ?.setAttribute('href', `/assets/${favicon}?d=${Date.now()}`);

    this.lookupsService.InitialiseStrapline();

    // The app component is re-initialised on callback from Auth0 login

    this.tagsService.InitialisePreviousSlashTagSelected();

    // Route and Route Parameters: Setup and subscribe to changes (SSR and CSR)
    // https://ultimatecourses.com/blog/dynamic-page-titles-angular-2-router-events
    // 1) ngOnInit initialisation for all pages (incl PointShare)
    this.SetTitle(this.router.url);

    // 2) Subscribe to router.events
    // Angular Workshop https://stackoverflow.com/questions/33520043/how-to-detect-a-route-change-in-angular
    // The app component is the main route change detector.
    // It can then dispense this throughout the app via coredata service
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        map(event => event.url)
      )
      .subscribe(url => {
        // broadcast showing tags
        this.SetTitle(url);
        this.closeBurgerMenu();
      });

    // 3) Subscribe to parameter changes raised by child components
    // Parameter change is not a router event (handled by same child component)
    this.appService.RouteParamChange$.subscribe((route: string) => {
      this.SetTitle(route);
    });

    // Viewport Width: Setup and subscribe to changes on browser only - not for Universla SSR

    if (isPlatformBrowser(this.platformId)) {
      this.SetVPW();

      // app component monitors width and broadcasts changes via appServiceService
      fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => {
          this.SetVPW();
        });
    }

    // Observer breakpoints

    // https://alligator.io/angular/breakpoints-angular-cdk/
    this.breakpointObserver
      .observe(['(max-width: 650px)'])
      .subscribe((state: BreakpointState) => {
        this.showBurger = state.matches;
      });

    this.breakpointObserver
      .observe(['(max-width: 500px)'])
      .subscribe((state: BreakpointState) => {
        this.under500 = state.matches;
      });

    this.appService.InputSlashTagOnMobile$.subscribe(istom => {
      // InputSlashTagOnMobile
      // Triggered by HomeComponent (only) on begin or end input
      this.showVulcan = !istom;
    });
  }

  cookieConsent() {
    if (!this.localData.cookieConsent) {
      this.dialog.open(CookieConsentComponent, {
        disableClose: true,
        data: {}
      });
    }
  }

  // https://www.inoaspect.com.au/creating-a-progressive-web-app-pwa-service-to-include-all-features-angular/
  subscribeNetworkStatus() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener(
        NetworkStatus.ONLINE,
        this.onNetworkStatusChange.bind(this)
      );
      window.addEventListener(
        NetworkStatus.OFFLINE,
        this.onNetworkStatusChange.bind(this)
      );
    }
  }

  onNetworkStatusChange() {
    this.offline = !navigator.onLine;
  }

  public SetTitle(route: string): void {
    // Change Page Title, show Vulcan

    // called in ngOnInit and in subscriptions to router events
    // and route parameter change via subject RouteParamChange

    if (route === '/' || route === '' || route.indexOf('/callback') === 0) {
      // Home page
      this.routeDisplay = this.localData.website;

      // https://blog.bitsrc.io/dynamic-page-titles-in-angular-98ce20b5c334
      this.titleService.setTitle(this.routeDisplay);

      this.pageTitleToolTip = this.routeDisplay;

      // Set ShowVulcan to true on route change to home page
      // If home page emits InputSlashTagOnMobile in ngOnInit, get error
      // ExpressionChangedAfterItHasBeenCheckedError
      this.showVulcan = true;
    } else {
      // Anything other than home page

      if (route.indexOf('?') > 0) {
        const raqs = route.split('?'); // Route and QueryString
        route = raqs[0]; // #176 discard query string for facebook shares
      }

      var routeParts = route.split('/');

      if (routeParts.length > 3) routeParts = routeParts.slice(0, 3); // end index is not included

      // No simple remove - create new array with empty first value for leading slash in the join
      if (routeParts[1] == 'points')
        routeParts = [routeParts[0], routeParts[2]];

      // Display the SlashTag in the title
      this.routeDisplay = routeParts.join('/');

      this.pageTitleToolTip =
        route === this.localData.SlashTagSelected
          ? 'SlashTag/' + this.localData.TopicSelected
          : route.substring(1);

      // https://blog.bitsrc.io/dynamic-page-titles-in-angular-98ce20b5c334
      this.titleService.setTitle(this.routeDisplay);

      // Change url in browser's address bar
      // https://angular.io/api/common/Location#!#replaceState-anchor
      // When app is reloaded on callback, do not replaceState
      if (!!route) {
        this.location.replaceState(route);
      }

      this.showVulcan = false;
    }
  }

  SetVPW(): void {
    if (isPlatformBrowser(this.platformId)) {
      // No window object on SSR - no need to set ViewwPort width

      const vpw = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );

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
        this.appService.DisplayWidth$.next(band);
      }
    }
  }

  toggleBurgerMenu() {
    this.showBurgerMenu = !this.showBurgerMenu;
    this.burgerMenu?.ShowMenu(this.showBurgerMenu);
  }

  closeBurgerMenu() {
    this.showBurgerMenu = false;
    this.burgerMenu?.ShowMenu(false);
  }

  vulcan() {
    this.localData.LocalLogging = true;
    this.localData.Log('Logged out via vulcan');
    console.log('vulcan logging updated');
    this.auth0Wrapper.logout();
  }

  // https://stackoverflow.com/questions/75106202/ngondestroy-not-working-if-close-multiple-browser-tabs-at-once
  // Add the HostListener decorator and the async await
  @HostListener('window:beforeunload')
  async ngOnDestroy() {
    // No need to create subscriptions to unsubscribe in app.component
    await this.localData.SaveValues();
  }
}
