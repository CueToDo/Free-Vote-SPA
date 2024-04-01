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
import { PointCreateNewComponent } from './point-create-new/point-create-new.component';
import { PointEditComponent } from './point-edit/point-edit.component';
import { PointOfTheWeekComponent } from './point-of-the-week/point-of-the-week.component';
import { PointsFilterComponent } from './points-filter/points-filter.component';
import { PointsListComponent } from './points-list/points-list.component';
import { PointTypesComponent } from './menus/point-types/point-types.component';
import { QuestionComponent } from './question/question.component';
import { QuestionCreateNewComponent } from './question-create-new/question-create-new.component';
import { QuestionEditComponent } from './question-edit/question-edit.component';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { QuestionAnswersComponent } from './question-answers/question-answers.component';
import { SortMenuComponent } from './menus/sort-menu/sort-menu.component';
import { SocialShareComponent } from './menus/social-share/social-share.component';
import { TagsAndPointsComponent } from './tags-and-points/tags-and-points.component';
import { TakeActionComponent } from './take-action/take-action.component';
import { WebsitePreviewComponent } from './website-preview/website-preview.component';
import { NbspPipe } from '../custommodule/pipes/nbsp.pipe';
import { SafeURLPipe } from '../custommodule/pipes/safe-url.pipe';
import { SafeHtmlPipe } from '../custommodule/pipes/safe-html.pipe';
import { TagCloudComponent } from '../base/tagCloud/tagCloud.component';
import { TagsEditComponent } from '../base/tags-edit/tags-edit.component';

@NgModule({
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
    PointCreateNewComponent,
    PointEditComponent,
    PointsFilterComponent,
    PointsListComponent,
    PointOfTheWeekComponent,
    PointTypesComponent,
    QuestionAnswersComponent,
    QuestionComponent,
    QuestionCreateNewComponent,
    QuestionEditComponent,
    QuestionsListComponent,
    SortMenuComponent,
    SocialShareComponent,
    TagsAndPointsComponent,
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
  ],
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
    NbspPipe,
    SafeURLPipe,
    SafeHtmlPipe,
    TagCloudComponent,
    TagsEditComponent
  ]
})
export class PublicModule {}
