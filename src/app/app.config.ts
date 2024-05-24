// Angular
import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

// Firebase Auth
import { getAuth, provideAuth } from '@angular/fire/auth';

// FreeVote routes
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Base element in index.html
// Base Url with Standalone components - https://g.co/gemini/share/162c224716d3
function getBaseUrl(): string {
  return document.getElementsByTagName('base')[0].href;
}

// Service Worker Registration (Optional Customization)
// Import the service worker file (replace with your actual path)
// For whatever reason, Angular sometimes does not register the service worker properly.
// https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered
// https://free.vote/ngsw/state

const firebaseConfig = {
  projectId: 'free-vote-auth',
  appId: '1:946815947727:web:fadb235cce0919bba9b8ba',
  storageBucket: 'free-vote-auth.appspot.com',
  apiKey: 'AIzaSyD9cWwgcw-yMxK8FqI5Jz41pBKBP5KmAgo',
  authDomain: 'free-vote-auth.firebaseapp.com',
  messagingSenderId: '946815947727',
  measurementId: 'G-S48NXDR4TZ'
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    provideRouter(routes),
    provideHttpClient(),
    provideClientHydration(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    // https://stackoverflow.com/questions/72504142/how-to-add-browseranimationsmodule-or-noopanimationsmodule-to-standalone-compone
    importProvidersFrom([BrowserAnimationsModule]),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideAnimationsAsync()
  ]
};
