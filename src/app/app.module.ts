// Angular
import {
  BrowserModule,
  BrowserTransferStateModule,
  Title
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ServiceWorkerModule } from '@angular/service-worker';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Other
import { environment } from '../environments/environment';

// Services
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './services/interceptor.service';

// Facebook
// import { FacebookModule } from 'ngx-facebook';
// import { FBTestComponent } from './fbtest/fbtest.component';

// Modules
import { LocalModule } from 'src/app/local/local.module';
import { CustomModule } from 'src/app/custommodule/custom.module';
import { IssuesModule } from 'src/app/issues/issues.module';
import { OrganisationsModule } from 'src/app/organisations/organisations.module';
import { PublicModule } from 'src/app/public/public.module';

// Global Singleton Services imported from Services Module
// https://angular.io/guide/singleton-services
// https://stackoverflow.com/questions/51502757/angular-service-singleton-constructor-called-multiple-times

// App Components
import { AppComponent } from './app.component';

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

    // PWA ServcieWorkerModule
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

    // Material
    MatButtonModule,
    MatIconModule,

    // FreeVote
    CustomModule,
    PublicModule,
    OrganisationsModule,
    LocalModule,

    IssuesModule
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
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
