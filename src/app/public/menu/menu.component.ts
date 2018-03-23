import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

import { CoreDataService, SignInStatus } from '../../services/coredata.service';
import { HttpClientService } from '../../services/http-client.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private coreDataService: CoreDataService, private httpClientService: HttpClientService) {
  }

  //ToDo TagURLs
  TagURLs: string[] = ['/trending', '/private/following-tags'];
  PostURLs: string[] = ['/private/favourite-posts', '/private/my-posts', '/post-of-the-week', '/private/post-of-the-week-vote'];

  private tagChangeSubscription: any;
  private selectedTag: string = '';
  public SignInStatus = SignInStatus;

  SignedIn(): boolean {
    let signedIn = this.coreDataService.SignInData.SignInStatus == SignInStatus.SignInSuccess
    //console.log('Menu Component Sign In Check: ' + signedIn);
    return signedIn;
  }


  isActive(link): boolean {
    //console.log(this.SelectedTag + ' ' + this.activatedRoute.url);
    switch (link) {
      case "tags": {
        return this.TagURLs.indexOf(this.router.url) > -1 || this.selectedTag == this.router.url.replace('/', '');
      }
      case "posts": {
        return this.PostURLs.indexOf(this.router.url) > -1;
      }
      default: {
        return link == this.router.url;
      }
    }
  }

  ngOnInit() {
    //https://angular-2-training-book.rangle.io/handout/routing/routeparams.html
    //https://stackoverflow.com/questions/37144999/angular2-get-router-params-outside-of-router-outlet

    this.tagChangeSubscription = this.coreDataService.GetTagDisplay()
      .subscribe(tagDisplay => {
        this.selectedTag = tagDisplay;
      });
  }

  ngOnDestroy() {
    this.tagChangeSubscription.unsubscribe();
  }

} 