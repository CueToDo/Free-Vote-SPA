// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

// Components
import { GroupSelectionComponent } from './group-selection/group-selection.component';
import { GroupDiscussionComponent } from './group-discussion/group-discussion.component';

@NgModule({
  declarations: [GroupSelectionComponent, GroupDiscussionComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    RouterModule
  ],
  exports: [GroupSelectionComponent, GroupDiscussionComponent]
})
export class BreakOutGroupsModule {}
