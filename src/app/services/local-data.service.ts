// Angular
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

// rxjs
import { Subject } from 'rxjs';

// Models
import { FreeVoteProfile } from '../models/FreeVoteProfile';

@Injectable({ providedIn: 'root' })
export class LocalDataService {

    public website = '';
    public strapline = '';
    public websiteUrl = '';
    public apiUrl = '';

    // Auth0 and FreeVote Profile - Following static values not to be used in component initialisation where a change subscription is needed
    public get LoggingInToAuth0(): boolean { return this.GetItem('loggingInToAuth0') === 'true'; }

    public get LoggedInToAuth0(): boolean { return this.GetItem('loggedInToAuth0') === 'true'; }

    public set SigningInToAuth0(loggingInToAuth0: boolean) {
        // Save
        this.SetItem('loggingInToAuth0', String(loggingInToAuth0));
        this.SetItem('loggedInToAuth0', String(false));
        // Communicate
        this.LoggingInToAuth0$.next(loggingInToAuth0);
        this.LoggedInToAuth0$.next(false);
    }

    public set SignedIn(signedIn: boolean) {
        // Save
        this.SetItem('loggingInToAuth0', String(false));
        this.SetItem('loggedInToAuth0', String(signedIn));
        // Communicate
        this.LoggingInToAuth0$.next(false);
        this.LoggedInToAuth0$.next(signedIn);
    }

    public get GettingFreeVoteJwt(): boolean { return this.GetItem('gettingFreeVoteJwt') === 'true'; }
    public set GettingFreeVoteJwt(gettingFreeVoteJwt: boolean) {
        // Save
        this.SetItem('gettingFreeVoteJwt', String(gettingFreeVoteJwt));
        this.SetItem('gotFreeVoteJwt', String(false));
        // Communicate
        this.GettingFreeVoteJwt$.next(gettingFreeVoteJwt);
        this.GotFreeVoteJwt$.next(false);
    }

    public get GotFreeVoteJwt(): boolean { return this.GetItem('gotFreeVoteJwt') === 'true'; }
    public set GotFreeVoteJwt(gotFreeVoteJwt: boolean) {
        // Save
        this.SetItem('gettingFreeVoteJwt', String(false));
        this.SetItem('gotFreeVoteJwt', String(gotFreeVoteJwt));
        // Communicate
        this.GettingFreeVoteJwt$.next(false);
        this.GotFreeVoteJwt$.next(gotFreeVoteJwt);
    }


    // Subscribe to these in components rather than reference static values in localData
    public LoggingInToAuth0$ = new Subject<boolean>();
    public LoggedInToAuth0$ = new Subject<boolean>();
    public GettingFreeVoteJwt$ = new Subject<boolean>();
    public GotFreeVoteJwt$ = new Subject<boolean>();

    public auth0Profile: any; // Auth0 Profile Data saved to app on login

    // Where an anon user selects items by sessionID, so does signed in user
    // Anon sessionIDs should be renewed opportunistically and returned if updated?

    // SessionID is baked into jwt for anon or signed-in users
    public jwt = '';
    public roles: string[] = [];
    public freeVoteProfile = new FreeVoteProfile(); // For client updates to API
    public updatingProfile = false; // on all backend interactions we get jwt and assignservervalues - don't reassign before backend update

    public questionSelected = '';

    public ActiveAliasForFilter = ''; // May be empty string

    // Depending on already being sanitised - straight conversion between values as would be saved in database
    TopicToSlashTag(topic: string): string {
        if (!topic) { return ''; }
        return '/' + topic.split(' ').join('-');
    }

    // Depending on already being sanitised - straight conversion between values as would be saved in database
    SlashTagToTopic(slashTag: string): string {
        const topic = slashTag.replace('/', '').split('-').join(' ');
        return topic;
    }

    constructor(
        // https://stackoverflow.com/questions/39085632/localstorage-is-not-defined-angular-universal
        @Inject(PLATFORM_ID) private platformId: object
    ) {

        // Lifecycle hooks, like OnInit() work with Directives and Components.
        // They do not work with other types, like a service.

        this.SetServiceURL();

        this.LoadValues();
    }

    SetItem(name: string, value: string): void {

        // localStorage not available in Universal SSR
        if (isPlatformBrowser(this.platformId)) {
            if (value === 'null') { value = ''; }
            localStorage.setItem(name, value);
        }
    }

    GetItem(name: string): string {

        let value: string | null = '';

        // localStorage not available in Universal SSR
        if (isPlatformBrowser(this.platformId)) {
            value = localStorage.getItem(name);
        }
        if (value === 'null') { value = null; }
        return value ? value : '';
    }

    public SetServiceURL(): void {

        this.website = 'free.vote';
        this.websiteUrl = 'https://free.vote/';

        // No longer used: check if running locally to determine service url
        // Always use live unless there is a manual override

        const localAPI: boolean = this.GetItem('localAPI') === 'true';

        if (isPlatformBrowser(this.platformId) && localAPI) {

            // window not available on server
            const spaDomain = window.location.origin.split('//')[1].split(':')[0].replace('api.', '');

            this.apiUrl = 'http://localhost:54357/';
            // must match the value in Visual Studio launchsettings.json (SSL enabled in Project Properties Debug)
            // As CORS is configured, we could also use local IIS http://freevotetest.com or live https://free.vote

        } else {
            this.apiUrl = 'https://api.free.vote/';
        }

    }

