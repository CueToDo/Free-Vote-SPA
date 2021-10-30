// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

// Components
import { ProfileComponent } from './profile/profile.component';
import { DeleteAccountComponent } from '../my/delete-account/delete-account.component';
import { PointOfTheWeekVoteComponent } from './point-of-the-week-vote/point-of-the-week-vote.component';

// FreeVote
import { PublicModule } from '../public/public.module';

const routes: Routes = [{ path: '', component: ProfileComponent }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    // Material
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    // FreeVote
    PublicModule
  ],
  declarations: [
    ProfileComponent,
    DeleteAccountComponent,
    PointOfTheWeekVoteComponent
  ]
})
export class MyModule {}
