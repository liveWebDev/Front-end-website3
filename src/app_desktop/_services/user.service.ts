import {EventEmitter, Injectable} from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { User } from '../_models/index';
import {Observable} from 'rxjs/Observable';
import {UserCredentialsForm} from "../_models/user-credentials-form";
import {UserGeneralForm} from "../_models/user-general-form";
import {Subject} from "rxjs/Subject";
import {Restangular} from "ng2-restangular";

@Injectable()
export class UserService {
    public currentAvatarObservable = new Subject<any>();
    public generalDataObservable = new Subject<any>();
    public avatarErrorObservable = new Subject<any>();
    public logoutTrigger: EventEmitter<any>;

    avatar: any = {
        avatarName: ''
    };

    constructor(
        private http: Http,
        private restangular: Restangular,
    ) {
        this.logoutTrigger = new EventEmitter();
    }

    currentAvatarLoaded(val) {
        this.currentAvatarObservable.next(val);
    }

    avatarNotLoaded(val) {
        this.avatarErrorObservable.next(val);
    }


    generalDataLoaded(val) {
        this.generalDataObservable.next(val);
    }

    getAll() {
        return this.http.get('/api/users', this.jwt()).map((response: Response) => response.json());
    }

    getById(id: number) {

        return this.http.get('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
    }

    getGeneralData(id: number) {

        this.http.get('server/users/main-user-information/' + id, this.jwt()).map((response: Response) => response.json()).subscribe(
            data => {
                this.generalDataLoaded(data);
            },
            error => {});
    }

    getFullData() {

        return this.http.get('server/users/other-information', this.jwt()).map((response: Response) => response.json());
    }

    getAvatar() {

        this.restangular.one('users/get-avatar').get().subscribe(
            data => {
                if (data.avatarName && data.avatarName.length) {
                    this.avatar.avatarName = 'server/images/' + data.avatarName;
                } else {
                    this.avatar.avatarName = '/assets/images/ava.png';
                }

                this.currentAvatarLoaded(this.avatar);
            },
            error => {
                if (!!error && !error.status) {
                    console.log('unparsable response, logout now!');
                    this.logoutTrigger.emit('logout');
                }
                if (error.status === 401) {
                    console.log('unauthorized, logout now!');
                    this.logoutTrigger.emit('logout');
                }
            });
    }

    updateGeneralData(user: UserGeneralForm) {

        return this.http.post('/server/profile/ucont', user, this.jwt()).map((response: Response) => response.json());
    }

    updateAvatar(file: any) {
        let formData = new FormData();
        formData.append("avatar", file, file.name);

        this.http.post('/server/profile/avatar', formData, this.jwt())
            .map((response: Response) => response.json())
            .subscribe(
            data => {
                this.currentAvatarLoaded({avatarName: data.avatar});
            },
            error => {
                this.avatarNotLoaded(JSON.parse(error._body)[0].message);
            }
        );
    }

    updateCredentials(user: UserCredentialsForm) {

        return this.http.post('/server/profile/cheng-password', user, this.jwt()).map((response: Response) => response.json());
    }

    create(user: User) {
        return this.http.post('/api/users', user, this.jwt()).map((response: Response) => response.json());
    }

    update(user: User) {
        return this.http.put('/api/users/' + user.id, user, this.jwt()).map((response: Response) => response.json());
    }

    delete(id: number) {
        return this.http.delete('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
    }

    // private helper methods

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    isEmailRegisterd(email: string) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:8080/api/v1/isEmailRegisterd', JSON.stringify({ email: email }), { headers: headers })
            .map((response: Response) => response.json())
            .catch(this.handleError);
    }

    private handleError(error: any) {
        console.log(error);
        return Observable.throw(error.json());
        ;
    }

}
