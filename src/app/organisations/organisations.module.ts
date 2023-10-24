// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

// FreeVote Modules
import { BaseModule } from '../base/base.module';
import { CustomModule } from 'src/app/custommodule/custom.module';
import { IssuesModule } from 'src/app/issues/issues.module';
import { PublicModule } from 'src/app/public/public.module';

// Components not declared here - required in routes
import { IssueDetailsComponent } from 'src/app/issues/issue-details/issue-details.component';
import { PorqDetailsComponent } from 'src/app/issues/porq-details/porq-details.component';

// This module components
import { GroupEditComponent } from './group-edit/group-edit.component';
import { GroupComponent } from './group/group.component';
import { GroupsComponent } from './groups/groups.component';

import { OrganisationEditComponent } from './organisation-edit/organisation-edit.component';
import { OrganisationComponent } from './organisation/organisation.component';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';
import { OrganisationsComponent } from './organisations/organisations.component';

const orgRoutes: Routes = [
  { path: 'membership', component: OrganisationsComponent },
  { path: 'available', component: OrganisationsComponent },
  { path: 'new', component: OrganisationsComponent },

  { path: ':organisationName', component: OrganisationComponent },
  { path: ':organisationName/:groupName', component: GroupComponent },
  {
    path: ':organisationName/:groupName/:issue',
    component: IssueDetailsComponent
  },
  {
    path: ':organisationName/:groupName/:issue/:porqId',
    component: PorqDetailsComponent
  }
];

@NgModule({
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    RouterModule.forChild(orgRoutes),

    // Material
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,

    // FreeVote
    BaseModule,
    CustomModule,
    IssuesModule,
    PublicModule
  ],
  declarations: [
    GroupEditComponent,
    GroupComponent,
    GroupsComponent,

    OrganisationEditComponent,
    OrganisationComponent,
    OrganisationListComponent,
    OrganisationsComponent
  ]
})
export class OrganisationsModule {}
