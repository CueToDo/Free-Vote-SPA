import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import { TagDisplayPipe } from './tag-display.pipe';

@Injectable()
export class CoreDataService {

  constructor(private tagDisplayPipe: TagDisplayPipe) { }

  public PageTitle: string;
  public TagRoute: string;
  public TagDisplay: string;

  //http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
  private tagDisplaySubject = new Subject<string>();
  private titleSubject = new Subject<string>();

  SetTagRoute(tagRoute: string) {

    this.TagRoute = tagRoute;
    this.TagDisplay = this.tagDisplayPipe.transform(tagRoute);
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
  //SignIn Failure
  public AttemptsRemaining: number;
  //SignIn Status
  public SignInStatus: SignInStatus;
  //SignIn Success
  public JWT: string;
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