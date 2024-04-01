// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

// Components
import { CardComponent } from './public/card/card.component';
import { ConstituencyComponent } from './local/constituency/constituency.component';
import { ConstituencySearchComponent } from './local/constituency-search/constituency-search.component';
import { HomeComponent } from './public/home/home.component';
import { PointCommentsComponent } from './public/point-comments/point-comments.component';
import { PointOfTheWeekComponent } from './public/point-of-the-week/point-of-the-week.component';
import { TagsAndPointsComponent } from './public/tags-and-points/tags-and-points.component';

// Services: if decorated with "providedIn", no need to import and must NOT add to providers
// Only need to import LoginRouteGuardService as it's used in appRoots declaration
import { LoginRouteGuardService } from './services/login-route-guard.service';
import { LocalMenuComponent } from './local/local-menu/local-menu.component';
import { OrganisationComponent } from './organisations/organisation/organisation.component';
import { OrganisationsComponent } from './organisations/organisations/organisations.component';

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

  {
    path: 'point-of-the-week',
    component: PointOfTheWeekComponent,
    canActivate: [LoginRouteGuardService]
  },

  { path: 'constituency/search', component: ConstituencySearchComponent },
  { path: 'constituency/:constituency', component: ConstituencyComponent },
  {
    path: 'constituency/:constituency/:electionDate/:candidateName',
    component: ConstituencyComponent
  },

  // following are "external" links - need to be tested from url, not tab links
  { path: 'slash-tags', component: TagsAndPointsComponent },
  { path: 'trending', component: TagsAndPointsComponent }, // Tags
  { path: 'recent', component: TagsAndPointsComponent }, // Tags personal - recent selection - works on anon?
  { path: 'tag-search', component: TagsAndPointsComponent }, // Tag Search

  { path: 'slash-tags/:constituency', component: TagsAndPointsComponent },
  { path: 'trending/:constituency', component: TagsAndPointsComponent }, // Tags
  { path: 'recent/:constituency', component: TagsAndPointsComponent }, // Tags personal - recent selection - works on anon?
  { path: 'tag-search/:constituency', component: TagsAndPointsComponent }, // Tag Search

  // In Angular routing, you cannot have a fixed route part directly following a route parameter
  // issue with :tag/points - reversed to points/:tag
  { path: 'points/:tag', component: TagsAndPointsComponent },
  { path: 'questions/:tag', component: TagsAndPointsComponent },
  { path: 'by/:alias', component: TagsAndPointsComponent },

  // lazy loaded feature modules:
  // profile
  {
    path: 'my',
    loadChildren: () => import('./my/my.module').then(m => m.MyModule),
    canActivate: [LoginRouteGuardService]
  },

  // organisations
  // To Do after conversion to standalone - how are these routeguarded?
  { path: 'organisations/membership', component: OrganisationsComponent },
  { path: 'organisations/available', component: OrganisationsComponent },
  { path: 'organisations/new', component: OrganisationsComponent },
  { path: 'organisations/:organisationSlug', component: OrganisationComponent },

  // Moved from local module on conversion to standalone
  {
    path: 'local/voters',
    component: LocalMenuComponent,
    canActivate: [LoginRouteGuardService],
    children: [
      {
        path: 'local/:alias',
        component: LocalMenuComponent
      }
    ]
  },
  { path: 'local:constituency', component: ConstituencyComponent },

  // All tags as first parameter must come after static routes

  // Single routeparameter :tag
  { path: ':tag', component: TagsAndPointsComponent },
  { path: ':tag/by/:alias', component: TagsAndPointsComponent },
  { path: ':tag/question/:questionSlug', component: TagsAndPointsComponent },

  // Double routeparameter
  { path: ':tag/:title', component: PointCommentsComponent },
  {
    path: ':tag/:title/:shareTitle/:sharePreview/:shareImage',
    component: PointCommentsComponent
  },

  {
    path: ':constituency/:tag/:pointsorquestions',
    component: TagsAndPointsComponent
  },

  // Azure only:https://bossprogrammer.medium.com/how-to-deploy-an-angular-10-universal-app-with-server-side-rendering-to-azure-a2b90df9ca64
  { path: '**', redirectTo: '' } // Add a wildcard route to app-routing.module.ts )
];

const routerSettings: ExtraOptions = {
  initialNavigation: 'enabledBlocking'
  // enableTracing: true // <-- debugging route issues only
};

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, routerSettings)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
