import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { TagsComponent } from './tags/tags.component';
import { PointComponent } from './point/point.component';
import { PointsComponent } from './points/points.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    TagsComponent,
    PointComponent,
    PointsComponent
  ],
  providers: [],
  exports: [
    PointComponent,
    PointsComponent
  ]
})
export class CoreComponentsModule {

}
