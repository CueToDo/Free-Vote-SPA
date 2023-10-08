// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Free Vote Modules
import { CustomModule } from '../custommodule/custom.module';

// Free Vote
import { ByComponent } from 'src/app/base/by/by.component';
import { ListComponent } from 'src/app/base/list/list.component';
import { TagCloudComponent } from 'src/app/base/tagCloud/tagCloud.component';
import { TagsEditComponent } from 'src/app/base/tags-edit/tags-edit.component';

@NgModule({
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    RouterModule,
    // Material
    MatIconModule,
    MatTooltipModule,
    // Free Vote
    CustomModule
  ],
  declarations: [
    ByComponent,
    ListComponent,
    TagCloudComponent,
    TagsEditComponent
  ],
  exports: [ByComponent, ListComponent, TagCloudComponent, TagsEditComponent]
})
export class BaseModule {}
