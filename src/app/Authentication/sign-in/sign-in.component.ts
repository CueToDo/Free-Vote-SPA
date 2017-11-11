import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { HttpClientService } from '../../services/http-client.service';
import 'rxjs/add/operator/map'; //https://stackoverflow.com/questions/34515173/angular-2-http-get-with-typescript-error-http-get-map-is-not-a-function-in

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  providers: [HttpClientService]
})
export class SignInComponent implements OnInit {

  private signInUrl = "http://freevote-002-site1.btempurl.com/authentication/signin";
  //private signInUrl = 'http://localhost:56529/authentication/signin';

  router: Router; //Why is this needed here?

  requestStatus: number;
  attemptsRemaining = 8;

  form: FormGroup;
  emailAddress = new FormControl("", Validators.required);
  password = new FormControl("");

  button: string;
  waiting: boolean = false;

  constructor(fb: FormBuilder, private httpClientService: HttpClientService, private _router: Router) {

    this.router = _router;

    this.form = fb.group({
      "emailAddress": this.emailAddress,
      "password": this.password
    });

  }

  ngOnInit() {
  }

  onSubmit() {
    console.log('submit');
    if (this.button == "signIn") {

      //debugger;

      let data = { "website": "free.vote", "email": this.emailAddress.value, "password": this.password.value };

      this.httpClientService
        .post(this.signInUrl, data)
        //.map(response => response.json()) not needed json assumed
        .subscribe(response => {

          //debugger;
          console.log('no debugger');
          this.waiting = false;

          let result: SignInData = <SignInData>response;
          console.log(result);

          this.requestStatus = result.SignInResult;

          //http://stackoverflow.com/questions/32896407/redirect-within-component-angular-2
          if (result.SignInResult == 30) {
            Cookie.set('JWT', result.JWT);
            this._router.navigateByUrl('trending');
          } else {
            this.attemptsRemaining = result.AttemptsRemaining;
          }
        },
        error => {
          console.log("Sign-In Error" + error) ;
        }

        );

    }
  }
}

class SignInData {
  public SignInResult: number;
  public AttemptsRemaining: number;
  public email: string;
  public VoterID: number;
  public SessionID: number;
  public roles: string[];
  public JWT: string;
}