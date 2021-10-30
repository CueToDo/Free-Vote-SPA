// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Modules
import { PublicModule } from 'src/app/public/public.module';
import { CustomModule } from 'src/app/custommodule/custom.module';

// Components not declared here
import { TagsAndPointsComponent } from '../public/tags-and-points/tags-and-points.component';

// This module Components
import { ProgressComponent } from './progress/progress.component';

import { PorqEditComponent } from './porq-edit/porq-edit.component';
import { PorqComponent } from './porq/porq.component';
import { PorqDetailsComponent } from './porq-details/porq-details.component';

import { IssueEditComponent } from './issue-edit/issue-edit.component';
import { IssueComponent } from './issue/issue.component';
import { IssueDetailsComponent } from './issue-details/issue-details.component';

import { GroupEditComponent } from './group-edit/group-edit.component';
import { GroupComponent } from './group/group.component';
import { GroupsComponent } from './groups/groups.component';

import { OrganisationEditComponent } from './organisation-edit/organisation-edit.component';
import { OrganisationComponent } from './organisation/organisation.component';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';
import { OrganisationsComponent } from './organisations/organisations.component';

const routes: Routes = [
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
  },
  // This can't work
  { path: ':group/:tag', component: TagsAndPointsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    // Material
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatTooltipModule,
    // FreeVote
    PublicModule,
    CustomModule
  ],
  declarations: [
    ProgressComponent,

    PorqEditComponent,
    PorqComponent,
    PorqDetailsComponent,

    IssueEditComponent,
    IssueComponent,
    IssueDetailsComponent,

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
