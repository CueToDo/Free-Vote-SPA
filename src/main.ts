import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment as env } from 'src/environments/environment';
import { AuthModule } from '@auth0/auth0-angular';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Title, BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { InterceptorService } from 'src/app/services/interceptor.service';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';

export function getBaseUrl(): string {
  return document.getElementsByTagName('base')[0].href;
}

const providers = [{ provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }];

if (environment.production) {
  enableProdMode();
}

// For whatever reason, Angular sometimes does not register the service worker properly.
// https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered
// https://free.vote/ngsw/state
https: bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule.withServerTransition({ appId: 'serverApp' }), FormsModule, AppRoutingModule, 
        // Auth0
        AuthModule.forRoot({
            ...env.auth,
            httpInterceptor: {
                ...env.httpInterceptor
            }
        }), 
        // PWA ServcieWorkerModule
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: env.production,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }), 
        // Material
        MatButtonModule, MatIconModule),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorService,
            multi: true
        },
        Title,
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .then(() => {
    if ('serviceWorker' in navigator && environment.production) {
      navigator.serviceWorker.register('ngsw-worker.js');
    }
  })
  .catch(err => console.log(err));
