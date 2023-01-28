// Angular
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Auth0 - Use custom interceptor to add Auth0 Access Token, not the Auth0 interceptor
import { AuthModule } from '@auth0/auth0-angular';

// Other
import { environment as env } from 'src/environments/environment';

// Services
import { InterceptorService } from 'src/app/services/interceptor.service';

// Modules
import { AppRoutingModule } from 'src/app/app-routing.module';
import { CustomModule } from 'src/app/custommodule/custom.module';
import { PublicModule } from 'src/app/public/public.module';

// Global Singleton Services imported from Services Module
// https://angular.io/guide/singleton-services
// https://stackoverflow.com/questions/51502757/angular-service-singleton-constructor-called-multiple-times

// App Components
import { AppComponent } from './app.component';

// Angular #StopTheSteal
// https://indepth.dev/posts/1015/beware-angular-can-steal-your-time

@NgModule({
  // Do not import feature modules that should be lazy-loaded in your app module,
  // otherwise they will be eager loaded.
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,

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
    MatButtonModule,
    MatIconModule,

    // FreeVote main modules - not lazy loaded feature modules
    CustomModule,
    PublicModule
  ],
  declarations: [AppComponent],
  // Singleton Services are provided in AppRoot
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
