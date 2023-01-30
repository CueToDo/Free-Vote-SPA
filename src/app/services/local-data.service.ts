// Angular
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express';

// rxjs
import { BehaviorSubject } from 'rxjs';

// Models
import { FreeVoteProfile } from '../models/FreeVoteProfile';

// Other
import { environment as env } from 'src/environments/environment';

// Mainly intended for client side, but has server side only code
@Injectable({ providedIn: 'root' })
export class LocalDataService {
  public website = '';
  public strapline = '';
  public websiteUrlWTS = ''; // WTS: without trailing slash
  public apiUrl = '';

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
  }

  // We have a jwt - signed in or not - unless just signed out or never signed in
  public get GotFreeVoteJwt(): boolean {
    // actually have a jwt
    return !!this.JWT;
  }

  // Need in-memory value for server side tasks (no local storage)
  private gettingFreevoteJwt = false;
  public get GettingFreeVoteJwt(): boolean {
    return this.gettingFreevoteJwt;
  }
  public set GettingFreeVoteJwt(getting: boolean) {
    // Save Status
    this.gettingFreevoteJwt = getting; // no need to save to local storage
    this.Log(`Set GettingFreeVoteJwt: ${getting}`);
    if (getting) {
      // Clear existing
      this.ClearExistingJwt();
    }
  }

  public ClearExistingJwt(): void {
    this.JWT = '';
    // any credentials supplied to get jwt are now invalid - allow call to get fresh jwt
    this.gettingFreevoteJwt = false;
  }

  public freeVoteProfile = new FreeVoteProfile(); // For client updates to API
  public updatingProfile = false; // on all backend interactions we get jwt and assignservervalues - don't reassign before backend update

  public questionSelected = '';
  public questionDetails = '';

  // Local Politics - Constituency
  public forConstituency = false;
  public get ConstituencyIDVoter(): number {
    return +this.freeVoteProfile.constituencyID;
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
    if (isPlatformBrowser(this.platformId)) {
      var time = new Date();
      var hms = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
      if (this.LocalLogging) {
        console.log('Logging', log);
        // Add new log
        this.localLog += `${hms} ${log}<br>`;
        this.SetItem('localLog', this.localLog);
      } else {
        console.log('Local Logging is OFF');
      }
    }
  }

  public ClearLog() {
    if (isPlatformBrowser(this.platformId)) {
      this.localLog = '';
      this.SetItem('localLog', this.localLog);
    }
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
    // topic should not begin with slash, but don't add another if it does
    if (topic.charAt(0) !== '/') {
      topic = '/' + topic;
    }
    return topic.split(' ').join('-');
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
    this.apiUrl = env.apiUri;

    if (isPlatformBrowser(this.platformId)) {
      this.website = window.location.origin.replace('https://', '');
      this.website = this.website.replace('http://', '');
      this.websiteUrlWTS = window.location.origin;
    } else {
      // window not available on server
      this.website = this.request.hostname;
      this.websiteUrlWTS = `https://${this.website}`;
    }
  }

  public LoadClientValues(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.JWT = this.GetItem('jwt');
      this.localLogging = this.GetItem('localLogging');
      this.localLog = this.GetItem('localLog');

      // client side values - user may update and post to API
      this.freeVoteProfile.givenName = this.GetItem('givenName');
      this.freeVoteProfile.familyName = this.GetItem('familyName');
      this.freeVoteProfile.alias = this.GetItem('alias');

      // Geographical
      this.freeVoteProfile.postcode = this.GetItem('postcode');
      this.freeVoteProfile.location = this.GetItem('location');
      this.freeVoteProfile.countryId = this.GetItem('countryId');
      this.freeVoteProfile.country = this.GetItem('country');
      this.freeVoteProfile.cityId = this.GetItem('cityId');
      this.freeVoteProfile.city = this.GetItem('city');

      // National Politics
      this.freeVoteProfile.constituency = this.GetItem('constituency');
      this.freeVoteProfile.constituencyID = this.GetItem('constituencyID');

      // Local Politics
      this.freeVoteProfile.ward = this.GetItem('ward');
      this.freeVoteProfile.council = this.GetItem('council');

      // Personal
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

      // Geographical
      if (this.freeVoteProfile.postcode) {
        this.SetItem('postcode', this.freeVoteProfile.postcode);
      }
      if (this.freeVoteProfile.location) {
        this.SetItem('location', this.freeVoteProfile.location);
      }
      if (this.freeVoteProfile.countryId) {
        this.SetItem('countryId', this.freeVoteProfile.countryId.toString());
      }
      if (this.freeVoteProfile.country) {
        this.SetItem('country', this.freeVoteProfile.country);
      }
      if (this.freeVoteProfile.cityId) {
        this.SetItem('cityId', this.freeVoteProfile.cityId.toString());
      }
      if (this.freeVoteProfile.city) {
        this.SetItem('city', this.freeVoteProfile.city);
      }

      // National Politics
      if (this.freeVoteProfile.constituency) {
        this.SetItem('constituency', this.freeVoteProfile.constituency);
      }
      if (this.freeVoteProfile.constituencyID) {
        this.SetItem('constituencyID', this.freeVoteProfile.constituencyID);
      }

      // Local Politics
      if (this.freeVoteProfile.ward) {
        this.SetItem('ward', this.freeVoteProfile.ward);
      }
      if (this.freeVoteProfile.council) {
        this.SetItem('council', this.freeVoteProfile.council);
      }

      // Personal
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

      // Geographical
      if (values.postcode) {
        this.freeVoteProfile.postcode = values.postcode;
      }
      if (values.location) {
        this.freeVoteProfile.location = values.location;
      }
      if (values.countryId) {
        this.freeVoteProfile.countryId = values.countryId.toString();
      }
      if (values.country) {
        this.freeVoteProfile.country = values.country;
      }
      if (values.cityId) {
        this.freeVoteProfile.cityId = values.cityId.toString();
      }
      if (values.city) {
        this.freeVoteProfile.city = values.city;
      }

      // National Politics
      if (values.constituency) {
        this.freeVoteProfile.constituency = values.constituency;
      }
      if (values.constituencyID) {
        this.freeVoteProfile.constituencyID = values.constituencyID;
      }

      // Local Politics
      if (values.ward) {
        this.freeVoteProfile.ward = values.ward;
      }
      if (values.council) {
        this.freeVoteProfile.council = values.council;
      }

      // Personal
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
    this.ClearExistingJwt();

    // client side values - user may update and post to API
    this.freeVoteProfile.alias = '';
    this.freeVoteProfile.countryId = '0';
    this.freeVoteProfile.country = '';
    this.freeVoteProfile.cityId = '0';
    this.freeVoteProfile.city = '';

    // National and Local Politics
    this.freeVoteProfile.constituency = '';
    this.freeVoteProfile.constituencyID = '0';
    this.freeVoteProfile.ward = '';
    this.freeVoteProfile.council = '';

    this.freeVoteProfile.profilePictureOptionID = '';
    this.freeVoteProfile.profilePicture = '';

    // clear all local storage
    localStorage.clear();

    // Re-Save Values we wish to preserve after LocalStorage Clear
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
