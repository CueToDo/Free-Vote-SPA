import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule /*ReactiveFormsModule*/ } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// Bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'; /* Bootstrap dropdowns */

// CKEditor
import { CKEditorModule } from 'ng2-ckeditor';

// Components
import { TagsComponent } from './tags/tags.component';
import { PointsComponent } from './points/points.component';
import { PointComponent } from './point/point.component';
import { PointEditComponent } from './point-edit/point-edit.component';

// Pipes
import { TagDisplayPipe } from './pipes/tag-display.pipe';
import { NbspPipe } from './pipes/nbsp.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // ReactiveFormsModule,
    RouterModule,
    CKEditorModule,
    BsDropdownModule // https://stackoverflow.com/questions/47874840/how-to-inject-ngx-bootstrap-modules-into-child-module-angular-4
  ],
  declarations: [
    TagsComponent,
    PointComponent,
    PointsComponent,
    PointEditComponent,
    TagDisplayPipe,
    NbspPipe
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


