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
  signInWithPopup
} from '@angular/fire/auth';

// rxjs
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

// Models
import { FreeVoteProfile } from '../models/FreeVoteProfile';

// Services
import { LocalDataService } from './local-data.service';
import { ProfileService } from './profile.service';

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
    private auth: Auth,
    private profileService: ProfileService,
    private localData: LocalDataService,
    public router: Router
  ) {
    onAuthStateChanged(auth, firebaseUser => {
      this.localData.cookieConsent = false;
      this.firebaseUserInfo = firebaseUser;

      if (!!firebaseUser) {
        firebaseUser
          .getIdToken()
          .then(idToken => {
            this.localData.AccessToken = idToken;

            this.GettingProfile$.next(true);

            // Get the FreeVote Profile data
            this.profile$ = this.profileService
              .GetProfile(this.Email)
              .subscribe({
                next: (profile: FreeVoteProfile) => {
                  this.localData.AssignAPIValues(profile);
                  this.GettingProfile$.next(false);
                  this.SignedIn$.next(true);
                  this.UpdatePhotoUrl();
                },
                error: err => {
                  this.GettingProfile$.next(false);
                  this.SignInError$.next(err);
                  this.SignedIn$.next(false);
                  this.signOut();
                }
              });
          })
          .catch(err => console.log('getIdToken ERROR', err));
      } else {
        console.log('NO FBU');
        this.localData.SignedOut();
        this.SignedIn$.next(false);
        this.UpdatePhotoUrl();
      }
    });
  }

  signInWithGoogle() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
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
    signInWithPopup(this.auth, new TwitterAuthProvider())
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
    signInWithPopup(this.auth, fb)
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
    signInWithEmailAndPassword(this.auth, email, password)
      .then((result: { user: any }) => {
        alert(result);
      })
      .catch((error: { message: any }) => {
        window.alert(error.message);
      });
  }

  createUser(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
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
    return this.auth.signOut().then(() => {
      this.localData.AccessTokenClear();
      localStorage.removeItem('user');
    });
  }

  ngOnDestroy() {
    if (!!this.profile$) this.profile$.unsubscribe();
  }
}
