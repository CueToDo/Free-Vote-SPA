// Angular
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
  provideHttpClient
} from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';

import {
  Title,
  BrowserModule,
  bootstrapApplication
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

// Components
import { AppComponent } from './app/app.component';

// Services
import { InterceptorService } from 'src/app/services/interceptor.service';

// Auth0
import { AuthModule } from '@auth0/auth0-angular';

// Other
import { environment } from './environments/environment';
import { environment as env } from 'src/environments/environment';
import { appConfig } from './app/app.config';

export function getBaseUrl(): string {
  return document.getElementsByTagName('base')[0].href;
}

const providers = [{ provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }];

if (environment.production) {
  enableProdMode();
}

// Service Worker Registration (Optional Customization)
if (environment.production) {
  // Import the service worker file (replace with your actual path)

  // For whatever reason, Angular sometimes does not register the service worker properly.
  // https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered
  // https://free.vote/ngsw/state
  bootstrapApplication(AppComponent, appConfig).catch(err => console.log(err));
} else {
  bootstrapApplication(AppComponent);
}
