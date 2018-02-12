import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//import { HttpClientService } from '../../services/http-client.service';
import { AuthenticationService, SignInStatus } from '../../services/authentication.service';
import 'rxjs/add/operator/map'; //https://stackoverflow.com/questions/34515173/angular-2-http-get-with-typescript-error-http-get-map-is-not-a-function-in


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit, OnDestroy {

  router: Router; //Router is injected to navigateByUrl after signIn

  form: FormGroup;
  emailAddress = new FormControl("", Validators.required);
  password = new FormControl("");

  button: string;
  waiting: boolean = false;

  constructor(private formBuilder: FormBuilder, private _router: Router, private authenticationService: AuthenticationService) {

    this.router = _router;

    this.form = formBuilder.group({
      "emailAddress": this.emailAddress,
      "password": this.password
    });

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.authenticationService.SignInStatusChange.unsubscribe();
  }

  SignInStatusChange() {

    console.log('changed ' + this.authenticationService.SignInData.SignInResult);
    
    if (this.authenticationService.SignInData.SignInResult  == SignInStatus.SignInSuccess) {
      this._router.navigateByUrl('trending'); 
    }
  }

  onSubmit() {
    console.log('submit');
    if (this.button == "signIn") {

      //debugger;

      //just tell me something changed???
      this.authenticationService.SignInStatusChange.subscribe(
        () => this.SignInStatusChange()
      )

      this.authenticationService.SignIn("free.vote", this.emailAddress.value, this.password.value);
      // .subscribe(response => {

      //   //debugger;
      //   console.log('no debugger');
      //   this.waiting = false;

      //   //http://stackoverflow.com/questions/32896407/redirect-within-component-angular-2
      //   if (result.SignInResult == 30) {
      //     Cookie.set('JWT', result.JWT);
      //     this._router.navigateByUrl('trending');
      //   } else {
      //     this.attemptsRemaining = result.AttemptsRemaining;
      //   }
      // },
      // error => {
      //   console.log("Sign-In Error" + error);
      // }

      // );

    }
  }
}


//https://blog.angular-university.io/how-to-build-angular2-apps-using-rxjs-observable-data-services-pitfalls-to-avoid/