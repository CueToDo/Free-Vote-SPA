// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { CallbackComponent } from './public/callback/callback.component';
import { HomeComponent } from './public/home/home.component';
import { CardComponent } from './public/card/card.component';
import { PointOfTheWeekComponent } from './public/point-of-the-week/point-of-the-week.component';
import { TagsAndPointsComponent } from './public/tags-and-points/tags-and-points.component';
import { PointShareComponent } from './public/point-share/point-share.component';

// Services: if decorated with "providedIn", no need to import and must NOT add to providers
// Only need to import LoginRouteGuardService as it's used in appRoots declaration
import { LoginRouteGuardService } from './services/login-route-guard.service';

const appRoutes: Routes = [
  // Refresh in browser fails - when route is specified
  // Make a web.config file in the root directory.
  // https://stackoverflow.com/questions/35284988/angular-2-404-error-occur-when-i-refresh-through-the-browser

  // https://stackoverflow.com/questions/49566446/how-can-i-have-iis-properly-serve-webmanifest-files-on-my-web-site
  // Map the .webmanifest file extension to its appropriate MIME type.

  // route order must avoid ambiguities between route and parameters (alias, tag, tab)
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'privacy-policy', component: HomeComponent },
  { path: 'about', component: HomeComponent },
  { path: 'card', component: CardComponent },

  { path: 'callback', component: CallbackComponent },

  { path: 'by/:alias', component: TagsAndPointsComponent },
  {
    path: 'point-of-the-week',
    component: PointOfTheWeekComponent,
    canActivate: [LoginRouteGuardService]
  },

  // Being used even when not included!!!

  // lazy loaded feature modules:

  // local constituency
  {
    path: 'local',
    loadChildren: () => import('./local/local.module').then(m => m.LocalModule)
  },

  // organisations, groups
  {
    path: 'organisations',
    loadChildren: () =>
      import('./organisations/organisations.module').then(
        m => m.OrganisationsModule
      ),
    canActivate: [LoginRouteGuardService]
  },

  // profile
  {
    path: 'my',
    loadChildren: () => import('./my/my.module').then(m => m.MyModule),
    canActivate: [LoginRouteGuardService]
  },

  // following are "external" links - need to be tested from url, not tab links
  { path: 'trending', component: TagsAndPointsComponent }, // TAGS
  { path: 'recent', component: TagsAndPointsComponent }, // TAGS personal - recent selection - works on anon?
  { path: 'search', component: TagsAndPointsComponent }, // Tag Search

  // Finally :tag routeparameter is last
  {
    path: ':tag',
    component: TagsAndPointsComponent,
    children: [
      { path: 'points', component: TagsAndPointsComponent }, // Return from point share
      { path: 'questions', component: TagsAndPointsComponent }, // Return from question answers
      { path: 'by/:alias', component: TagsAndPointsComponent },
      { path: ':title', component: PointShareComponent },
      {
        path: ':question/:questionSlug',
        component: TagsAndPointsComponent
      }
    ]
  },

  // Azure only:https://bossprogrammer.medium.com/how-to-deploy-an-angular-10-universal-app-with-server-side-rendering-to-azure-a2b90df9ca64
  { path: '**', redirectTo: '' } // Add a wildcard route to app-routing.module.ts )
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      initialNavigation: 'enabledBlocking'
      // enableTracing: true // <-- debugging purposes only
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
