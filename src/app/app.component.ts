// Angular
import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Location, DOCUMENT, isPlatformBrowser } from '@angular/common';
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
import { filter, debounceTime, map } from 'rxjs/operators';
import { PagePreviewMetaData } from './models/point.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: { isAnimated: false, autoClose: true }
    }
  ]
})
export class AppComponent implements OnInit, AfterViewInit {
  // App Component is instantiated once only and we don't need to manage unsubscribe for Subscriptions
  // https://medium.com/angular-in-depth/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0

  routeDisplay = '';
  pageTitleToolTip = '';

  localAPI = '';

  widthBand = 4; // 0 400, 1 550, 2 700, 3 800, 4 900

  public showBurger = false;
  public showVulcan = true;
  public imgVulcan = '../assets/Vulcan.png';
  public altVulcan = 'Vulcan';
  public under500 = false;

  pass = 0;

  constructor(
    private router: Router,
    public auth: AuthService,
    public localData: LocalDataService /* inject to ensure constructed and values Loaded */,
    public appData: AppDataService,
    private breakpointObserver: BreakpointObserver,
    private location: Location,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private htmlDocument: HTMLDocument,
    // https://stackoverflow.com/questions/39085632/localstorage-is-not-defined-angular-universal
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.appData.GetLatestSPAVersion();

    // https://stackoverflow.com/questions/39845082/angular-2-change-favicon-icon-as-per-configuration/45753615
    let favicon = 'favicon.ico';
    switch (this.localData.website) {
      case 'break-out.group':
        favicon = 'lightbulb-idea.ico';
        this.imgVulcan = '../assets/lightbulb-idea.png';
        this.altVulcan = 'lightbulb idea';
        break;
    }

    this.htmlDocument
      .getElementById('appFavicon')
      ?.setAttribute('href', `/assets/${favicon}?d=${Date.now()}`);

    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    this.auth.localAuthSetup();
    this.appData.InitialiseStrapline();

    // The app component is initialised when we come back from Auth0 login
    // Wait until we have a pukka free.vote jwt before doing the following
    this.localData.GotFreeVoteJwt$.subscribe({
      next: _ => this.appData.InitialisePreviousSlashTagSelected()
    });

    // Route and Route Parameters: Setup and subscribe to changes (SSR and CSR)
    // https://ultimatecourses.com/blog/dynamic-page-titles-angular-2-router-events
    // 1) ngOnInit initialisation for all pages (incl PointShare)
    console.log('ngOnInit RouteOrParamsUpdated called');
    this.RouteOrParamsUpdated(this.router.url);

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
        console.log('router event RouteOrParamsUpdated called');
        this.appData.SpaVersionUpdateCheck(); // Every route change
        this.RouteOrParamsUpdated(url);
      });

    // 3) Subscribe to parameter changes raised by child components
    // Parameter change is not a router event (handled by same child component)
    this.appData.RouteParamChange$.subscribe((route: string) => {
      console.log('route parameter change RouteOrParamsUpdated called');
      this.RouteOrParamsUpdated(route);
    });

    // 4) Special case for point share with dynamic PagePreviewMetaData
    // SSR Meta Data
    this.appData.SSRInitialMetaData$.subscribe({
      next: (metaData: PagePreviewMetaData) => {
        this.setMetaData(
          metaData.title,
          metaData.description,
          '' /* additional keywords */,
          metaData.pagePath,
          metaData.image
        );
      }
    });

    // Viewport Width: Setup and subscribe to changes on browser only - not for Universla SSR

    if (isPlatformBrowser(this.platformId)) {
      this.SetVPW();

      // app component monitors width and broadcasts changes via appDataService
      fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => {
          this.SetVPW();
        });
    }

    // Observer breakpoints

    // https://alligator.io/angular/breakpoints-angular-cdk/
    this.breakpointObserver
      .observe(['(max-width: 600px)'])
      .subscribe((state: BreakpointState) => {
        this.showBurger = state.matches;
        this.appData.ShowBurger$.next(this.showBurger);
      });

    this.breakpointObserver
      .observe(['(max-width: 500px)'])
      .subscribe((state: BreakpointState) => {
        this.under500 = state.matches;
      });

    this.appData.InputSlashTagOnMobile$.subscribe(istom => {
      // InputSlashTagOnMobile
      // Triggered by HomeComponent (only) on begin or end input
      this.showVulcan = !istom;
    });
  }

  ngAfterViewInit(): void {
    if (this.localData.GetItem('localAPI') === 'true') {
      this.localAPI = 'Local API';
    }
  }

  setDocTitle(title: string): void {
    // https://blog.bitsrc.io/dynamic-page-titles-in-angular-98ce20b5c334
    this.titleService.setTitle(title);
  }

  setMetaData(
    title: string,
    preview: string,
    csvAdditionalKeywords: string,
    pagePath: string,
    previewImage: string
  ): void {
    // https://www.tektutorialshub.com/angular/meta-service-in-angular-add-update-meta-tags-example/
    // https://css-tricks.com/essential-meta-tags-social-media/

    // Requires Angular Universal Server Side Rendering for Social media use
    // https://stackoverflow.com/questions/45262719/angular-4-update-meta-tags-dynamically-for-facebook-open-graph

    // Don't overwrite existing meta with home meta
    if (
      title === this.localData.website &&
      !!this.metaService.getTag(`property='og:title'`)
    ) {
      console.log('Meta prevent home page overwrite');
      return;
    }

    console.log(
      'SETTING META DATA - Title:',
      title,
      'Preview:',
      preview,
      'Image:',
      previewImage
    );

    // ToDo remove debugging info
    this.pass++;
    this.metaService.addTag({
      property: `pass ${this.pass}`,
      content: `server ${isPlatformServer(
        this.platformId
      )} PagePath: ${pagePath} Title: ${title} Preview: ${preview}`
    });

    // 1) Title: remove and conditionally add
    this.metaService.removeTag(`property='og:title'`);
    this.metaService.removeTag(`name='twitter:title'`);

    if (title) {
      this.metaService.addTags([
        { property: 'og:title', content: title },
        { name: 'twitter:title', content: title }
      ]);
    }

    // 2) Description preview
    this.metaService.updateTag({ name: 'description', content: preview });
    this.metaService.updateTag({
      property: 'og:description',
      content: preview
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: preview
    });

    // 3) Keywords
    this.metaService.updateTag({
      name: 'keywords',
      content: `${this.appData.keywords}, ${csvAdditionalKeywords}`
    });

    // 4) og:url remove and conditionally add
    this.metaService.removeTag(`property='og:url'`);

    const websiteUrlWTS = this.localData.websiteUrlWTS;

    const url = `${websiteUrlWTS}/${this.appData.removeBookEnds(
      pagePath,
      '/'
    )}`;

    if (url) {
      this.metaService.addTags([{ property: 'og:url', content: url }]);
    }

    // 5) og:type
    this.metaService.updateTag({ property: 'og:type', content: 'article' });

    // 6) twitter:card
    // card type: “summary”, “summary_large_image”, “app”, or “player”.
    this.metaService.removeTag(`name='twitter:card'`);

    if (preview && previewImage) {
      this.metaService.addTags([
        { name: 'twitter:card', content: 'summary_large_image' }
      ]);
    } else if (preview) {
      this.metaService.addTag({ name: 'twitter:card', content: 'summary' });
    }

    // 7) PreviewImage remove and conditionally add
    this.metaService.removeTag(`property='og:image'`);
    this.metaService.removeTag(`property='og:image:width'`);
    this.metaService.removeTag(`property='og:image:height'`);
    this.metaService.removeTag(`name='twitter:image'`);

    if (!!previewImage) {
      this.metaService.addTags([
        { property: 'og:image', content: previewImage },
        { name: 'twitter:image', content: previewImage }
      ]);
    } else {
      this.metaService.addTags([
        {
          property: 'og:image',
          content: websiteUrlWTS + '/assets/vulcan-384.png'
        },
        { property: 'og:image:width', content: '384' },
        { property: 'og:image:height', content: '384' },
        {
          name: 'twitter:image',
          content: websiteUrlWTS + '/assets/vulcan-384.png'
        }
      ]);
    }

    // 8) Facebook app_id
    this.metaService.updateTag({
      property: 'fb:app_id',
      content: environment.facebookAppId
    });
  }

  public RouteOrParamsUpdated(route: string): void {
    // Change Page Title and meta data, show Vulcan

    // called in ngOnInit and in subscriptions to router events
    // and route parameter change via subject RouteParamChange

    var metaTitle = '';

    this.appData.Route = route;

    if (route === '/' || route === '' || route.indexOf('/callback') === 0) {
      // Home page
      metaTitle = this.localData.website;
      this.setDocTitle(metaTitle);
      this.routeDisplay = '';

      this.pageTitleToolTip = metaTitle;

      // Set ShowVulcan to true on route change to home page
      // If home page emits InputSlashTagOnMobile in ngOnInit, get error
      // ExpressionChangedAfterItHasBeenCheckedError
      this.showVulcan = true;
    } else {
      // Anything other than home page

      if (route.indexOf('?') > 0) {
        route = route.split('?')[0]; // #176 discard query string for facebook shares
      }
      metaTitle = route;
      this.routeDisplay = route;

      this.pageTitleToolTip =
        route === this.localData.PreviousSlashTagSelected
          ? 'SlashTag/' + this.localData.PreviousTopicSelected
          : route.substr(1);

      if (route.indexOf('slash-tags') > -1) {
        this.appData.TabSelected$.next('slashTags');
        this.setDocTitle('Slash Tags');
      } else if (route.indexOf('/my/details') > -1) {
        this.appData.TabSelected$.next('profile');
        this.setDocTitle('Voter Profile');
      } else {
        // ToDo - more cases to be handled
        const topic = this.localData.SlashTagToTopic(this.routeDisplay);
        this.setDocTitle(topic);
      }

      // Change url in browser's address bar
      // https://angular.io/api/common/Location#!#replaceState-anchor
      // When app is reloaded on callback, do not replaceState
      if (route) {
        this.location.replaceState(route);
      }

      this.showVulcan = false;
    }

    // Setting meta data on SSR app.component init
    // will be of use to social media sites as well as Google

    // Runs after app component init in SSR for FCP (First Contentful Paint)
    this.setMetaData(
      metaTitle /* title */,
      'Free Vote anonymous voting platform' /* preview */,
      '' /* additional keywords */,
      this.routeDisplay /* page path (home) */,
      `${this.localData.websiteUrlWTS}/assets/vulcan-384.png` // previewImage
    );
  }

  SpaVersionUpdate() {
    // Refresh SPA from server
    // https://stackoverflow.com/questions/55127650/location-reloadtrue-is-deprecated
    location.reload();
    this.appData.SpaVersion = this.appData.SpaVersionNew;
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
        this.appData.DisplayWidth$.next(band);
      }
    }
  }

  toggleLocalAPI(): void {
    if (this.localData.GetItem('localAPI') === 'true') {
      this.localData.SetItem('localAPI', 'false');
      this.localAPI = '';
    } else {
      this.localData.SetItem('localAPI', 'true');
      this.localAPI = 'Local API';
    }

    this.localData.SetServiceURL();
  }

  // ngOnDestroy(): void {
  // No need to create subscriptions to unsubscribe in app.component
  // }
}
