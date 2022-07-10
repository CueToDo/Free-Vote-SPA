// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// FreeVote
import { ConstituencyComponent } from './constituency/constituency.component';

const routes: Routes = [
  { path: ':constituency', component: ConstituencyComponent }
];

@NgModule({
  declarations: [ConstituencyComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class ConstituencyModule {}