    public LoadValues(): void {

        // jwt contains All claims
        this.jwt = this.GetItem('jwt');

        const roles = this.GetItem('roles');
        if (!roles) {
            this.roles = [''];
        } else {
            this.roles = this.GetItem('roles').split(',');
        }

        // client side values - user may update and post to API
        this.freeVoteProfile.alias = this.GetItem('alias');
        this.freeVoteProfile.country = this.GetItem('country');
        this.freeVoteProfile.city = this.GetItem('city');
        this.freeVoteProfile.countryId = this.GetItem('countryId');
        this.freeVoteProfile.cityId = this.GetItem('cityId');
        this.freeVoteProfile.profilePictureOptionID = this.GetItem('profilePictureOptionID');
        this.freeVoteProfile.profilePicture = this.GetItem('profilePicture');

        this.PreviousAliasSelected = this.GetItem('previousAliasSelected');
        this.ActiveAliasForFilter = this.PreviousAliasSelected;  // may be ''
    }

    public SaveValues(): void {

        let roleString = '';
        if (this.roles) { roleString = this.roles.join(','); }

        if (this.jwt === null || this.jwt === undefined) { this.jwt = ''; }

        this.SetItem('jwt', this.jwt);
        this.SetItem('roles', roleString);

        if (this.freeVoteProfile) {
            if (this.freeVoteProfile.alias) { this.SetItem('alias', this.freeVoteProfile.alias); }
            if (this.freeVoteProfile.country) { this.SetItem('country', this.freeVoteProfile.country); }
            if (this.freeVoteProfile.city) { this.SetItem('city', this.freeVoteProfile.city); }
            if (this.freeVoteProfile.countryId) { this.SetItem('countryId', this.freeVoteProfile.countryId.toString()); }
            if (this.freeVoteProfile.cityId) { this.SetItem('cityId', this.freeVoteProfile.cityId.toString()); }
            if (this.freeVoteProfile.profilePictureOptionID) {
                this.SetItem('profilePictureOptionID', this.freeVoteProfile.profilePictureOptionID);
            }
            if (this.freeVoteProfile.profilePicture) { this.SetItem('profilePicture', this.freeVoteProfile.profilePicture); }
        }

    }

    // DIY rather than Object.Assign
    public AssignServerValues(values: any): void {

        if (values && !this.updatingProfile) {

            this.GotFreeVoteJwt = !!values.jwt;
            if (values.jwt) { this.jwt = values.jwt; }
            if (values.roles) { this.roles = values.roles.toString().split(','); }

            if (values.alias) { this.freeVoteProfile.alias = values.alias; }
            if (values.country) { this.freeVoteProfile.country = values.country; }
            if (values.city) { this.freeVoteProfile.city = values.city; }
            if (values.countryId) { this.freeVoteProfile.countryId = values.countryId; }
            if (values.cityId) { this.freeVoteProfile.cityId = values.cityId; }
            if (values.profilePictureOptionID) { this.freeVoteProfile.profilePictureOptionID = values.profilePictureOptionID.toString(); }
            if (values.profilePicture) { this.freeVoteProfile.profilePicture = values.profilePicture; }

            // (Don't save Last Alias Selected to database)
            // Last SlashTag selected by Voter
            if (values.lastTag) { this.PreviousTopicSelected = this.SlashTagToTopic(values.lastTag); }
        }
    }


    // Saved Topic/SlashTag
    public get PreviousTopicSelected(): string { return this.GetItem('previousTopicSelected'); }
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

    public get PreviousSlashTagSelected(): string { return this.TopicToSlashTag(this.PreviousTopicSelected); }
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
    public get PreviousAliasSelected(): string { return this.GetItem('previousAliasSelected'); }
    public set PreviousAliasSelected(alias: string) { this.SetItem('previousAliasSelected', alias); }

    public ClearAliasFilter(): void { this.ActiveAliasForFilter = ''; }
    public RestoreAliasFilter(): void { this.ActiveAliasForFilter = this.PreviousAliasSelected; }

    public SignedOut(): void {

        this.LoggedInToAuth0$.next(false);

        this.SigningInToAuth0 = false;
        this.SignedIn = false;
        this.GettingFreeVoteJwt = false;
        this.GotFreeVoteJwt = false;

        // Communicate
        this.LoggedInToAuth0$.next(false);

        // jwt contains All claims
        this.jwt = '';
        this.roles = [''];

        // client side values - user may update and post to API
        this.freeVoteProfile.alias = '';
        this.freeVoteProfile.country = '';
        this.freeVoteProfile.city = '';
        this.freeVoteProfile.countryId = '0';
        this.freeVoteProfile.cityId = '0';
        this.freeVoteProfile.profilePictureOptionID = '';
        this.freeVoteProfile.profilePicture = '';

        // Preserve use of localAPI after sign out/sign in
        const localAPI = this.GetItem('localAPI');

        // clear all local storage
        localStorage.clear();

        this.SetItem('localAPI', localAPI);
        this.SetItem('previousTopicSelected', 'SignedOut'); // Used in AppDataService InitialisePreviousAliasAndTopic
    }

    onDestroy(): void {
        this.SaveValues();
    }

}
