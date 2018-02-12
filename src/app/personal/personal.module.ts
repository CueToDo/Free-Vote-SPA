import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details/details.component'
import { LocationComponent } from './location/location.component';

import { Routes, RouterModule } from '@angular/router';
import { GroupMembershipComponent } from './group-membership/group-membership.component';

const routes: Routes = [
  { path: 'details', component: DetailsComponent },
  { path: 'location', component: LocationComponent },
  { path: 'group-membership', component: GroupMembershipComponent }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DetailsComponent, LocationComponent, GroupMembershipComponent]
})
export class PersonalModule { }
