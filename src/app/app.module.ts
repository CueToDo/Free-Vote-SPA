//Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule, ParamMap, ActivatedRouteSnapshot } from "@angular/router"

//Bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'; /* Bootstrap dropdowns */

//Facebook
import { FacebookModule } from 'ngx-facebook';
import { FBTestComponent } from './fbtest/fbtest.component';

//Modules
//import { PostsPrivateModule } from './posts-private/posts-private.module';

//App Services
import { ServicesModule } from './services/services.module';
import { LoginRouteGuardService } from './services/login-route-guard.service'; //currently needed in Routes below

//App Components
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './Authentication/sign-in/sign-in.component';

import { TrendingComponent } from './public/trending/trending.component';
import { PostOfTheWeekComponent } from './public/post-of-the-week/post-of-the-week.component';
import { SelectedTagComponent } from './public/selected-tag/selected-tag.component';
import { SignOutComponent } from './authentication/sign-out/sign-out.component';
import { PointsComponent } from './public/points/points.component';


//Other Module Components
//import { TrendingComponent } from './posts-public/trending/trending.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'join', component: SignInComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-out', component: SignOutComponent },
  { path: 'trending', component: TrendingComponent },
  { path: 'post-of-the-week', component: PostOfTheWeekComponent },
  { path: 'private', loadChildren: './private/private.module#PrivateModule' },
  { path: 'personal', loadChildren: './personal/personal.module#PersonalModule', canActivate: [LoginRouteGuardService] },
  { path: ':tag', component: PointsComponent },
  { path: 'private/my-posts', component: PointsComponent }
];


@NgModule({
  declarations: [
    ServicesModule,
    AppComponent,
    MenuComponent,
    FBTestComponent,
    HomeComponent,
    SignInComponent,
    SignOutComponent,
    TrendingComponent,
    PostOfTheWeekComponent,
    SelectedTagComponent,
    PointsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    FacebookModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  //ALL Services are provided in imported Services module
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}