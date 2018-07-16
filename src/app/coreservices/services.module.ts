import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignInData } from './classes';

// App wide singleton services
import { HttpClientService } from './http-client.service';
import { AuthenticationService } from './authentication.service';
import { LoginRouteGuardService } from './login-route-guard.service';
import { TagsService } from './tags.service';
import { PointsService } from './points.service';
import { CoreDataService } from './coredata.service';

@NgModule({
  imports: [
    CommonModule
  ],
  // declarations: [SignInData], //rare declaration in Services Module
  providers: [CoreDataService, HttpClientService, AuthenticationService, LoginRouteGuardService, TagsService, PointsService]
})

export class ServicesModule {

}
