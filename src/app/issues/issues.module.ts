// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Free Vote
import { CustomModule } from 'src/app/custommodule/custom.module';
import { PublicModule } from 'src/app/public/public.module';

// This module Components
import { IssueComponent } from 'src/app/issues/issue/issue.component';
import { IssueDetailsComponent } from 'src/app/issues/issue-details/issue-details.component';
import { IssueEditComponent } from 'src/app/issues/issue-edit/issue-edit.component';
import { ProgressComponent } from 'src/app/issues/progress/progress.component';

import { PorqComponent } from 'src/app/issues/porq/porq.component';
import { PorqDetailsComponent } from 'src/app/issues/porq-details/porq-details.component';
import { PorqEditComponent } from 'src/app/issues/porq-edit/porq-edit.component';

@NgModule({
  declarations: [
    IssueComponent,
    IssueDetailsComponent,
    IssueEditComponent,

    PorqComponent,
    PorqDetailsComponent,
    PorqEditComponent,

    ProgressComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    //Material
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatSliderModule,
    MatTooltipModule,

    // FreeVote
    CustomModule,
    PublicModule
  ],
  exports: [
    IssueComponent,
    IssueDetailsComponent,
    IssueEditComponent,

    PorqComponent,
    PorqDetailsComponent,
    PorqEditComponent,

    ProgressComponent
  ]
})
export class IssuesModule {}
