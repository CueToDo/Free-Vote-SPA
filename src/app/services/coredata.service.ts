import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Cookie } from 'ng2-cookies';

@Injectable()
export class CoreDataService {

  public SpaDomain: string;
  public Website: string;
  public ServiceUrl: string;

  public get SignInData(): SignInData {

    var signInData = new SignInData();

    if (Cookie.get("SignInData") != "") {
      signInData = JSON.parse(Cookie.get("SignInData").valueOf());
    }

    return signInData;
  }



  public PageTitle: string;
  public SlashTag: string;
  public TagDisplay: string;

  constructor() {

    this.SpaDomain = window.location.origin.split("//")[1].split(":")[0].replace('api.', '');

    if (this.SpaDomain == 'localhost') {
      this.Website = 'free.vote';
      this.ServiceUrl = 'http://localhost:56529/';
    } else {
      this.Website = this.SpaDomain;
      this.ServiceUrl = 'https://api.free.vote/';
    }

    console.log({ Website: this.Website, ServiceUrl: this.ServiceUrl })
  }



  //http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
  private tagDisplaySubject = new Subject<string>();
  private titleSubject = new Subject<string>();

  SetTagRoute(tagRoute: string) {

    this.SlashTag = tagRoute;
    this.PageTitle = this.TagDisplay;

    this.tagDisplaySubject.next(this.TagDisplay);
    this.titleSubject.next(this.TagDisplay);

    return
  }

  GetTagDisplay(): Observable<string> {
    return this.tagDisplaySubject.asObservable();
  }

  SetPageTitle(pageTitle: string) {
    this.PageTitle = pageTitle;
    this.titleSubject.next(pageTitle)
  }

  GetPageTitle(): Observable<string> {
    return this.titleSubject.asObservable();
  }

}

//API return object
export class SignInData {
  //Server Error
  Error: string = "";
  //SignIn Status
  public SignInStatus = SignInStatus.SignedOut;
  //SignIn Failure
  public AttemptsRemaining: number = 0;
  //SignIn Success
  public JWT: string = "";
  public roles: string[] = [];
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
  TokenNotProvided = 21, //Sign In with Token
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