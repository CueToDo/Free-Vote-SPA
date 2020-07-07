import { AppDataService } from './app-data.service';
import { Injectable } from '@angular/core';

// Models
import { FreeVoteProfile } from '../models/FreeVoteProfile';

@Injectable({ providedIn: 'root' })
export class LocalDataService {

    public website: string;
    public strapline: string;
    public siteUrl: string;
    public serviceUrl: string;

    // Auth0
    public loggingInToAuth0 = false;
    public loggedInToAuth0 = false;

    public auth0Profile: any; // Auth0 Profile Data saved to app on login

    // FreeVote Profile
    public gettingFreeVoteJwt = false;
    public haveFreeVoteJwt = false;

    // Where an anon user selects items by sessionID, so does signed in user
    // Anon sessionIDs should be renewed opportunistically and returned if updated?

    // SessionID is baked into jwt for anon or signed-in users
    public jwt: string;
    public roles: string[];
    public freeVoteProfile = new FreeVoteProfile(); // For client updates to API

    public ActiveAliasForFilter = ''; // May be empty string
    private previousAliasSelected = '';
    private previousTopicSelected = ''; // Convert to SlashTag in PreviousSlashTagSelected

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

    constructor() {

        // Lifecycle hooks, like OnInit() work with Directives and Components.
        // They do not work with other types, like a service.

        this.website = 'free.vote';
        this.siteUrl = 'https://free.vote/';

        this.serviceUrl = this.siteUrl + 'api/';
        this.LoadValues();
    }

    SetItem(name: string, value: string) {
        if (value === 'null') { value = ''; }
        localStorage.setItem(name, value);
    }

    GetItem(name: string): string {
        let value = localStorage.getItem(name);
        if (value === 'null') { value = null; }
        return value;
    }

    public LoadValues() {

        this.loggingInToAuth0 = this.GetItem('loggingInToAuth0') === 'true';
        this.loggedInToAuth0 = this.GetItem('loggedInToAuth0') === 'true';

        this.gettingFreeVoteJwt = this.GetItem('gettingFreeVoteJwt') === 'true';
        this.haveFreeVoteJwt = this.GetItem('haveFreeVoteJwt') === 'true';

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

        this.previousTopicSelected = this.GetItem('previousTopicSelected');
        this.previousAliasSelected = this.GetItem('previousAliasSelected');
        this.ActiveAliasForFilter = this.previousAliasSelected;  // may be ''
    }

    public SaveValues() {

        this.SetItem('loggingInToAuth0', String(this.loggingInToAuth0));
        this.SetItem('loggedInToAuth0', String(this.loggedInToAuth0));

        this.SetItem('gettingFreeVoteJwt', String(this.gettingFreeVoteJwt));
        this.SetItem('haveFreeVoteJwt', String(this.haveFreeVoteJwt));

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

        this.SetItem('previousTopicSelected', this.previousTopicSelected);
        this.SetItem('previousAliasSelected', this.previousAliasSelected);
    }

    // DIY rather than Object.Assign
    public AssignServerValues(values: any) {

        if (values) {

            this.haveFreeVoteJwt = !!values.jwt;
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
            if (values.lastTag) { this.previousTopicSelected = this.SlashTagToTopic(values.lastTag); }
        }
    }


    // Saved Topic/SlashTag
    public get PreviousTopicSelected(): string { return this.previousTopicSelected; }
    public get PreviousSlashTagSelected(): string { return this.TopicToSlashTag(this.previousTopicSelected); }

    public set PreviousTopisSelected(topic: string) {
        if (topic.charAt(0) === '/') {
            // Expecting a slash, but we got a topic - no need to convert slashTag to topic - it is a topic
            this.previousTopicSelected = this.SlashTagToTopic(topic);
        } else {
            this.previousTopicSelected = topic;
        }

        this.SetItem('PreviousTopicSelected', this.previousTopicSelected);
    }

    public set PreviousSlashTagSelected(slashTag: string) {

        if (slashTag.charAt(0) !== '/') {
            // Expecting a slash, but we got a topic - no need to convert slashTag to topic - it is a topic
            this.previousTopicSelected = slashTag;
        } else {
            this.previousTopicSelected = this.SlashTagToTopic(slashTag);
        }

        this.SetItem('PreviousTopicSelected', this.previousTopicSelected);
    }

    // Saved Alias
    public get PreviousAliasSelected(): string { return this.previousAliasSelected; }
    public set PreviousAliasSelected(alias: string) {
        this.previousAliasSelected = alias;
        this.SetItem('PreviousAliasSelected', alias);
    }

    public ClearAliasFilter() { this.ActiveAliasForFilter = ''; }
    public RestoreAliasFilter() { this.ActiveAliasForFilter = this.previousAliasSelected; }


    public SignedOut() {

        // Clear in memory values
        this.loggingInToAuth0 = false;
        this.loggedInToAuth0 = false;

        this.gettingFreeVoteJwt = false;
        this.haveFreeVoteJwt = false;

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

        // clear local storage
        localStorage.clear();
        this.SetItem('PreviousTopicSelected', 'SignedOut'); // Used in AppDataService InitialisePreviousAliasAndTopic
    }



    onDestroy() {
        this.SaveValues();
    }

}
