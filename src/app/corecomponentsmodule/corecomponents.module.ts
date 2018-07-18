import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule /*ReactiveFormsModule*/ } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// CKEditor
import { CKEditorModule } from 'ng2-ckeditor';

import { TagsComponent } from './tags/tags.component';
import { PointsComponent } from './points/points.component';
import { PointComponent } from './point/point.component';
import { PointEditComponent } from './point-edit/point-edit.component';

// Pipes
import { TagDisplayPipe } from '../coreservices/tag-display.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // ReactiveFormsModule,
    RouterModule,
    CKEditorModule
  ],
  declarations: [
    TagsComponent,
    PointComponent,
    PointsComponent,
    PointEditComponent,
    TagDisplayPipe
  ],
  providers: [],
  exports: [
    PointsComponent,
    PointComponent,
    PointEditComponent
  ]
})
export class CoreComponentsModule {

}


