import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// import 'rxjs/add/operator/map'; //removed (angular 6)
// https://stackoverflow.com/questions/34515173/angular-2-http-get-with-typescript-error-http-get-map-is-not-a-function-in

// import { HttpClientService } from '../../services/http-client.service';
import { AuthenticationService } from '../../coreservices/authentication.service';
import { SignInStatuses } from '../../models/enums';
import { CoreDataService } from '../../coreservices/coredata.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit, OnDestroy {

  form: FormGroup;
  emailAddress = new FormControl('', Validators.required);
  password = new FormControl('');

  signInStatusChange: Subscription;
  button: string;
  waiting = false;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private coreDataService: CoreDataService) {

    this.coreDataService.SetPageTitle(this.router.url === '/sign-in' ? 'sign in' : 'join');

    this.form = formBuilder.group({
      'emailAddress': this.emailAddress,
      'password': this.password
    });

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    console.log('destroying');
    this.signInStatusChange.unsubscribe();
  }



  onSubmit() {

    console.log('submit');

    // just tell me something changed???
    this.signInStatusChange = this.authenticationService.GetSignInStatusChange().subscribe(
      signInStatus => {
        if (signInStatus === SignInStatuses.SignInSuccess) {
          this.router.navigateByUrl('trending');
        }
      }
    );

    this.authenticationService.SignIn('free.vote', this.emailAddress.value, this.password.value);

  }
}


// https://blog.angular-university.io/how-to-build-angular2-apps-using-rxjs-observable-data-services-pitfalls-to-avoid/
