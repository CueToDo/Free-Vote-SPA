// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';

// FreeVote Modules
import { BaseModule } from '../base/base.module';
import { CustomModule } from '../custommodule/custom.module';
import { BreakOutGroupsModule } from '../breakoutgroups/break-out-groups.module';

// FreeVote Components Declared here
import { CardComponent } from './card/card.component';
import { CkeUniversalComponent } from './cke-universal/cke-universal.component';
import { HomeComponent } from './home/home.component';
import { NavBurgerComponent } from './menus/nav-burger/nav-burger.component';
import { NavItemsComponent } from './menus/nav-items/nav-items.component';
import { NavMainComponent } from './menus/nav-main/nav-main.component';
import { PointCommandsComponent } from './menus/point-commands/point-commands.component';
import { PointCommentsComponent } from './point-comments/point-comments.component';
import { PointComponent } from './point/point.component';
import { PointEditComponent } from './point-edit/point-edit.component';
import { PointOfTheWeekComponent } from './point-of-the-week/point-of-the-week.component';
import { PointsFilterComponent } from './points-filter/points-filter.component';
import { PointsListComponent } from './points-list/points-list.component';
import { PointTypesComponent } from './menus/point-types/point-types.component';
import { QuestionComponent } from './question/question.component';
import { QuestionEditComponent } from './question-edit/question-edit.component';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { QuestionAnswersComponent } from './question-answers/question-answers.component';
import { SearchAndSortComponent } from './menus/search-and-sort/search-and-sort.component';
import { SocialShareComponent } from './menus/social-share/social-share.component';
import { TagsAndPointsComponent } from './tags-and-points/tags-and-points.component';
import { TagSearchComponent } from './tag-search/tag-search.component';
import { TakeActionComponent } from './take-action/take-action.component';
import { WebsitePreviewComponent } from './website-preview/website-preview.component';

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
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
    MatTooltipModule,
    // FreeVote
    BaseModule,
    BreakOutGroupsModule,
    CustomModule
  ],
  declarations: [
    CardComponent,
    CkeUniversalComponent,
    HomeComponent,
    NavBurgerComponent,
    NavItemsComponent,
    NavMainComponent,
    PointCommandsComponent,
    PointCommentsComponent,
    PointComponent,
    PointEditComponent,
    PointsFilterComponent,
    PointsListComponent,
    PointOfTheWeekComponent,
    PointTypesComponent,
    QuestionAnswersComponent,
    QuestionComponent,
    QuestionEditComponent,
    QuestionsListComponent,
    SearchAndSortComponent,
    SocialShareComponent,
    TagsAndPointsComponent,
    TagSearchComponent,
    TakeActionComponent,
    WebsitePreviewComponent
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
