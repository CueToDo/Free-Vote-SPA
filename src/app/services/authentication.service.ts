import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { HttpClientService } from './http-client.service';
import { Cookie } from 'ng2-cookies';

import { CoreDataService, SignInStatus, SignInData } from './coredata.service';

@Injectable()
export class AuthenticationService {

    //Let the service handle the communication and the response data
    //Notify service users via Subject
    public SignInStatusChange = new Subject<SignInData>();

    constructor(private httpClientService: HttpClientService) {

    }


    SignIn(website: string, email: string, password: string): void {

        let success = false;
        let data = { "website": website, "email": email, "password": password };

        this.httpClientService
            .post('authentication/signin/', data)
            //.map(response => response.json()); //assumed - not needed
            .then(response => {


                var signInData = <SignInData>response;
                console.log('SignInStatus: ' + signInData.SignInStatus);


                //http://stackoverflow.com/questions/32896407/redirect-within-component-angular-2
                //Save SignInData with JWT as cookie, not in local storage
                if (signInData.SignInStatus == SignInStatus.SignInSuccess) {
                    Cookie.set('SignInData', JSON.stringify(signInData));
                    success = true;
                }

                //Notify any observers that didn't initiate the SignIn Request
                this.SignInStatusChange.next(signInData);
            },
                error => {
                    console.log("Sign-In Error" + error);
                });
    }

    SignOut() {
        Cookie.delete('SignInData');
        var signInData = new SignInData()
        signInData.SignInStatus = SignInStatus.SignedOut;
        Cookie.set('SignInData', JSON.stringify(signInData));
        this.SignInStatusChange.next(null);
    }

}