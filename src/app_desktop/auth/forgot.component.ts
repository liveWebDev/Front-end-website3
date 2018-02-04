import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { DudesComponent } from './dudes.component';
import { AuthenticationService } from '../_services/index';
import { Http, Headers, Response } from '@angular/http';

@Component({
    templateUrl: 'forgot.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', 'auth.scss'],
    entryComponents: [DudesComponent],
    encapsulation: ViewEncapsulation.None,
})

export class ForgotComponent {
    errorMsg: string;
    sent = false;
    emailAddress = '';
    common = {
        title: 'Welcome back!',
    };
    constructor(
        private authenticationService: AuthenticationService,
        private http: Http
)
    {  }

    checkEmail (email: string) {
        return this.http.post(location.origin+'/server/site/email-check', {email: email})
            .map((response: Response) => {
                // request successful, so we should return it
                let status = response.json() && response.json().status;
                return status;
            });
    }

    submit (event: Event, email: string) {
        event.preventDefault();
        //check if email exists in database and then proceed if so
        this.checkEmail(email).subscribe(
            data => {
                if (data) {
                    this.authenticationService.forgotRequest(email).subscribe(
                        data => {
                            this.emailAddress = email;
                            this.sent = true;
                        },
                        error => {

                    });
                }
                else {
                    this.errorMsg = 'Wrong email';
                }
            },
            error => {
            }
        );

    }

}

