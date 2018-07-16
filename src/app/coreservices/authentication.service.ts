import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { HttpClientService } from './http-client.service';
import { Cookie } from 'ng2-cookies';

import { SignInStatuses } from './enums';
import { SignInData } from './classes';
import { CoreDataService } from './coredata.service';

@Injectable()
export class AuthenticationService {

    // Let the service handle the communication and the response data
    // Notify service users via Subject
    public SignInStatusChange = new Subject<SignInData>();

    constructor(private httpClientService: HttpClientService) {

    }


    SignIn(website: string, email: string, password: string): void {

        let success = false;
        const data = { 'website': website, 'email': email, 'password': password };

        this.httpClientService
            .post('authentication/signin/', data)
            // .map(response => response.json()); //assumed - not needed
            .then(response => {

                const signInData = <SignInData>response;
                console.log('SignInStatus: ' + signInData.SignInStatus);


                // http://stackoverflow.com/questions/32896407/redirect-within-component-angular-2
                // Save SignInData with JWT as cookie, not in local storage
                if (signInData.SignInStatus === SignInStatuses.SignInSuccess) {
                    Cookie.set('SignInData', JSON.stringify(signInData));
                    success = true;
                }

                // Notify any observers that didn't initiate the SignIn Request
                this.SignInStatusChange.next(signInData);
            },
                error => {
                    console.log('Sign-In Error' + error);
                });
    }

    SignOut() {
        Cookie.delete('SignInData');
        const signInData = new SignInData();
        signInData.SignInStatus = SignInStatuses.SignedOut;
        Cookie.set('SignInData', JSON.stringify(signInData));
        this.SignInStatusChange.next(null);
    }

}
