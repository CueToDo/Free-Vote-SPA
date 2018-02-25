import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PointsComponent } from './points/points.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    PointsComponent
  ],
  exports: [
    PointsComponent
     //CommonModule
     //FormsModule
     //ReactiveFormsModule
  ]
})
export class CoreModule { }
