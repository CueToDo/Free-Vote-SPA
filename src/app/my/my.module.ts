//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule, ParamMap, ActivatedRouteSnapshot } from "@angular/router"

//modules
import { CoreComponentsModule } from '../corecomponentsmodule/corecomponents.module';

//Components
import { TagsComponent } from '../corecomponentsmodule/tags/tags.component';
import { PointsComponent } from '../corecomponentsmodule/points/points.component';
import { PointEditComponent } from '../corecomponentsmodule/point-edit/point-edit.component';
import { PointOfTheWeekVoteComponent } from './point-of-the-week-vote/point-of-the-week-vote.component';

//Services
import { LoginRouteGuardService } from '../services/login-route-guard.service';

//Private Module Routes
const privateRoutes: Routes = [
  { path: 'following-tags', component: TagsComponent, canActivate: [LoginRouteGuardService] },
  { path: 'points', component: PointsComponent, canActivate: [LoginRouteGuardService] },
  { path: 'favourite-points', component: PointsComponent, canActivate: [LoginRouteGuardService] },
  { path: 'point-of-the-week-vote', component: PointOfTheWeekVoteComponent, canActivate: [LoginRouteGuardService] },
  { path: 'new-point', component: PointEditComponent, canActivate: [LoginRouteGuardService] }
];

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    RouterModule.forChild(privateRoutes),
    FormsModule
  ],
  declarations: [
    PointOfTheWeekVoteComponent
  ]
  //providers: [LoginRouteGuardService] //YOU BASTARD AuthenticationService There's the separate instance
})

export class MyModule { }

//Learning Point - Error
//Component PointsComponent is not part of any NgModule or the module has not been imported into your module

//PointsComponent delared in app.module to be used in public (not signed in)
//Also needed in lazy loaded my.module where it is imported but not declared
//As my.module was declared in my folder, path to PointsComponent in import was different

//https://stackoverflow.com/questions/39527722/angular-2-component-is-not-part-of-any-ngmodule
//routes thinks its loading a different component then the module due to differences in the capitalization, 
//which means the ones being pulled into the routes were not the same ones as the module.

//??Not a capitalisation issue, but poss different relative path causing issue?
//Moved my.module to root, so that path to PointsComponent is exactly same
//Did not solve the issue

//PointsComponent was declared in app.module (imported by app.module and my.module)
//app.module imports my.module, not vice versa, so my.module does not have access to PointsComponent?

//Created common-components.module which declares PointsComponent and is imported by both app.module and my.module
//Still getting same error

//If i understand correctly, as you mentioned you are importing SharedModule in AppModule. 
//That will work only if you use in any of the component which is directly declared in AppModule.
//If you want it to be used in components that are declared in child module or any other module, 
//then you have to import in their respective modules as well. Components are not inherited from parent module.

//https://stackoverflow.com/questions/44900304/using-component-from-another-module-in-angular-4
//Component wasn't exported in common-components
//Still doesn't resolve
//app always compiles - it's a run time error

//https://stackoverflow.com/questions/44900304/using-component-from-another-module-in-angular-4
//Notice that my StarComponent is declared AND exported here. 
//It can then be used in any component that is declared in a module that imports this shared module.
//Tried exporting CommonModule, FormsModule from the shared module - didn't work

//Needed to add to the imports decorator on app.module as well as the "import from"

//___

//now get Can't bind to 'formGroup' since it isn't a known property of 'form'
//In the new common module must "import from" + import and export ReactiveFormsModule

//+ when you change your imports you must stop the webserver and ng serve again