import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
// import 'rxjs/add/operator/map'; //removed (angular 6)
// https://stackoverflow.com/questions/34515173/angular-2-http-get-with-typescript-error-http-get-map-is-not-a-function-in

import { SignInStatuses } from '../../models/enums';
import { CoreDataService } from '../../coreservices/coredata.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit, OnDestroy {

  email;
  password;

  signInStatusChange: Subscription;
  button: string;

  constructor(
    private router: Router,
    private coreDataService: CoreDataService) {

    this.coreDataService.SetPageTitle(this.router.url === '/sign-in' ? 'sign in' : 'join');
  }

  ngOnInit() {
  }

  ngOnDestroy() {

    // might leave page and destroy without calling onSubmit
    if (this.signInStatusChange !== undefined) {
      this.signInStatusChange.unsubscribe();
    }

  }

  onSubmit() {

    // Subscribe to the SignInStatus change
    this.signInStatusChange = this.coreDataService.GetSignInStatusChange().subscribe(
      signInStatus => {
        if (signInStatus === SignInStatuses.SignInSuccess) {
          this.router.navigateByUrl('trending');
        }
      }
    );


    // SignIn
    this.coreDataService.SignIn('free.vote', this.email, this.password);

  }
}


// https://blog.angular-university.io/how-to-build-angular2-apps-using-rxjs-observable-data-services-pitfalls-to-avoid/
