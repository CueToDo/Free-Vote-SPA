import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignInData } from '../models/signin.model';

// App wide singleton services
import { HttpClientService } from './http-client.service';
import { LoginRouteGuardService } from './login-route-guard.service';
import { TagsService } from './tags.service';
import { PointsService } from './points.service';
import { CoreDataService } from './coredata.service';

@NgModule({
  imports: [
    CommonModule
  ],
  // declarations: [SignInData], //rare declaration in Services Module
  providers: [CoreDataService, HttpClientService, LoginRouteGuardService, TagsService, PointsService]
})

export class ServicesModule {

}
