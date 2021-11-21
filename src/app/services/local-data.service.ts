// Angular
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express';

// rxjs
import { BehaviorSubject } from 'rxjs';

// Models
import { FreeVoteProfile } from '../models/FreeVoteProfile';

// Mainly intended for client side, but has server side only code
@Injectable({ providedIn: 'root' })
export class LocalDataService {
  // SPA Versioning
  public SpaVersion = '13.0.2'; // constant on reload - not saved to localData

  // Must save in localData for use after reload
  // was previously fetched from API
  public get SpaVersionLatest(): string {
    return this.GetItem('SpaVersionLatest');
  }

  public set SpaVersionLatest(SpaVersionLatest: string) {
    this.SetItem('SpaVersionLatest', SpaVersionLatest);
  }

  public SpaVersionChecked = Date.now() - 3660000; // 61 minutes ago

  public get SpaVersionUpdateRequired(): boolean {
    return this.SpaVersion !== this.SpaVersionLatest;
  }

  public get SpaVersionCheckDue(): boolean {
    // Check every hour
    return Date.now() - this.SpaVersionChecked > 60 * 60 * 1000;
  }

  public website = '';
  public strapline = '';
  public websiteUrlWTS = ''; // WTS: without trailing slash
  public apiUrl = '';

  // Subscribe to these in components rather than reference static values in localData
  public LoggingInToAuth0$ = new BehaviorSubject<boolean>(
    this.LoggingInToAuth0
  );

  public LoggedInToAuth0$ = new BehaviorSubject<boolean>(this.LoggedInToAuth0);

  public GotFreeVoteJwt$ = new BehaviorSubject<boolean>(false);

  public auth0Profile: any; // Auth0 Profile Data saved to app on login

  public freeVoteProfile = new FreeVoteProfile(); // For client updates to API
  public updatingProfile = false; // on all backend interactions we get jwt and assignservervalues - don't reassign before backend update

  public questionSelected = '';
  public questionDetails = '';

  // Auth0 and FreeVote Profile - Following static values not to be used in component initialisation where a change subscription is needed
  public get LoggingInToAuth0(): boolean {
    return this.GetItem('loggingInToAuth0') === 'true';
  }
  public set LoggingInToAuth0(loggingInToAuth0: boolean) {
    // Save
    this.SetItem('loggingInToAuth0', String(loggingInToAuth0));
    this.SetItem('loggedInToAuth0', String(false));
    // Communicate
    this.LoggingInToAuth0$.next(loggingInToAuth0);
    this.LoggedInToAuth0$.next(false);
  }

  public get LoggedInToAuth0(): boolean {
    return this.GetItem('loggedInToAuth0') === 'true';
  }
  public set LoggedInToAuth0(loggedIn: boolean) {
    // Save
    this.SetItem('loggingInToAuth0', String(false));
    this.SetItem('loggedInToAuth0', String(loggedIn));
    // Communicate
    this.Log(`Communicating logged in to Auth0: ${loggedIn}`);
    this.LoggingInToAuth0$.next(false);
    this.LoggedInToAuth0$.next(loggedIn);
  }

  // Need in-memory value for server side tasks (no local storage)
  private gettingFreevoteJwt = false;
  public get GettingFreeVoteJwt(): boolean {
    return this.gettingFreevoteJwt;
  }
  public set GettingFreeVoteJwt(getting: boolean) {
    if (getting) {
      // Clear existing
      this.ClearExistingJwt();
    }
    // Save Status
    this.gettingFreevoteJwt = getting; // no need to save to local storage

    // Communicate
    this.GotFreeVoteJwt$.next(false); // Getting, haven't yet got
  }

  // We have a jwt - signed in or not - unless just signed out or never signed in
  public get GotFreeVoteJwt(): boolean {
    // actually have a jwt
    return !!this.JWT;
  }

  // Where an anon user selects items by sessionID, so does signed in user
  // Anon sessionIDs should be renewed opportunistically and returned if updated?

  // jwt contains All claims
  // SessionID is baked into jwt for anon or signed-in users
  // jwt must be in-memory for server side rendering
  private jwt = '';
  public get JWT(): string {
    return this.jwt;
  }
  public set JWT(jwt: string) {
    if (jwt === null || jwt === undefined) {
      jwt = '';
    }
    this.jwt = jwt;
    // Communicate
    this.GotFreeVoteJwt$.next(!!jwt);
  }

  public ClearExistingJwt(): void {
    this.JWT = '';
    // Communicate
    this.GotFreeVoteJwt$.next(false);
  }

  private localLogging = '';

  public get LocalLogging(): boolean {
    if (this.localLogging.length === 0) {
      this.localLogging = this.GetItem('localLogging');
      console.log('Got localLogging from localStorage');
    }
    return this.localLogging === 'true';
  }

  public set LocalLogging(log: boolean) {
    console.log('Setting localLogging', log ? 'true' : 'false');
    this.localLogging = log ? 'true' : 'false';
    if (!log) {
      this.ClearLog();
    }
  }

