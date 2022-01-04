// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

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
import { TagSearchComponent } from './tag-search/tag-search.component';
import { WebsitePreviewComponent } from './website-preview/website-preview.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ClipboardModule,
    FlexLayoutModule,
    MatCheckboxModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    // FreeVote
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
    PointShareComponent,
    TagSearchComponent,
    WebsitePreviewComponent
  ],
  exports: [
    PointComponent,
    PointsComponent,
    PointEditComponent,
    NavItemsComponent,
    NavMainComponent,
    NavBurgerComponent,
    ListComponent,
    CkeUniversalComponent,
    WebsitePreviewComponent
  ]
})
export class PublicModule {}
