// Angular
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

// Firebase
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  FacebookAuthProvider,
  GoogleAuthProvider,
  UserInfo,
  getAdditionalUserInfo
} from '@angular/fire/auth';

// rxjs
import { BehaviorSubject, Subscription } from 'rxjs';

// Models
import { FreeVoteProfile } from '../models/FreeVoteProfile';

// Services
import { LocalDataService } from './local-data.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private get firebaseUserInfo(): UserInfo | null {
    const ui = localStorage.getItem('userInfo');
    if (!!ui) return JSON.parse(ui);
    return null;
  }

  private set firebaseUserInfo(ui: UserInfo | null) {
    if (!!ui) localStorage.setItem('userInfo', JSON.stringify(ui));
    else localStorage.removeItem('userInfo');
  }

  public get PhotoUrl(): string {
    let photoUrl = this.firebaseUserInfo?.photoURL;
    if (!!photoUrl) return photoUrl;
    return '';
  }

  public SignedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private profile$: Subscription | undefined;

  public get IsSignedIn(): boolean {
    return !!this.firebaseUserInfo;
  }

  //   constructor(public auth: Auth) {
  //     /* Saving user data in localstorage when
  //     logged in and setting up null when logged out */
  //     this.auth.authStateReady.subscribe((user) => {
  //       if (user) {
  //         this.userData = user;
  //         localStorage.setItem('user', JSON.stringify(this.userData));
  //         JSON.parse(localStorage.getItem('user')!);
  //       } else {
  //         localStorage.setItem('user', 'null');
  //         JSON.parse(localStorage.getItem('user')!);
  //       }
  //     });
  //   }

  constructor(
    private auth: Auth,
    private profileService: ProfileService,
    private localData: LocalDataService,
    public router: Router
  ) {
    console.log('AuthorizationService', auth.name);

    onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        this.SignedIn$.next(true);

        this.firebaseUserInfo = firebaseUser;

        firebaseUser.getIdToken().then(idToken => {
          this.localData.AccessToken = idToken;

          this.profile$ = this.profileService
            .GetProfile()
            .subscribe((profile: FreeVoteProfile) => {
              this.localData.AssignAPIValues(profile);
            });
        });
      } else {
        this.firebaseUserInfo = null;
        this.localData.SignedOut();
        this.SignedIn$.next(false);
      }
    });
  }

  signInWithFacebook() {
    let fb = new FacebookAuthProvider();
    fb.addScope('email');
    signInWithPopup(this.auth, fb)
      .then(result => {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...

        let additional = getAdditionalUserInfo(result);
        let profile = additional?.profile;
        if (!!profile) {
          var picture: any = profile['picture'];
          console.log('profile: ', picture.data.url);
        }
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);
        console.log(error);
        // ...
      });
  }

  signInWithGoogle() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then(result => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
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
      this.router.navigate(['sign-in']);
    });
  }

  ngOnDestroy() {
    if (!!this.profile$) this.profile$.unsubscribe();
  }
}
