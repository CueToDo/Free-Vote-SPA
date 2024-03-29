// Angular
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// rxjs
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

// Models
import { ID } from 'src/app/models/common';
import { PointSortTypes } from 'src/app/models/enums';
import { Kvp } from 'src/app/models/kvp.model';
import { Meta } from '@angular/platform-browser';

// Other
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AppDataService {
  public keywords =
    'Free Vote, Free, Vote, anonymous, voting, platform, democracy';

  // http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
  public Route = '';

  public defaultSort = PointSortTypes.TrendingActivity;

  // Can I make a function available in every controller in angular?
  // https://stackoverflow.com/questions/15025979/can-i-make-a-function-available-in-every-controller-in-angular
  // 0 to 11
  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  // tslint:disable-next-line: deprecation
  public promptEvent: BeforeInstallPromptEvent | undefined;

  // Any subscriptions to the following must be unsubscribed (except in app.component)
  public RouteParamChange$ = new Subject<string>(); // next url with route parameters
  public TagsPointsActive$ = new Subject<boolean>(); // Point Selection

  // For responsive viewing
  public DisplayWidth$ = new BehaviorSubject<number>(5); // Viewport width monitoring
  public InputSlashTagOnMobile$ = new BehaviorSubject<boolean>(false);

  public MenuItemSelected = '';

  // Let the service handle the communication and the response data
  // Notify service users via Behavioursubject. (Use Behavioursubject to ensure initial value).
  // Could use Promise for sign-in component, but other components such as menu need to know sign-in status

  constructor(
    private router: Router,
    private metaService: Meta,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // PWA installation - browser only
    if (isPlatformBrowser(this.platformId)) {
      // PWA https://love2dev.com/blog/beforeinstallprompt/
      window.addEventListener('beforeinstallprompt', event => {
        // tslint:disable-next-line: deprecation
        this.promptEvent = event as BeforeInstallPromptEvent;
      });
    }
  }

  public setMetaData(
    websiteWTS: string,
    shareTitle: string,
    sharePreview: string,
    shareImage: string
  ): void {
    // Pointless updating meta data on client browser
    if (isPlatformBrowser(this.platformId)) return;

    // https://www.tektutorialshub.com/angular/meta-service-in-angular-add-update-meta-tags-example/
    // https://css-tricks.com/essential-meta-tags-social-media/

    // Requires Angular Universal Server Side Rendering for Social media use
    // https://stackoverflow.com/questions/45262719/angular-4-update-meta-tags-dynamically-for-facebook-open-graph

    const pagePath = this.router.url; /* page path (home) */

    // Don't overwrite existing meta with home meta
    if (
      shareTitle === websiteWTS &&
      !!this.metaService.getTag(`property='og:title'`)
    )
      return;

    // 1) Title: remove and conditionally add
    this.metaService.removeTag(`property='og:title'`);
    this.metaService.removeTag(`name='twitter:title'`);

    if (shareTitle) {
      this.metaService.addTags([
        { property: 'og:title', content: shareTitle },
        { name: 'twitter:title', content: shareTitle }
      ]);
    }

    // 2) Description preview
    this.metaService.updateTag({
      name: 'description',
      content: sharePreview
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: sharePreview
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: sharePreview
    });

    // 4) og:url remove and conditionally add
    this.metaService.removeTag(`property='og:url'`);

    const url = `${websiteWTS}/${this.removeBookEnds(pagePath, '/')}`;

    if (url) {
      this.metaService.addTags([{ property: 'og:url', content: url }]);
    }

    // 5) og:type
    this.metaService.updateTag({ property: 'og:type', content: 'article' });

    // 6) twitter:card
    // card type: “summary”, “summary_large_image”, “app”, or “player”.
    this.metaService.removeTag(`name='twitter:card'`);

    if (sharePreview && shareImage) {
      this.metaService.addTags([
        { name: 'twitter:card', content: 'summary_large_image' }
      ]);
    } else if (sharePreview) {
      this.metaService.addTag({ name: 'twitter:card', content: 'summary' });
    }

    // 7) PreviewImage remove and conditionally add
    this.metaService.removeTag(`property='og:image'`);
    this.metaService.removeTag(`property='og:image:width'`);
    this.metaService.removeTag(`property='og:image:height'`);
    this.metaService.removeTag(`name='twitter:image'`);

    if (!!shareImage) {
      this.metaService.addTags([
        { property: 'og:image', content: shareImage },
        { name: 'twitter:image', content: shareImage }
      ]);
    } else {
      this.metaService.addTags([
        {
          property: 'og:image',
          content: websiteWTS + '/assets/vulcan-384.png'
        },
        { property: 'og:image:width', content: '384' },
        { property: 'og:image:height', content: '384' },
        {
          name: 'twitter:image',
          content: websiteWTS + '/assets/vulcan-384.png'
        }
      ]);
    }

    // 8) Facebook app_id
    this.metaService.updateTag({
      property: 'fb:app_id',
      content: environment.facebookAppId
    });
  }

  public unhideLinks(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchorElements = Array.from(doc.querySelectorAll('a'));
    for (const anchor of anchorElements) {
      const classes = anchor.classList;
      classes.remove('hidden');
    }
    return doc.body.innerHTML;
  }

  SpanHasStyle(html: string): boolean {
    let hasStyle = false;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const spans = Array.from(doc.querySelectorAll('span'));

    for (const span of spans) {
      if (span.hasAttribute('style')) {
        hasStyle = true;
        break;
      }
    }

    return hasStyle;
  }

  RemoveSpansWithStyle(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const spans = Array.from(doc.querySelectorAll('span'));

    for (const span of spans) {
      span.outerHTML = span.innerHTML;
    }

    return doc.body.innerHTML;
  }

  // Unambiguous Date Format
  // https://css-tricks.com/everything-you-need-to-know-about-date-in-javascript/
  public UDF(date: Date): string {
    let udf = '';
    if (date) {
      udf =
        date.getDate().toString() +
        ' ' +
        this.months[date.getMonth()] +
        ' ' +
        date.getFullYear().toString();
    }
    return udf;
  }

  // Unambiguous DateTime Format
  public UDTF(date: Date): string {
    let udtf = '';
    if (date) {
      udtf =
        date.getDate().toString() +
        ' ' +
        this.months[date.getMonth()] +
        ' ' +
        date.getFullYear().toString() +
        ' ' +
        date.getHours().toString().padStart(2, '0') +
        ':' +
        date.getMinutes().toString().padStart(2, '0');
    }
    return udtf;
  }

  public addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  isConsonant(ch: string): boolean {
    if (!ch) {
      return false;
    }

    // To handle lower case
    ch = ch[0].toUpperCase();

    return (
      ch.charCodeAt(0) >= 65 &&
      ch.charCodeAt(0) <= 90 &&
      !(ch == 'A' || ch == 'E' || ch == 'I' || ch == 'O' || ch == 'U')
    );
  }

  uniqueConsonants(word: string): number {
    if (!word) {
      return 0;
    }

    let consonants: string[] = [];
    let c = '';

    for (let i = 0; i < word.length; i++) {
      c = word[i];
      if (this.isConsonant(c) && consonants.indexOf(c) < 0) {
        consonants.push(c);
      }
    }
    return consonants.length;
  }

  // Do not use: Name can now include reserved characters (these will be removed from the "slug" for route parameter use)
  isUrlNameUnSafe(input: string): boolean {
    return (
      input.includes('\\') ||
      // input.includes(
      //   '-'
      // ) /* hyphen not allowed as spaces will be represented by hyphens */ ||
      input.includes('?') ||
      input.includes('!') ||
      input.includes(`'`) ||
      input.includes(`,`) ||
      input.includes(':') ||
      input.includes(';') ||
      input.includes('*') ||
      input.includes('/') ||
      input.includes('+') ||
      input.includes('=') ||
      input.includes('@') ||
      input.includes('&') ||
      input.includes('#') ||
      input.includes('$')
    );
  }

  // Not required - names will be "slugged in API"
  urlSafeName(input: string): string {
    let output = input
      .split('\\')
      .filter(item => item)
      .join(''); // no back-slashes
    output = output
      .split('-')
      .filter(item => item)
      .join(
        ' '
      ); /* hyphen not allowed as spaces will be represented by hyphens */
    output = output
      .split('?')
      .filter(item => item)
      .join('');
    output = output
      .split('!')
      .filter(item => item)
      .join('');
    output = output
      .split(`'`)
      .filter(item => item)
      .join('');
    output = output
      .split(',')
      .filter(item => item)
      .join('');
    output = output
      .split(':')
      .filter(item => item)
      .join('');
    output = output
      .split(';')
      .filter(item => item)
      .join('');
    output = output
      .split('*')
      .filter(item => item)
      .join('');
    output = output
      .split('/')
      .filter(item => item)
      .join('');
    output = output
      .split('+')
      .filter(item => item)
      .join('');
    output = output
      .split('=')
      .filter(item => item)
      .join('');
    output = output
      .split('@')
      .filter(item => item)
      .join('');
    output = output
      .split('&')
      .filter(item => item)
      .join('');
    output = output
      .split('#')
      .filter(item => item)
      .join('');
    output = output
      .split('$')
      .filter(item => item)
      .join('');

    return output;
  }

  // For groupnames in urls. replace spaces first, then encode
  kebabUri(input: string): string {
    // But not converted to lower case
    // filter - an empty string evaluates to boolean false. It works with all falsy values like 0, false, null, undefined
    let output = '';

    if (input) {
      // While it's definitely possible to use commas in URLs, it's not a widely used practice, nor is it recommended
      // https://www.searchenginenews.com/sample/content/are-you-using-commas-in-your-urls-heres-what-you-need-to-know
      output = input.replace(',', '');

      output = output
        .split(' ')
        .filter(item => item)
        .join('-'); // remove double spaces, replace spaces with dash

      output = output
        .split('-')
        .filter(item => item)
        .join('-'); // remove double-dashes, no dash start or end

      output = encodeURIComponent(output);
    }

    return output;
  }

  unKebabUri(input: string): string {
    return input
      ?.split('-')
      .filter(item => item)
      .join(' ');
  }

  public removeBookEnds(withEnds: string, removeEnd: string): string {
    // filter - an empty string evaluates to boolean false. It works with all falsy values like 0, false, null, undefined
    return withEnds
      .split(removeEnd)
      .filter(item => item)
      .join(removeEnd);
  }

  public Date1IsLessThanDate2(dateFrom: string, dateTo: string): boolean {
    if (!dateFrom || !dateTo) {
      return false;
    }
    const date1 = new Date(dateFrom);
    const date2 = new Date(dateTo);
    return date1.getTime() < date2.getTime();
  }

  GetMapValue(obj: any, key: string): string {
    if (obj.hasOwnProperty(key)) {
      return obj[key];
    }
    throw new Error('Invalid map key.');
  }

  // DO NOT WORK WITH Map
  // https://stackoverflow.com/questions/48187362/how-to-iterate-using-ngfor-loop-map-containing-key-as-string-and-values-as-map-i

  // Do Not Use map
  // ArrayFromMap(map: Map<number, string>): any[] {
  //   return Array.from(map.entries()).map(([key, val]) => ({ key, val }));
  // }

  MeetingInterval(intervalID: number): string {
    switch (intervalID) {
      case 1:
        return 'Weekly';
      case 2:
        return 'Monthly Date';
      case 3:
        return 'Variable';
      case 4:
        return 'Monthly';
      default:
        return '';
    }
  }

  public DayName(day: string): string {
    switch (day) {
      case '1':
        return 'Monday';
      case '2':
        return 'Tuesday';
      case '3':
        return 'Wednesday';
      case '4':
        return 'Thursday';
      case '5':
        return 'Friday';
      case '6':
        return 'Saturday';
      case '7':
        return 'Sunday';
      default:
        return '';
    }
  }

  public ordinal(i: number): string {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) {
      return i + 'st';
    }
    if (j === 2 && k !== 12) {
      return i + 'nd';
    }
    if (j === 3 && k !== 13) {
      return i + 'rd';
    }
    return i + 'th';
  }

  public plural(i: number): string {
    switch (i) {
      case 1:
        return '';
      default:
        return 's';
    }
  }

  public NextMonday(): Date {
    const nextMon = new Date();
    nextMon.setDate(nextMon.getDate() - nextMon.getDay() + 8);
    return nextMon;
  }

  // https://stackoverflow.com/questions/52419658/efficient-way-to-get-route-parameter-in-angular
  onNavigationEndReadParamByKey(
    route: ActivatedRoute,
    key: string
  ): Observable<string> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      mergeMap(() => {
        /* flatMap deprecated - is this a direct replacement? */
        return route.params.pipe(
          filter(params => params[key]),
          map(params => params[key])
        );
      })
    );
  }

  CastObjectToIDs(sourceObject: any): ID[] {
    // construct an Array of objects from an object
    return Object.keys(sourceObject).map(key => {
      return { rowNumber: Number(key), id: sourceObject[key] };
    });
  }

  ArrayOfKVP(source: any): Array<Kvp> {
    const output = new Array<Kvp>();
    for (const kvp of source) {
      output.push({ key: kvp.key, value: kvp.value } as Kvp);
    }
    return output;
  }

  // Value ID is a number
  GetKVPValue(source: Array<Kvp>, key: string): number {
    const kvp = source.find(element => element.key === key);
    if (kvp) {
      return kvp.value;
    } else {
      return -1;
    }
  }

  /// Key Display is a string
  GetKVPKey(source: Array<Kvp>, value: number): string {
    const kvp = source.find(element => element.value === value);
    if (kvp) {
      return kvp.key;
    } else {
      return '';
    }
  }

  htmlToText(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract the plain text content of the document body.
    let text = doc.body.textContent + '';
    text = text.replace('https://', ' https://');
    return text;
  }

  // https://blog.logrocket.com/4-different-techniques-for-copying-objects-in-javascript-511e422ceb1e/
  // We call the copy shallow because the properties in the target object
  // can still hold references to those in the source object. WTF

  // Now using lodash for deep copy and potentially other methods to manuipulate objects and arrays

  // deep<T>(value: T): T | any[] {
  //   if (typeof value !== 'object' || value === null) {
  //     return value;
  //   }
  //   if (Array.isArray(value)) {
  //     return this.deepArray(value as any[]);
  //   }
  //   return this.deepObject(value);
  // }

  // deepArray<T extends any[]>(collection: T): any[] {
  //   return collection.map((value) => {
  //     return this.deep(value);
  //   });
  // }

  // deepObject<T>(source: T): T {
  //   const result = {};
  //   Object.keys(source).forEach((key) => {
  //     const value = source[key];
  //     result[key] = this.deep(value);
  //   }, {});
  //   return result as T;
  // }
}
