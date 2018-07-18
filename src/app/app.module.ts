// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule, ParamMap, ActivatedRouteSnapshot } from '@angular/router';

// Bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'; /* Bootstrap dropdowns */

// Facebook
import { FacebookModule } from 'ngx-facebook';
import { FBTestComponent } from './fbtest/fbtest.component';

// Modules
import { MyModule } from './my/my.module';
import { CoreComponentsModule } from './corecomponentsmodule/corecomponents.module';

// Global Singleton Services imported from Services Module
import { ServicesModule } from './coreservices/services.module';

// LoginRouteGuardService imported for Routes, but not provided
import { LoginRouteGuardService } from './coreservices/login-route-guard.service'; // currently needed in Routes below

// App Components
import { AppComponent } from './app.component';
import { MenuComponent } from './public/menu/menu.component';
import { HomeComponent } from './public/home/home.component';
import { SignInComponent } from './Authentication/sign-in/sign-in.component';

import { TagsComponent } from './corecomponentsmodule/tags/tags.component';
import { PointOfTheWeekComponent } from './public/point-of-the-week/point-of-the-week.component';
import { SelectedTagComponent } from './public/selected-tag/selected-tag.component';
import { SignOutComponent } from './authentication/sign-out/sign-out.component';
import { PointsComponent } from './corecomponentsmodule/points/points.component';


// Other Module Components
// import { TrendingComponent } from './posts-public/trending/trending.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'join', component: SignInComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-out', component: SignOutComponent },
  { path: 'trending', component: TagsComponent },
  { path: 'point-of-the-week', component: PointOfTheWeekComponent },
  { path: 'my', loadChildren: './my/my.module#MyModule', canActivate: [LoginRouteGuardService] },
  { path: 'profile', loadChildren: './profile/profile.module#ProfileModule', canActivate: [LoginRouteGuardService] },
  { path: ':tag', component: PointsComponent }
];


@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    FacebookModule.forRoot(),
    BsDropdownModule.forRoot(),
    ServicesModule,
    CoreComponentsModule,
    MyModule
  ],
  declarations: [
    AppComponent,
    MenuComponent,
    FBTestComponent,
    HomeComponent,
    SignInComponent,
    SignOutComponent,
    PointOfTheWeekComponent,
    SelectedTagComponent
  ],
  // ALL Services are provided in imported Services module
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
