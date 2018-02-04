/**
 * Created by adrian on 5/14/17.
 */
import { UIService } from './../_services/ui.service';
import {Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnDestroy, AfterViewInit} from '@angular/core';
import {EmailService} from "../_services/email.service";

declare const gapi: any;

@Component({
    template: '<div></div>',
    encapsulation: ViewEncapsulation.None,
    selector: 'google-auth'
})

export class GoogleAuthComponent implements AfterViewInit {
    currentEmailId: number;
    needToRefreshToken: boolean;
    gapiLoaded: boolean;

    public auth2: any;

    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private emailService: EmailService,
        private uiService: UIService,
    ) {};

    ngAfterViewInit() {
        this.googleInit();
    }

    public googleInit() {
        let that = this;
        gapi.load('auth2', function () {

            that.auth2 = gapi.auth2.init({
                client_id: "933140372898-or8270pt7scnthljegdcfmchqd8vj8c1.apps.googleusercontent.com",
                scope: 'https://mail.google.com/',
            });

            that.auth2.then(
                googleAuth => {
                    that.gapiLoaded = true;

                    if (that.needToRefreshToken) {
                        that.refreshToken();
                    }
                }, error => {
                    console.log(error);
                }
            );
        });
    }

    refreshTokenInit(currentInboxId: number) {
        this.currentEmailId = currentInboxId;
        this.refreshToken();
    }

    refreshToken() {

        this.toast({
            timeout: 3000,
            type: 'info',
            message: 'Updating your access token...'
        });

        gapi.auth2.getAuthInstance().signIn().then(GoogleUser => {
            this.updateToken(GoogleUser.getAuthResponse().access_token);
        }, error => {
            console.log(error);
        });
    }

    updateToken(token: string) {
        this.emailService.updateToken({email_id: this.currentEmailId, token: token});
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }

}

interface EmailFolders {
    folders: string[],
    representation: [{
        root: string,
        index: number,
        subfolders?: [{
            root: string,
            index: number,
        }]
    }],
}
