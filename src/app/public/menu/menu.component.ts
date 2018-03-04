import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

import { CoreDataService } from '../../services/coredata.service';
import { AuthenticationService, SignInStatus } from '../../services/authentication.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private coreDataService: CoreDataService, private authenticationService: AuthenticationService) {
    console.log("MENU constructor");
  }

  //ToDo TagURLs
  TagURLs: string[] = ['/trending', '/private/following-tags'];
  PostURLs: string[] = ['/private/favourite-posts', '/private/my-posts', '/post-of-the-week', '/private/post-of-the-week-vote'];

  private routeChangeSubscription: any;
  private SelectedTag: string = 'any-old-baguette';
  public SignInStatus = SignInStatus;

  SignedIn(): boolean {
    let signedIn = this.authenticationService.SignInData.SignInResult == SignInStatus.SignInSuccess
    //console.log('Menu Component Sign In Check: ' + signedIn);
    return signedIn;
  }


  isActive(link): boolean {
    //console.log(this.SelectedTag + ' ' + this.activatedRoute.url);
    switch (link) {
      case "tags": {
        return this.TagURLs.indexOf(this.router.url) > -1 || this.SelectedTag == this.router.url.replace('/', '');
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
    console.log('MENU onInit');
    //https://angular-2-training-book.rangle.io/handout/routing/routeparams.html
    //https://stackoverflow.com/questions/37144999/angular2-get-router-params-outside-of-router-outlet

    this.routeChangeSubscription = this.activatedRoute.params.subscribe(params => {
      console.log('menu component ROUTE CHANGED');
      if (params['tag'] && params['tag'] != '') {
        this.SelectedTag = params['tag'];
        console.log('CHANGING' + this.SelectedTag);
      }
    });
  }

  ngOnDestroy() {
    this.routeChangeSubscription.unsubscribe();
  }

} 