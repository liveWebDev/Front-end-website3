/**
 * Created by adrian on 5/15/17.
 */
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class ApiAuthService {
    public tokenUpdateObservable = new Subject<any>();

    constructor(private http: Http) { }

    getAuthLink() {
        return this.http.get('/server/email/get-api-signup-link', this.jwt()).map((response: Response) => response.json());
    }

    // checkToken(id: number) {
    //     return this.http.get('/server/emails/validate-connection?id=' + id, this.jwt()).map((response: Response) => response.json());
    // }
    //
    // updateToken(data: any) {
    //     this.http.post('/server/emails/update-token', data, this.jwt()).map((response: Response) => response.json()).subscribe(data => {
    //         this.tokenUpdateObservable.next(data);
    //     }, error => {
    //         console.log(error);
    //     });
    // }

    // private helper methods

    private jwt(params?: any) {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let result: RequestOptions = new RequestOptions();
            result.headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });

            if (params) {
                result.search = new URLSearchParams();
                for (let key in params) {
                    result.search.set(key, params[key]);
                }
            }

            return result;
        }
    }

    private handleError(error: any) {
        console.log(error);
        return Observable.throw(error.json());
    }
}
