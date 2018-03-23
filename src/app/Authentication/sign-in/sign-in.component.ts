import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map'; //https://stackoverflow.com/questions/34515173/angular-2-http-get-with-typescript-error-http-get-map-is-not-a-function-in

//import { HttpClientService } from '../../services/http-client.service';
import { AuthenticationService } from '../../services/authentication.service';
import { SignInStatus } from '../../services/coredata.service';
import { CoreDataService } from '../../services/coredata.service';

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

  constructor(private formBuilder: FormBuilder,
    private _router: Router,
    private authenticationService: AuthenticationService,
    private coreDataService: CoreDataService) {

    this.router = _router;

    this.coreDataService.SetPageTitle(this.router.url === '/sign-in' ? 'sign in' : 'join');
    
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



  onSubmit() {
    console.log('submit');
    if (this.button == "signIn") {

      //just tell me something changed???
      this.authenticationService.SignInStatusChange.subscribe(
        (signInData) => {

          if (signInData.SignInStatus == SignInStatus.SignInSuccess) {
            this._router.navigateByUrl('trending');
          }
        }
      )

      this.authenticationService.SignIn("free.vote", this.emailAddress.value, this.password.value);

    }
  }
}


//https://blog.angular-university.io/how-to-build-angular2-apps-using-rxjs-observable-data-services-pitfalls-to-avoid/