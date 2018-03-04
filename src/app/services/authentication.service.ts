import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { HttpClientService } from './http-client.service';
import { Cookie } from 'ng2-cookies';

@Injectable()
export class AuthenticationService {

    //Let the service handle the communication and the response data
    //Notify service users via Subject

    //expose this for service users to check
    SignInData: SignInData;

    constructor(private httpClientService: HttpClientService) {

        this.SignInData = new SignInData()

        //Singleton Service - called once only
        if (Cookie.get("SignInData") != "") {
            this.SignInData = JSON.parse(Cookie.get("SignInData"));
            console.log('Retrieved SignInData from Cookie');
            console.log(Cookie.get("SignInData"));
            console.log(this.SignInData);
        }

        this.SignInData.Version = 0;
    }


    //private signInUrl = "http://freevote-002-site1.btempurl.com/authentication/signin";
    //private signInUrl = 'http://localhost:56529/authentication/signin';


    public SignInStatusChange = new Subject<any>();


    SignIn(website: string, email: string, password: string): void {

        debugger;
        
        let version = this.SignInData.Version;

        let success = false;
        let data = { "website": website, "email": email, "password": password };

        this.httpClientService
            .post('authentication/signin/', data)
            //.map(response => response.json()); //assumed - not needed
            .subscribe(response => {


                this.SignInData = <SignInData>response;
                console.log('SignInStatus: ' + this.SignInData.SignInResult);




                //http://stackoverflow.com/questions/32896407/redirect-within-component-angular-2
                //Save SignInData with JWT as cookie, not in local storage
                if (this.SignInData.SignInResult == SignInStatus.SignInSuccess) {
                    Cookie.set('SignInData', JSON.stringify(this.SignInData));
                    success = true;
                    //debugger;
                    this.SignInData.Version = version + 1;
                    console.log('Logged In Version:' + this.SignInData.Version);
                }

                //Notify any observers that didn't initiate the SignIn Request
                this.SignInStatusChange.next();
            },
            error => {
                console.log("Sign-In Error" + error);
            });
    }

    SignOut() {
        Cookie.delete('SignInData');
        let version = this.SignInData.Version;
        this.SignInData = new SignInData()
        this.SignInData.Version = version;
        this.SignInData.SignInResult = SignInStatus.SignedOut;
        this.SignInStatusChange.next();
    }
}

//API return object
export class SignInData {
    public SignInResult: SignInStatus;
    public AttemptsRemaining: number;
    public Email: string;
    public VoterID: number;
    public SessionID: number;
    public Roles: string[];
    public JWT: string;
    public Version: number;
}

export enum SignInStatus {
    AlreadyAuthenticated = -1, //Does not prevent user logging in: User may already be authenticated but require higher permissions

    EmailNotProvided = 1,
    EmailFormatNotValid = 2,
    EmailNotRegistered = 3,
    EmailNotVerified = 4,

    PasswordNotProvided = 10,
    PasswordTooShort = 11,
    PasswordTooLong = 12,

    TokenSent = 20, //Upon Request
    TokenNotProvided = 21, //\Sign In with Token
    TokenNotValid = 22, //Token validation

    SignInSuccess = 30,
    SignInFailure = 31,
    AccountLocked = 32,
    SignedOut = 33, //SPA only

    RegistrationSuccess = 40,
    RegistrationFailure = 41,
    RequestToJoinNotYetApproved = 42,

    IPAddressBlocked = 50,
    IPAddressValid = 51,

    ErrorOccurred = 99
}