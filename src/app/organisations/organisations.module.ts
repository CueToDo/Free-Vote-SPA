// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// FreeVote Modules
import { BaseModule } from '../base/base.module';
import { CustomModule } from 'src/app/custommodule/custom.module';
import { PublicModule } from 'src/app/public/public.module';

// Components not declared here - required in routes

// This module components
import { OrganisationEditComponent } from './organisation-edit/organisation-edit.component';
import { OrganisationComponent } from './organisation/organisation.component';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';
import { OrganisationsComponent } from './organisations/organisations.component';

const orgRoutes: Routes = [
  { path: 'membership', component: OrganisationsComponent },
  { path: 'available', component: OrganisationsComponent },
  { path: 'new', component: OrganisationsComponent },
  { path: ':organisationSlug', component: OrganisationComponent }
];

@NgModule({
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    RouterModule.forChild(orgRoutes),

    // Material
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTooltipModule,

    // FreeVote
    BaseModule,
    CustomModule,
    PublicModule
  ],
  declarations: [
    OrganisationEditComponent,
    OrganisationComponent,
    OrganisationListComponent,
    OrganisationsComponent
  ]
})
export class OrganisationsModule {}
