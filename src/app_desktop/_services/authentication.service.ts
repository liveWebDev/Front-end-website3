import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    public token: string;
    currentUserId: number;
    constructor(
        private http: Http
    ) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            this.token = currentUser.token;
        }
    }
    //193.239.143.139
    login(email: string, password: string): Observable<boolean> {
        return this.http.post(location.origin+'/server/site/login', {email: email, password: password})
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                let userID = response.json() && response.json().user_id;
                if (token) {
                    // set token property
                    this.token = token;
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ user_id: userID, token: token }));
                    this.currentUserId = userID;

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            });
    }

    register(email: string, password: string, username: string, companyName: string) {
        return this.http.post(location.origin+'/server/site/signup', {
            email: email,
            password: password,
            username: username,
            companyName: companyName
        }).map((response: Response) => {
            let token = response.json() && response.json().token;
            let userID = response.json() && response.json().user_id;
            if (token) {
                // set token property
                this.token = token;
                // store username and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify({ user_id: userID, token: token }));
                this.currentUserId = userID;
                // return true to indicate successful login
                return true;
            } else {
                // return false to indicate failed login
                return false;
            }
        });
    }

    forgotRequest(email: string) {
        return this.http.post(location.origin+'/server/site/request-password-reset', {
            email: email
        }).map((response: Response) => {
            let status = response.json() && response.json().status;
            return status == "ok";
        });
    }

    restoreRequest(token: string, password: string) {
        return this.http.post(location.origin+'/server/site/reset-password?token='+token, {
            password: password
        }).map((response: Response) => {
            let token = response.json() && response.json().token;
            let userID = response.json() && response.json().user_id;
            if (token) {
                // set token property
                this.token = token;

                // store username and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify({ user_id: userID, token: token }));
                this.currentUserId = userID;
                // return true to indicate successful login
                return true;
            } else {
                // return false to indicate failed login
                return false;
            }
        });
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('currentFirm');
        localStorage.removeItem('currentUser');
    }
}
