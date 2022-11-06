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
import { MatDialogModule } from '@angular/material/dialog';
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
import { BaseModule } from '../base/base.module';
import { CustomModule } from '../custommodule/custom.module';
import { BreakOutGroupsModule } from '../breakoutgroups/break-out-groups.module';

// FreeVote Components Declared here
import { CardComponent } from './card/card.component';
import { CkeUniversalComponent } from './cke-universal/cke-universal.component';
import { HomeComponent } from './home/home.component';
import { NavBurgerComponent } from './nav-burger/nav-burger.component';
import { NavItemsComponent } from './nav-items/nav-items.component';
import { NavMainComponent } from './nav-main/nav-main.component';
import { PointComponent } from './point/point.component';
import { PointEditComponent } from './point-edit/point-edit.component';
import { PointOfTheWeekComponent } from './point-of-the-week/point-of-the-week.component';
import { PointsFilterComponent } from './points-filter/points-filter.component';
import { PointsListComponent } from './points-list/points-list.component';
import { QuestionComponent } from './question/question.component';
import { QuestionEditComponent } from './question-edit/question-edit.component';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { QuestionAnswersComponent } from './question-answers/question-answers.component';
import { TagsAndPointsComponent } from './tags-and-points/tags-and-points.component';
import { TagSearchComponent } from './tag-search/tag-search.component';
import { TakeActionComponent } from './take-action/take-action.component';
import { WebsitePreviewComponent } from './website-preview/website-preview.component';
import { PointCommentsComponent } from './point-comments/point-comments.component';
import { PointCommentComponent } from './point-comment/point-comment.component';

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    RouterModule,
    // Material
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    // FreeVote
    BaseModule,
    BreakOutGroupsModule,
    CustomModule
  ],
  declarations: [
    CallbackComponent,
    CardComponent,
    CkeUniversalComponent,
    HomeComponent,
    NavBurgerComponent,
    NavItemsComponent,
    NavMainComponent,
    PointComponent,
    PointEditComponent,
    PointsFilterComponent,
    PointsListComponent,
    PointOfTheWeekComponent,
    QuestionAnswersComponent,
    QuestionComponent,
    QuestionEditComponent,
    QuestionsListComponent,
    TagsAndPointsComponent,
    TagSearchComponent,
    TakeActionComponent,
    WebsitePreviewComponent,
    PointCommentsComponent,
    PointCommentComponent
  ],
  exports: [
    CkeUniversalComponent,
    NavItemsComponent,
    NavMainComponent,
    NavBurgerComponent,
    PointComponent,
    PointsFilterComponent,
    PointEditComponent,
    WebsitePreviewComponent
  ]
})
export class PublicModule {}
