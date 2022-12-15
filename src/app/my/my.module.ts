// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

// Components
import { ProfileComponent } from './profile/profile.component';
import { DeleteAccountComponent } from '../my/delete-account/delete-account.component';
import { PointOfTheWeekVoteComponent } from './point-of-the-week-vote/point-of-the-week-vote.component';

// FreeVote
import { CustomModule } from '../custommodule/custom.module';
import { PublicModule } from '../public/public.module';

const myRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent
  },
  { path: ':tab', component: ProfileComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(myRoutes),
    // Material
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    // FreeVote
    CustomModule,
    PublicModule
  ],
  declarations: [
    ProfileComponent,
    DeleteAccountComponent,
    PointOfTheWeekVoteComponent
  ]
})
export class MyModule {}
