import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Routes, RouterModule } from "@angular/router"

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';

import { FacebookModule } from 'ngx-facebook';
import { FBTestComponent } from './fbtest/fbtest.component';
import { HomeComponent } from './home/home.component';
import { TrendingComponent } from './QuickPosts/trending/trending.component';
import { SignInComponent } from './Authentication/sign-in/sign-in.component';
import { SelectedTagsComponent } from './QuickPosts/selected-tags/selected-tags.component';
import { SelectedTagComponent } from './QuickPosts/selected-tag/selected-tag.component';
import { MyPostsComponent } from './QuickPosts/my-posts/my-posts.component';
import { NewPostComponent } from './QuickPosts/new-post/new-post.component';
import { FavouritePostsComponent } from './QuickPosts/favourite-posts/favourite-posts.component';
import { PostOfTheWeekComponent } from './QuickPosts/post-of-the-week/post-of-the-week.component';
import { PostOfTheWeekVoteComponent } from './QuickPosts/post-of-the-week-vote/post-of-the-week-vote.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'join', component: SignInComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'trending', component: TrendingComponent },
  { path: 'selected', component: SelectedTagsComponent },
  { path: 'tag', component: SelectedTagComponent },
  { path: 'my-posts', component: MyPostsComponent },
  { path: 'new-post', component: NewPostComponent },
  { path: 'favourite-posts', component: FavouritePostsComponent },
  { path: 'post-of-the-week', component: PostOfTheWeekComponent },
  { path: 'post-of-the-week-vote', component: PostOfTheWeekVoteComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    FBTestComponent,
    HomeComponent,
    TrendingComponent,
    SignInComponent,
    SelectedTagsComponent,
    SelectedTagComponent,
    MyPostsComponent,
    NewPostComponent,
    FavouritePostsComponent,
    PostOfTheWeekComponent,
    PostOfTheWeekVoteComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    FacebookModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
