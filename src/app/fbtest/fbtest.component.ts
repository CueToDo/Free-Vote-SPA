import { Component, OnInit } from '@angular/core';
// import { FacebookService, InitParams, LoginResponse, LoginOptions } from 'ngx-facebook';

@Component({
  selector: 'app-fbtest',
  templateUrl: './fbtest.component.html',
  styleUrls: ['./fbtest.component.css']
})
export class FBTestComponent implements OnInit {


  connectedFB = false;

  constructor() {

  //   let initParams: InitParams = {
  //     appId: '1114396292039346',
  //     xfbml: true,
  //     version: 'v2.8'
  //   }

  //   fb.init(initParams);

  // }

  // loginWithFacebook(): void {
  //   this.fb.login()
  //     .then((response: LoginResponse) => console.log(response))
  //     .catch((error: any) => console.error(error))
  // }

  // loginWithOptions() {

  //   const loginOptions: LoginOptions = {
  //     enable_profile_selector: true,
  //     return_scopes: true,
  //     scope: 'email'
  //   };

  //   this.fb.login(loginOptions)
  //     .then((res: LoginResponse) => {
  //       console.log('Logged in:', res.authResponse);
  //     })
  //     .catch(this.handleError);

  }

  ngOnInit() {
    // this.isConnected();
  }

  // isConnected() {

  //   this.fb.getLoginStatus()
  //     .then((response) => {
  //       this.connectedFB = response.status == 'connected' ? true : false;
  //     })
  // }

  // private handleError(error) {
  //   console.error('Error processing action', error);
  // }

}
