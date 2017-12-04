import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details/details.component'
import { LocationComponent } from './location/location.component';

import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'details', component: DetailsComponent },
  { path: 'location', component: LocationComponent }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DetailsComponent, LocationComponent]
})
export class PersonalModule { }
