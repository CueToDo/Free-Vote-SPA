import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { HttpClientService } from './http-client.service';
import { Cookie } from 'ng2-cookies';

import { SignInStatus, SignInData } from './coredata.service';

@Injectable()
export class AuthenticationService {

    //Let the service handle the communication and the response data
    //Notify service users via Subject

    //expose this for service users to check. 
    //Could be retrieved from cookie, not necessarily service response
    SignInData: SignInData;

    constructor(private httpClientService: HttpClientService) {

        this.SignInData = new SignInData()

        //Singleton Service - called once only
        if (Cookie.get("SignInData") != "") {
            this.SignInData = JSON.parse(Cookie.get("SignInData"));
            console.log('Retrieved SignInData from Cookie');
            console.log(Cookie.get("SignInData"));
            console.log(this.SignInData);
        }
    }


    public SignInStatusChange = new Subject<SignInData>();
    public SessionIDnewReceived = new Subject<SignInData>();

    SignIn(website: string, email: string, password: string): void {

        let success = false;
        let data = { "website": website, "email": email, "password": password };

        this.httpClientService
            .post('authentication/signin/', data)
            //.map(response => response.json()); //assumed - not needed
            .then(response => {


                this.SignInData = <SignInData>response;
                console.log('SignInStatus: ' + this.SignInData.SignInStatus);




                //http://stackoverflow.com/questions/32896407/redirect-within-component-angular-2
                //Save SignInData with JWT as cookie, not in local storage
                if (this.SignInData.SignInStatus == SignInStatus.SignInSuccess) {
                    Cookie.set('SignInData', JSON.stringify(this.SignInData));
                    success = true;
                }

                //Notify any observers that didn't initiate the SignIn Request
                this.SignInStatusChange.next(this.SignInData);
            },
                error => {
                    console.log("Sign-In Error" + error);
                });
    }

    SignOut() {
        Cookie.delete('SignInData');
        this.SignInData = new SignInData()
        this.SignInData.SignInStatus = SignInStatus.SignedOut;
        this.SignInStatusChange.next(null);
    }

}