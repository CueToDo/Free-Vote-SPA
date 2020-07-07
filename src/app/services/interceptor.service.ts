// angular
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';

// rxjs
import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

// auth0
import { AuthService } from './auth.service';

// FreeVote
import { LocalDataService } from './local-data.service';

@Injectable({ providedIn: 'root' })
export class InterceptorService implements HttpInterceptor {



    constructor(
        private auth: AuthService,
        private localData: LocalDataService
    ) { }


    // input parameters are both the request and the handler
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // https://stackoverflow.com/questions/48683476/how-to-add-multiple-headers-in-angular-5-httpinterceptor
        // To add headers rather than override
        // const authReq = req.clone({ setHeaders: { Authorization: authToken } });

        // There's getting a user and there's getting a token
        // Login gets the user but does not get the token ???


        if (this.localData.loggedInToAuth0) {
            return this.auth.getTokenSilently$().pipe(
                mergeMap(token => {

                    localStorage.setItem('Access-Token', token);

                    const tokenReq = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    return next.handle(tokenReq);
                }),
                // https://stackoverflow.com/questions/43115390/type-void-is-not-assignable-to-type-observableinput
                catchError(err => this.handleError(err))
            );
        } else {
            return next.handle(req);
        }
    }

    handleError(error: Response | HttpErrorResponse): Observable<HttpEvent<any>> {

        // Handle 404's or throw original server error

        // https://stackoverflow.com/questions/45464852/rxjs-observable-throw-is-not-a-function-angular4

        if (error instanceof HttpErrorResponse && error.status === 404) {
            console.log('404 Error', error);
            const error404 = { error: { detail: error.message } };
            return throwError(error404);

        } else {
            return throwError(error);
        }


    }
}