  private localLog = '';
  public get LocalLog(): string {
    if (this.localLog.length === 0) {
      this.localLog = this.GetItem('localLog');
    }
    return this.localLog;
  }

  public Log(log: string) {
    if (this.LocalLogging) {
      console.log('Logging', log);
      // Add new log
      this.localLog += `${log}<br>`;
    } else {
      console.log('Local Logging is OFF');
    }
  }

  public ClearLog() {
    this.localLog = '';
  }

  public get roles(): string[] {
    const roleString = this.GetItem('roles');
    if (!!roleString) {
      return roleString.split(',');
    } else {
      return [''];
    }
  }
  public set roles(roles: string[]) {
    let roleString = '';
    if (roles) {
      roleString = roles.join(',');
    }
    this.SetItem('roles', roleString);
  }

  // Depending on already being sanitised - straight conversion between values as would be saved in database
  TopicToSlashTag(topic: string): string {
    if (!topic) {
      return '';
    }
    return '/' + topic.split(' ').join('-');
  }

  // Depending on already being sanitised - straight conversion between values as would be saved in database
  SlashTagToTopic(slashTag: string): string {
    const topic = slashTag.replace('/', '').split('-').join(' ');
    return topic;
  }

  constructor(
    // https://stackoverflow.com/questions/39085632/localstorage-is-not-defined-angular-universal
    @Inject(PLATFORM_ID) private platformId: object,
    @Optional() @Inject(REQUEST) protected request: Request
  ) {
    // Lifecycle hooks, like OnInit() work with Directives and Components.
    // They do not work with other types, like a service.

    this.SetServiceURL();

    this.LoadClientValues();
  }

  SetItem(name: string, value: string): void {
    // localStorage not available in Universal SSR
    if (isPlatformBrowser(this.platformId)) {
      if (value === 'null') {
        value = '';
      }
      localStorage.setItem(name, value);
    }
  }

  GetItem(name: string): string {
    let value: string | null = '';

    // localStorage not available in Universal SSR
    if (isPlatformBrowser(this.platformId)) {
      value = localStorage.getItem(name);
    }
    if (value === 'null') {
      value = null;
    }
    return value ? value : '';
  }

  public SetServiceURL(): void {
    // Defaults

    // Server or Client
    this.apiUrl = 'https://api.free.vote/';

    if (isPlatformBrowser(this.platformId)) {
      this.website = window.location.origin.replace('https://', '');
      this.website = this.website.replace('http://', '');
      this.websiteUrlWTS = window.location.origin;

      // API: Always use live unless there is a local manual override
      const localAPI: boolean = this.GetItem('localAPI') === 'true';

      if (localAPI) {
        this.apiUrl = 'http://localhost:54357/';
      }
    } else {
      // window not available on server
      this.website = this.request.hostname;
      this.websiteUrlWTS = `https://${this.website}`;
    }
  }

