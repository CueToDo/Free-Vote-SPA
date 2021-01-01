// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MaterialModule } from '../material.module';

// CKEditor
import { CKEditorModule } from 'ng2-ckeditor';

// Modules
import { PublicModule } from 'src/app/public/public.module';
import { CustomModule } from 'src/app/custommodule/custom.module';


// This module Components
import { OrganisationsComponent } from './organisations/organisations.component';
import { OrganisationListComponent } from './organisation-list/organisation-list.component';
import { OrganisationComponent } from './organisation/organisation.component';
import { OrganisationEditComponent } from './organisation-edit/organisation-edit.component';
import { GroupsComponent } from './group/groups.component';
import { GroupComponent } from './group/group.component';
import { GroupEditComponent } from './group-edit/group-edit.component';
import { IssueComponent } from './issue/issue.component';
import { IssueEditComponent } from './issue-edit/issue-edit.component';
import { ProgressComponent } from './progress/progress.component';
import { IssueDetailsComponent } from './issue-details/issue-details.component';
import { PorqComponent } from './porq/porq.component';
import { PorqEditComponent } from './porq-edit/porq-edit.component';
import { PorqDetailsComponent } from './porq-details/porq-details.component';
import { TagsPointsComponent } from '../public/tags-points/tags-points.component';

const routes: Routes = [
  { path: 'membership', component: OrganisationsComponent },
  { path: 'available', component: OrganisationsComponent },
  { path: 'new', component: OrganisationsComponent },
  { path: ':organisationName', component: OrganisationComponent },
  { path: ':organisationName/:subGroupName', component: GroupComponent },
  { path: ':organisationName/:subGroupName/:issue', component: IssueDetailsComponent },
  { path: ':organisationName/:subGroupName/:issue/:porqId', component: PorqDetailsComponent },
  // This can't work
  { path: ':group/:tag', component: TagsPointsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    MaterialModule,
    CKEditorModule,
    PublicModule,
    CustomModule
  ],
  declarations: [
    OrganisationsComponent,
    OrganisationListComponent,
    OrganisationComponent,
    OrganisationEditComponent,
    // GroupsComponent,
    GroupComponent,
    GroupEditComponent,
    IssueComponent,
    IssueEditComponent,
    ProgressComponent,
    IssueDetailsComponent,
    PorqComponent,
    PorqEditComponent,
    PorqDetailsComponent
  ]
})
export class GroupsModule { }
