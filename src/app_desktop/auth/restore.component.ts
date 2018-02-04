import {OnInit, OnDestroy, Component} from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { DudesComponent } from './dudes.component';
import { AuthenticationService } from '../_services/index';
import {Router, ActivatedRoute, Params, NavigationCancel} from '@angular/router';
import { URLSearchParams, } from '@angular/http';


@Component({
    templateUrl: 'restore.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', 'auth.scss'],
    entryComponents: [DudesComponent],
    encapsulation: ViewEncapsulation.None,
})

export class RestoreComponent implements OnInit {
    restoreForm : any = {};
    token = '';
    sended = false;
    returnUrl : string;
    emailAddress = '';
    common = {
        title: 'Welcome back!',
    };
    constructor(
        private authenticationService: AuthenticationService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    )
    { router.events.subscribe(s => {
        let params = new URLSearchParams(s.url);
        this.token = params.rawParams.split('token=')[1];
    });
    }

    ngOnInit() {
        // subscribe to router event

        this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/main';
    }

    submit (event: Event, password: string, token: string) {
        event.preventDefault();
        this.authenticationService.restoreRequest(this.token, password).subscribe(
            data => {
                this.router.navigate([this.returnUrl]);
            },
            error => {
                console.log(error);
            });
    }

}

