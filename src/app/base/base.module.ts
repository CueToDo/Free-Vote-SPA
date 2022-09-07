// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';

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
    FlexLayoutModule,
    FormsModule,
    RouterModule,
    // Material
    MatIconModule,
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
