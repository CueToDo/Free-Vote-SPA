// Angular
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

// Firebase
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  TwitterAuthProvider,
  User,
  signInWithPopup,
  idToken
} from '@angular/fire/auth';

// rxjs
import {
  BehaviorSubject,
  delay,
  fromEvent,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  take
} from 'rxjs';

// Models
import { FreeVoteProfile } from '../models/FreeVoteProfile';

// Services
import { LocalDataService } from './local-data.service';
import { ProfileService } from './profile.service';
import { DatetimeService } from './datetime.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // Subjects, BehaviorSubjects
  public SignedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public SignInError$: Subject<string> = new Subject();
  public PhotoUrl$: Subject<string> = new Subject();
  public GettingProfile$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Subscriptions
  private profile$: Subscription | undefined;

  private firebaseUserInfo: User | null = null;

  public get IsSignedIn(): boolean {
    return !!this.firebaseUserInfo;
  }

  private get Email(): string {
    const provider = this.firebaseUserInfo?.providerData[0].providerId;
    console.log('Email', this.firebaseUserInfo, 'Provider', provider);

    switch (provider) {
      case 'google.com':
        return this.firebaseUserInfo?.email ?? '';
      case 'facebook.com':
      case 'twitter.com':
        return this.firebaseUserInfo?.providerData[0]?.email ?? '';
      default:
        return '';
    }
  }

  public UpdatePhotoUrl(): void {
    var photoUrl = '';

    if (this.IsSignedIn) {
      photoUrl = this.firebaseUserInfo?.providerData[0]?.photoURL ?? '';
    } else {
      photoUrl = '';
    }

    this.PhotoUrl$.next(photoUrl);
  }

  constructor(
    private angularFireAuth: Auth,
    private httpService: HttpService,
    private localData: LocalDataService,
    private profileService: ProfileService,
    public router: Router
  ) {
    // OnAUthStateCHange could be session expiry
    onAuthStateChanged(angularFireAuth, firebaseUser => {
      this.firebaseUserInfo = firebaseUser;
      this.TokenRefresh();
    });
  }

  TokenRefresh() {
    if (!!this.firebaseUserInfo) {
      // state has changed to signed in (or session expiry???) - get a JWT token
      // wait for network availability before token refresh

      // Define an Observable that emits true if we should wait, or an empty value otherwise
      const waitForOnline: Observable<any> = !this.httpService.online
        ? fromEvent(window, 'online').pipe(take(1))
        : of(null);

      // Use switchMap wait for online (if not already) before getting token
      waitForOnline
        .pipe(
          switchMap(_ => {
            console.log('Network available - now getting token');
            // Assert that we have firebaseUserInfo with ! (checked above)
            return this.firebaseUserInfo!.getIdToken();
          }),
          switchMap(idToken => {
            // Save the token and get user profile
            this.localData.AccessToken = idToken;

            if (!!idToken) {
              this.GettingProfile$.next(true);
              // Get user profile
              return this.profileService.GetProfile(this.Email);
            } else {
              return of(null);
            }
          })
        )
        .subscribe({
          next: (profile: FreeVoteProfile | null) => {
            if (!!profile) {
              this.localData.AssignAPIValues(profile);
              this.SignedIn$.next(true);
              this.UpdatePhotoUrl();
            }
            this.GettingProfile$.next(false);
          },
          error: err => {
            this.GettingProfile$.next(false);
            this.SignInError$.next(err);
            this.SignedIn$.next(false);
            this.signOut();
          }
        });
    } else {
      console.log('No FirebaseUser - signed out');
    }
  }

  public ForcedIDTokenRefresh(): void {
    this.TokenRefresh();
  }

  signInWithGoogle() {
    signInWithPopup(this.angularFireAuth, new GoogleAuthProvider())
      .then(result => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential?.accessToken;
        // The signed-in user info.
        // const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch(error => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  signInWithX() {
    signInWithPopup(this.angularFireAuth, new TwitterAuthProvider())
      .then(result => {
        console.log('Twitter Login Success');
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = TwitterAuthProvider.credentialFromResult(result);
        // const token = credential?.accessToken;
        // The signed-in user info.
        // const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch(error => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        // const credential = TwitterAuthProvider.credentialFromError(error);
        // ...
      });
  }

  signInWithFacebook() {
    let fb = new FacebookAuthProvider();
    fb.addScope('email');
    signInWithPopup(this.angularFireAuth, fb)
      .then(result => {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        // const credential = FacebookAuthProvider.credentialFromResult(result);
        // const accessToken = credential?.accessToken;

        // The signed-in user info.
        // const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...

        let additional = getAdditionalUserInfo(result);
        this.localData.Log(JSON.stringify(additional));
        console.log('Additional', additional);
        let profile = additional?.profile;
        if (!!profile) {
          var picture: any = profile['picture'];
          console.log('profile: ', picture.data.url);
        }
      })
      .catch(error => {
        // Handle Errors here.
        // const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);

        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        // const credential = FacebookAuthProvider.credentialFromError(error);
        console.log(error);
        // ...
      });
  }

  emailAndPassword(email: string, password: string) {
    signInWithEmailAndPassword(this.angularFireAuth, email, password)
      .then((result: { user: any }) => {
        alert(result);
      })
      .catch((error: { message: any }) => {
        window.alert(error.message);
      });
  }

  createUser(email: string, password: string) {
    createUserWithEmailAndPassword(this.angularFireAuth, email, password)
      .then((userCredential: { user: any }) => {
        alert(userCredential.user);
        console.log(userCredential.user);
      })
      .catch((error: { message: any }) => {
        window.alert(error.message);
        console.log(error.message);
      });
  }

  // Sign out
  signOut() {
    return this.angularFireAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.localData.AccessTokenClear();
      this.localData.cookieConsent = false; // All anon users must re-consent to cookies
      this.localData.SignedOut();
      this.UpdatePhotoUrl();
      this.SignedIn$.next(false);
    });
  }

  ngOnDestroy() {
    if (!!this.profile$) this.profile$.unsubscribe();
  }
}
