// Angular
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Material
import { MatButtonModule } from '@angular/material/button';
// import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
// import { MatTooltipModule } from '@angular/material/tooltip';

// FreeVote Modules
import { BaseModule } from '../base/base.module';

// FreeVote
import { ConstituencyComponent } from './constituency/constituency.component';
import { LocalMenuComponent } from './local-menu/local-menu.component';
import { LocalTagsComponent } from './local-tags/local-tags.component';

// Services: if decorated with "providedIn", no need to import and must NOT add to providers
// Only need to import LoginRouteGuardService as it's used in appRoots declaration
import { LoginRouteGuardService } from '../services/login-route-guard.service';

const localRoutes: Routes = [
  {
    path: 'voters',
    component: LocalMenuComponent,
    canActivate: [LoginRouteGuardService],
    children: [
      {
        path: ':alias',
        component: LocalMenuComponent
      }
    ]
  },
  { path: ':constituency', component: LocalMenuComponent }
];

@NgModule({
  declarations: [ConstituencyComponent, LocalMenuComponent, LocalTagsComponent],
  imports: [
    // Angular
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild(localRoutes),
    // Material
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTabsModule,

    // Free Vote
    BaseModule
  ],
  exports: [LocalTagsComponent]
})
export class LocalModule {}
