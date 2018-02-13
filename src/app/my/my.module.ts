//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, ParamMap, ActivatedRouteSnapshot } from "@angular/router"

//Components
import { MyPostsComponent } from './myposts/myposts.component';
import { FavouritePostsComponent } from './favourite-posts/favourite-posts.component';
import { FollowingTagsComponent } from './following-tags/following-tags.component';
import { NewPostComponent } from './new-post/new-post.component';
import { PostOfTheWeekVoteComponent } from './post-of-the-week-vote/post-of-the-week-vote.component';

//Services
import { LoginRouteGuardService } from '../services/login-route-guard.service';
//import { AuthenticationService } from '../services/authentication.service';

//Private Module Routes
const privateRoutes: Routes = [
  { path: 'following-tags', component: FollowingTagsComponent, canActivate: [LoginRouteGuardService] },
  { path: 'favourite-posts', component: FavouritePostsComponent, canActivate: [LoginRouteGuardService] },
  { path: 'post-of-the-week-vote', component: PostOfTheWeekVoteComponent, canActivate: [LoginRouteGuardService] },
  { path: 'posts', component: MyPostsComponent, canActivate: [LoginRouteGuardService] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(privateRoutes)
  ],
  declarations: [
    MyPostsComponent,
    FollowingTagsComponent,
    FavouritePostsComponent,
    NewPostComponent,
    PostOfTheWeekVoteComponent
  ]
  //providers: [LoginRouteGuardService] //YOU BASTARD AuthenticationService There's the separate instance
})

export class MyModule { }
