// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MaterialModule } from '../material/material.module';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Auth0
import { CallbackComponent } from './callback/callback.component';

// FreeVote Modules
import { CustomModule } from '../custommodule/custom.module';

// FreeVote Components
import { HomeComponent } from './home/home.component';
import { CardComponent } from './card/card.component';
import { TakeActionComponent } from './take-action/take-action.component';
import { PointComponent } from './point/point.component';
import { PointEditComponent } from './point-edit/point-edit.component';
import { TopicEditComponent } from './topic-edit/topic-edit.component';
import { PointOfTheWeekComponent } from './point-of-the-week/point-of-the-week.component';
import { PointsComponent } from './points/points.component';
import { ByComponent } from './by/by.component';
import { NavItemsComponent } from './nav-items/nav-items.component';
import { NavMainComponent } from './nav-main/nav-main.component';
import { NavBurgerComponent } from './nav-burger/nav-burger.component';
import { TagsComponent } from './tags/tags.component';
import { TagsAndPointsComponent } from './tags-and-points/tags-and-points.component';
import { VotersMenuComponent } from './voters-menu/voters-menu.component';
import { ListComponent } from './list/list.component';
import { ScrollerComponent } from './scroller/scroller.component';
import { PointsListComponent } from './points-list/points-list.component';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { QuestionEditComponent } from './question-edit/question-edit.component';
import { QuestionComponent } from './question/question.component';
import { QuestionAnswersComponent } from './question-answers/question-answers.component';
import { CkeUniversalComponent } from './cke-universal/cke-universal.component';
import { PointShareComponent } from './point-share/point-share.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    ClipboardModule,
    FlexLayoutModule,
    CustomModule
  ],
  declarations: [
    // Auth0
    CallbackComponent,
    VotersMenuComponent,
    HomeComponent,
    CardComponent,
    TakeActionComponent,
    PointComponent,
    PointEditComponent,
    TopicEditComponent,
    PointOfTheWeekComponent,
    PointsComponent,
    ByComponent,
    NavItemsComponent,
    NavMainComponent,
    NavBurgerComponent,
    TagsComponent,
    TagsAndPointsComponent,
    ListComponent,
    ScrollerComponent,
    PointsListComponent,
    QuestionsListComponent,
    QuestionEditComponent,
    QuestionComponent,
    QuestionAnswersComponent,
    CkeUniversalComponent,
    PointShareComponent
  ],
  exports: [
    PointComponent,
    PointsComponent,
    PointEditComponent,
    NavItemsComponent,
    NavMainComponent,
    NavBurgerComponent,
    ListComponent,
    CkeUniversalComponent
  ]
})
export class PublicModule {}
