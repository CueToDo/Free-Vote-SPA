// Angular
import {
  BrowserModule,
  BrowserTransferStateModule,
  Title
} from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ServiceWorkerModule } from '@angular/service-worker';

// Material
import { MaterialModule } from './material.module';

// ngx-bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// Other
import { environment } from '../environments/environment';

// Services
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './services/interceptor.service';

// Facebook
// import { FacebookModule } from 'ngx-facebook';
// import { FBTestComponent } from './fbtest/fbtest.component';

// Modules
import { CustomModule } from './custommodule/custom.module';
import { PublicModule } from './public/public.module';
import { OrganisationsModule } from './organisations/organisations.module';

// Global Singleton Services imported from Services Module
// https://angular.io/guide/singleton-services
// https://stackoverflow.com/questions/51502757/angular-service-singleton-constructor-called-multiple-times

// App Components
import { AppComponent } from './app.component';

// https://jasonwatmore.com/post/2020/09/22/angular-facebook-how-to-use-the-facebook-sdk-in-an-angular-app
export function initializeApp() {
  // return () =>
  //   new Promise(_ => {
  //     // wait for facebook sdk to initialize before starting the angular app
  //     window['fbAsyncInit'] = function () {
  //       // FB.init({
  //       //   appId: environment.facebookAppId,
  //       //   cookie: true,
  //       //   xfbml: true,
  //       //   version: 'v11.0'
  //       // });
  //     };
  //     // load facebook sdk script
  //     (function (d, s, id) {
  //       var js: HTMLScriptElement,
  //         fjs = d.getElementsByTagName(s)[0];
  //       if (d.getElementById(id)) {
  //         return;
  //       }
  //       js = d.createElement(s) as HTMLScriptElement;
  //       js.id = id;
  //       js.src = 'https://connect.facebook.net/en_US/sdk.js';
  //       fjs.parentNode?.insertBefore(js, fjs);
  //     })(document, 'script', 'facebook-jssdk');
  //   });
}

// Angular #StopTheSteal
// https://indepth.dev/posts/1015/beware-angular-can-steal-your-time

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,

    // FacebookModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    }),

    // Material
    MaterialModule,

    // Bootstrap DropDowns
    BsDropdownModule.forRoot(),

    CustomModule,
    PublicModule,
    OrganisationsModule
  ],
  declarations: [
    AppComponent
    // FBTestComponent
  ],
  // Singleton Services are provided in AppRoot
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => initializeApp,
      multi: true
    },
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
