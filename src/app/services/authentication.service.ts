import { AppSettingsModule } from '../app.settings.module'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from './http-client.service';

@Injectable()
export class AuthenticationService {

    constructor(private httpClientService: HttpClientService) { }

    SignIn(website: string, email: string, password: string): Observable<any> {

        let data = { "website": website, "email": email, "password": password };

        return this.httpClientService
            .post(AppSettingsModule.ServiceUrl + 'authentication/signin/', data)
        //.map(response => response.json()); //assumed - not needed

    }
}

export class SignInData {
    public SignInResult: number;
    public AttemptsRemaining: number;
    public email: string;
    public VoterID: number;
    public SessionID: number;
    public roles: string[];
    public JWT: string;
}