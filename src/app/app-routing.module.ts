
// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { CallbackComponent } from './public/callback/callback.component';
import { HomeComponent } from './public/home/home.component';
import { PointOfTheWeekComponent } from './public/point-of-the-week/point-of-the-week.component';
import { ScrollerComponent } from './public/scroller/scroller.component';
import { TagsPointsComponent } from './public/tags-points/tags-points.component';

// Services: if decorated with "providedIn", no need to import and must NOT add to providers
// Only need to import LoginRouteGuardService as it's used in appRoots declaration
import { LoginRouteGuardService } from './services/login-route-guard.service';

const appRoutes: Routes = [

  // route order must avoid ambiguities between route and parameters (alias, tag, tab)
  { path: 'scroller', component: ScrollerComponent }, // a test component

  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

  { path: 'callback', component: CallbackComponent },

  { path: 'by/:alias', component: TagsPointsComponent },
  { path: 'point-of-the-week', component: PointOfTheWeekComponent, canActivate: [LoginRouteGuardService] },

  // organisations, groups and profile
  {
    path: 'organisations', loadChildren:
      () => import('./organisations/organisations.module').then(m => m.OrganisationsModule), canActivate: [LoginRouteGuardService]
  },
  {
    path: 'group', loadChildren:
      () => import('./organisations/organisations.module').then(m => m.OrganisationsModule), canActivate: [LoginRouteGuardService]
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
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
