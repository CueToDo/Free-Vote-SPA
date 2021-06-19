// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ProfileComponent } from './profile/profile.component';
import { PointOfTheWeekVoteComponent } from './point-of-the-week-vote/point-of-the-week-vote.component';

const routes: Routes = [{ path: '', component: ProfileComponent }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FlexLayoutModule,
  ],
  declarations: [ProfileComponent, PointOfTheWeekVoteComponent],
})
export class MyModule {}
