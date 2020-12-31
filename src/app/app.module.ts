
// Angular
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Material
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

// ngx-bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// Other
import { DeviceDetectorModule } from 'ngx-device-detector';

import { ServiceWorkerModule } from '@angular/service-worker';
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

// Global Singleton Services imported from Services Module
// https://angular.io/guide/singleton-services
// https://stackoverflow.com/questions/51502757/angular-service-singleton-constructor-called-multiple-times

// Services: if decorated with "providedIn", no need to import and must NOT add to providers
// Only need to import LoginRouteGuardService as it's used in appRoots declaration
import { LoginRouteGuardService } from './services/login-route-guard.service'; // Needed in Routes below

// App Components
import { AppComponent } from './app.component';
import { HomeComponent } from './public/home/home.component';
import { CallbackComponent } from './public/callback/callback.component';

import { TagsPointsComponent } from './public/tags-points/tags-points.component';
import { VotersMenuComponent } from './public/voters-menu/voters-menu.component';
import { PointOfTheWeekComponent } from './public/point-of-the-week/point-of-the-week.component';
import { ScrollerComponent } from './public/scroller/scroller.component'; // test scrolling

const appRoutes: Routes = [

  // route order must avoid ambiguities between route and parameters (alias, tag, tab)
  { path: 'scroller', component: ScrollerComponent },

  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

  { path: 'callback', component: CallbackComponent },

  { path: 'voters', component: VotersMenuComponent, canActivate: [LoginRouteGuardService] },
  { path: 'voters/:alias', component: VotersMenuComponent, canActivate: [LoginRouteGuardService] },
  { path: 'by/:alias', component: TagsPointsComponent },
  { path: 'point-of-the-week', component: PointOfTheWeekComponent, canActivate: [LoginRouteGuardService] },

  // groups and profile
  {
    path: 'organisations', loadChildren:
      () => import('./organisations/organisations.module').then(m => m.GroupsModule), canActivate: [LoginRouteGuardService]
  },
  {
    path: 'group', loadChildren:
      () => import('./organisations/organisations.module').then(m => m.GroupsModule), canActivate: [LoginRouteGuardService]
  },
  {
    path: 'my/:tab', loadChildren:
      () => import('./my/my.module').then(m => m.MyModule), canActivate: [LoginRouteGuardService]
  },

  // slashtags is the "internal" link to TagsPointsComponent from which all TABS are accessible
  { path: 'slash-tags', component: TagsPointsComponent }, // TAGS: TagsPointsComponent can handle tags, people or points

  // following are "external" links - need to be tested from url, not tab links
  { path: 'slash-tags/trending', component: TagsPointsComponent }, // TAGS
  { path: 'slash-tags/recent', component: TagsPointsComponent }, // TAGS personal - recent selection - works on anon?
  { path: 'new-point', component: TagsPointsComponent },
  { path: 'slash-tag/:tag/:title', component: TagsPointsComponent },
  { path: ':tag/by/:alias', component: TagsPointsComponent },
  { path: ':tag/:pointId', component: TagsPointsComponent },
  { path: ':tag', component: TagsPointsComponent } // POINTS: still like the SlashTag

];


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ClipboardModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule, // ToDo Remove
    HttpClientModule,
    RouterModule.forRoot(appRoutes),

    BsDropdownModule.forRoot(), // Bootstrap DropDowns
    DeviceDetectorModule.forRoot(), // Other
    // FacebookModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    CustomModule,
    PublicModule
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
export class AppModule {

}
