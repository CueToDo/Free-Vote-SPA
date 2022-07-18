// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Material
// import { MatButtonModule } from '@angular/material/button';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
// import { MatTooltipModule } from '@angular/material/tooltip';

// FreeVote Modules
import { PublicModule } from '../public/public.module';

// FreeVote
import { LocalMenuComponent } from './local-menu/local-menu.component';
import { ConstituencyComponent } from './constituency/constituency.component';

// Services: if decorated with "providedIn", no need to import and must NOT add to providers
// Only need to import LoginRouteGuardService as it's used in appRoots declaration
import { LoginRouteGuardService } from '../services/login-route-guard.service';

const routes: Routes = [
  {
    path: 'voters',
    component: LocalMenuComponent,
    canActivate: [LoginRouteGuardService]
  },
  {
    path: 'voters/:alias',
    component: LocalMenuComponent,
    canActivate: [LoginRouteGuardService]
  },
  { path: ':constituency', component: LocalMenuComponent }
];

@NgModule({
  declarations: [ConstituencyComponent, LocalMenuComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    PublicModule,
    RouterModule.forChild(routes)
  ]
})
export class LocalModule {}
