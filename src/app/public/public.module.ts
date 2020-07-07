import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

// Auth0
import { CallbackComponent } from './callback/callback.component';

// CKEditor
import { CKEditorModule } from 'ng2-ckeditor';

// FreeVote Modules
import { CustomModule } from '../custommodule/custom.module';

// FreeVote Components
import { VotersMenuComponent } from './voters-menu/voters-menu.component';
import { HomeComponent } from './home/home.component';
import { PointComponent } from './point/point.component';
import { PointEditComponent } from './point-edit/point-edit.component';
import { TopicEditComponent } from './topic-edit/topic-edit.component';
import { PointOfTheWeekComponent } from './point-of-the-week/point-of-the-week.component';
import { PointsComponent } from './points/points.component';
import { ByComponent } from './by/by.component';
import { NavComponent } from './nav/nav.component';
import { TagsComponent } from './tags/tags.component';
import { TagsPointsComponent } from './tags-points/tags-points.component';
import { ListComponent } from './list/list.component';
import { ScrollerComponent } from './scroller/scroller.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    CKEditorModule,
    // FreeVote
    CustomModule
  ],
  declarations: [
    // Auth0
    CallbackComponent,
    // FreeVote
    VotersMenuComponent,
    HomeComponent,
    PointComponent,
    PointEditComponent,
    TopicEditComponent,
    PointOfTheWeekComponent,
    PointsComponent,
    ByComponent,
    NavComponent,
    TagsComponent,
    TagsPointsComponent,
    ListComponent,
    ScrollerComponent
  ],
  exports: [
    PointsComponent,
    NavComponent,
    ListComponent
  ]
})
export class PublicModule { }
