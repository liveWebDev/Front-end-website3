import { Restangular } from 'ng2-restangular';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Response } from '@angular/http';
import { AuthenticationService } from '../_services/index';

import { UserService } from '../_services/index';
import { DudesComponent } from './dudes.component';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', 'auth.scss'],
    entryComponents: [DudesComponent],
    encapsulation: ViewEncapsulation.None,
})

export class RegisterComponent implements OnInit{
    submitAttempt = false;
    errorMsg: string;
    errorMsg2: string;
    firstStep: any = {};
    secondStep: any = {};
    returnUrl: string;
    step = 1;
    loading = false;
    common = {
        title: 'Get started, step 1',
    };
    email = '';
    password = '';
    username = '';
    companyName = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private http: Http,
        private restangular: Restangular
    ) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/main';
    }

    submitFirstStep(event: Event, email: string, password: string, confirm: string): void {
        event.preventDefault();
        this.email = email;
        this.password = password;
        this.checkEmail(this.email).subscribe(
            data => {
                if (!data) {
                    this.step = 2;
                    this.common.title = 'Get started, step 2';

                }
                else {
                    this.errorMsg = 'Email is already registered in system';
                }
            },
            error => {
            }
        );
    }

    submitSecondStep(event: Event, username: string, companyName: string): void {
        event.preventDefault();
        this.username = username;
        this.companyName = companyName;
        this.register();
    }

    checkEmail (email: string) {
        return this.http.post(location.origin+'/server/site/email-check', {email: email})
            .map((response: Response) => {
                // request successful, so we should return it
                return response.json() && response.json().status;
            });
    }
    onKey() {
        this.errorMsg = '';
        this.errorMsg2 = '';
    }

    register() {
        this.loading = true;
        this.authenticationService.register(this.email, this.password, this.username,this.companyName)
            .subscribe(
                data => {
                    if (!!this.companyName) {
                      this.restangular.all("firms").post({title: this.companyName, description: ''}).subscribe(data=> {
                        this.router.navigate([this.returnUrl]);
                      });
                    }
                },
                error => {
                    this.loading = false;
                    this.errorMsg2 = error.json()[0].message;
                });

    }
}