  public LoadClientValues(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.jwt = this.GetItem('jwt');
      this.localLogging = this.GetItem('localLogging');
      this.localLog = this.GetItem('localLog');

      // client side values - user may update and post to API
      this.freeVoteProfile.givenName = this.GetItem('givenName');
      this.freeVoteProfile.familyName = this.GetItem('familyName');
      this.freeVoteProfile.alias = this.GetItem('alias');

      this.freeVoteProfile.location = this.GetItem('location');
      this.freeVoteProfile.country = this.GetItem('country');
      this.freeVoteProfile.city = this.GetItem('city');
      this.freeVoteProfile.countryId = this.GetItem('countryId');
      this.freeVoteProfile.cityId = this.GetItem('cityId');

      this.freeVoteProfile.profilePictureOptionID = this.GetItem(
        'profilePictureOptionID'
      );
      this.freeVoteProfile.profilePicture = this.GetItem('profilePicture');

      this.ActiveAliasForFilter = this.PreviousAliasSelected; // may be ''
    }
  }

  public SaveValues(): void {
    this.SetItem('jwt', this.JWT);
    this.SetItem('localLogging', this.localLogging);
    this.SetItem('localLog', this.localLog);

    if (this.freeVoteProfile) {
      if (this.freeVoteProfile.givenName) {
        this.SetItem('givenName', this.freeVoteProfile.givenName);
      }
      if (this.freeVoteProfile.familyName) {
        this.SetItem('familyName', this.freeVoteProfile.familyName);
      }
      if (this.freeVoteProfile.alias) {
        this.SetItem('alias', this.freeVoteProfile.alias);
      }

      if (this.freeVoteProfile.location) {
        this.SetItem('location', this.freeVoteProfile.location);
      }
      if (this.freeVoteProfile.country) {
        this.SetItem('country', this.freeVoteProfile.country);
      }
      if (this.freeVoteProfile.city) {
        this.SetItem('city', this.freeVoteProfile.city);
      }
      if (this.freeVoteProfile.countryId) {
        this.SetItem('countryId', this.freeVoteProfile.countryId.toString());
      }
      if (this.freeVoteProfile.cityId) {
        this.SetItem('cityId', this.freeVoteProfile.cityId.toString());
      }

      if (this.freeVoteProfile.profilePictureOptionID) {
        this.SetItem(
          'profilePictureOptionID',
          this.freeVoteProfile.profilePictureOptionID
        );
      }
      if (this.freeVoteProfile.profilePicture) {
        this.SetItem('profilePicture', this.freeVoteProfile.profilePicture);
      }
    }
  }

  // DIY rather than Object.Assign
  public AssignServerValues(values: any): void {
    if (values && !this.updatingProfile) {
      if (!!values.jwt) {
        // Set
        this.JWT = values.jwt;
        this.GettingFreeVoteJwt = false;
      }

      if (values.roles) {
        this.roles = values.roles.toString().split(',');
      }

      if (values.givenName) {
        this.freeVoteProfile.givenName = values.givenName;
      }
      if (values.familyName) {
        this.freeVoteProfile.familyName = values.familyName;
      }
      if (values.alias) {
        this.freeVoteProfile.alias = values.alias;
      }

      if (values.location) {
        this.freeVoteProfile.location = values.location;
      }
      if (values.country) {
        this.freeVoteProfile.country = values.country;
      }
      if (values.city) {
        this.freeVoteProfile.city = values.city;
      }
      if (values.countryId) {
        this.freeVoteProfile.countryId = values.countryId;
      }
      if (values.cityId) {
        this.freeVoteProfile.cityId = values.cityId;
      }

      if (values.profilePictureOptionID) {
        this.freeVoteProfile.profilePictureOptionID =
          values.profilePictureOptionID.toString();
      }
      if (values.profilePicture) {
        this.freeVoteProfile.profilePicture = values.profilePicture;
      }

      // (Don't save Last Alias Selected to database)

      if (values.lastTag) {
        this.PreviousTopicSelected = this.SlashTagToTopic(values.lastTag);
      }
    }
  }

  public get PreviousTopicSelected(): string {
    return this.GetItem('previousTopicSelected');
  }
  public set PreviousTopicSelected(topic: string) {
    let previousTopicSelected = '';
    if (topic.charAt(0) === '/') {
      // Expecting a slash, but we got a topic - no need to convert slashTag to topic - it is a topic
      previousTopicSelected = this.SlashTagToTopic(topic);
    } else {
      previousTopicSelected = topic;
    }

    this.SetItem('previousTopicSelected', previousTopicSelected);
  }

  public get PreviousSlashTagSelected(): string {
    return this.TopicToSlashTag(this.PreviousTopicSelected);
  }
  public set PreviousSlashTagSelected(slashTag: string) {
    if (!!slashTag) {
      if (slashTag.charAt(0) !== '/') {
        // Expecting a slash, but we got a topic - no need to convert slashTag to topic - it is a topic
        this.PreviousTopicSelected = slashTag;
      } else {
        this.PreviousTopicSelected = this.SlashTagToTopic(slashTag);
      }
    }
  }

  // Saved Alias
  public get PreviousAliasSelected(): string {
    return this.GetItem('previousAliasSelected');
  }
  public set PreviousAliasSelected(alias: string) {
    this.SetItem('previousAliasSelected', alias);
  }

  public get ActiveAliasForFilter(): string {
    return this.GetItem('activeAliasForFilter');
  }
  public set ActiveAliasForFilter(activeAliasForFilter: string) {
    this.SetItem('activeAliasForFilter', activeAliasForFilter);
  }

  public ClearAliasFilter(): void {
    this.ActiveAliasForFilter = '';
  }
  public RestoreAliasFilter(): void {
    this.ActiveAliasForFilter = this.PreviousAliasSelected;
  }

  public SignedOut(): void {
    // Save signed out state
    this.LoggingInToAuth0 = false;
    this.LoggedInToAuth0 = false;

    this.ClearExistingJwt();

    // Communicate
    this.LoggedInToAuth0$.next(false);

    // client side values - user may update and post to API
    this.freeVoteProfile.alias = '';
    this.freeVoteProfile.country = '';
    this.freeVoteProfile.city = '';
    this.freeVoteProfile.countryId = '0';
    this.freeVoteProfile.cityId = '0';
    this.freeVoteProfile.profilePictureOptionID = '';
    this.freeVoteProfile.profilePicture = '';

    // Preserve use of local variables after sign out/sign in
    const localAPI = this.GetItem('localAPI');
    const SpaVersionLatest = this.GetItem('SpaVersionLatest');

    // clear all local storage
    localStorage.clear();

    // Re-Save Values we wish to preserve after LocalStorage Clear
    this.SetItem('localAPI', localAPI);
    this.SetItem('SpaVersionLatest', SpaVersionLatest);
    this.SetItem('previousTopicSelected', 'SignedOut'); // Used in AppDataService InitialisePreviousAliasAndTopic

    this.SetItem('localLogging', this.localLogging); // Must set logging on before adding to log
    this.SetItem('localLog', this.localLog);

    console.log(
      'Restored logging values. Logging:',
      this.LocalLogging,
      'Log:',
      this.LocalLog
    );
  }

  onDestroy(): void {
    this.SaveValues();
  }
}
