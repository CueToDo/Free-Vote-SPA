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
import { GroupsComponent } from './groups/groups.component';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupComponent } from './group/group.component';
import { GroupEditComponent } from './group-edit/group-edit.component';
import { SubGroupComponent } from './sub-group/sub-group.component';
import { SubGroupEditComponent } from './sub-group-edit/sub-group-edit.component';
import { IssueComponent } from './issue/issue.component';
import { IssueEditComponent } from './issue-edit/issue-edit.component';
import { ProgressComponent } from './progress/progress.component';
import { IssueDetailsComponent } from './issue-details/issue-details.component';
import { PorqComponent } from './porq/porq.component';
import { PorqEditComponent } from './porq-edit/porq-edit.component';
import { PorqDetailsComponent } from './porq-details/porq-details.component';

const routes: Routes = [
  { path: ':tab', component: GroupsComponent },
  { path: 'view/:groupName', component: GroupComponent },
  { path: ':groupName/:subGroupName', component: SubGroupComponent },
  { path: ':groupName/:subGroupName/:issue', component: IssueDetailsComponent },
  { path: ':groupName/:subGroupName/:issue/:porqId', component: PorqDetailsComponent }
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
    GroupsComponent,
    GroupListComponent,
    GroupComponent,
    GroupEditComponent,
    SubGroupComponent,
    SubGroupEditComponent,
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
