//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, ParamMap, ActivatedRouteSnapshot } from "@angular/router"

//Components
import { FavouritePostsComponent } from './favourite-posts/favourite-posts.component';
import { FollowingTagsComponent } from './following-tags/following-tags.component';
import { MyPostsComponent } from './my-posts/my-posts.component';
import { NewPostComponent } from './new-post/new-post.component';
import { PostOfTheWeekVoteComponent } from './post-of-the-week-vote/post-of-the-week-vote.component';

//Services
import { LoginRouteGuard } from '../services/login-route-guard';

const privateRoutes: Routes = [
  { path: 'following-tags', component: FollowingTagsComponent, canActivate: [LoginRouteGuard] },
  { path: 'favourite-posts', component: FavouritePostsComponent, canActivate: [LoginRouteGuard] },
  { path: 'my-posts', component: MyPostsComponent, canActivate: [LoginRouteGuard] },
  { path: 'post-of-the-week-vote', component: PostOfTheWeekVoteComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(privateRoutes)
  ],
  declarations: [
    FollowingTagsComponent,
    FavouritePostsComponent,
    MyPostsComponent,
    NewPostComponent,
    PostOfTheWeekVoteComponent
  ],
  providers: [LoginRouteGuard]
})

export class PrivateModule { }
