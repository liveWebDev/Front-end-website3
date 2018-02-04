import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../_services/user.service';
import { Validators, FormBuilder, FormGroup, FormControl, FormGroupDirective } from '@angular/forms';

import { DudesComponent } from './dudes.component';

import { AlertService, AuthenticationService } from '../_services/index';
import { ValidationOnBlurDirective } from '../_directives/validate-onblur';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', 'auth.scss'],
    entryComponents: [DudesComponent],
    encapsulation: ViewEncapsulation.None,
})

export class LoginComponent implements OnInit {
    model: any = {};
    errorMsg: '';
    loading: boolean;
    returnUrl: string;
    submitAttempt: boolean = false;
    common = {
        title: 'Welcome back!',
    };

    @ViewChild('f') form: FormGroupDirective;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService)
    {
        this.model = this.fb.group({
            "password": [null, Validators.required],
            "email": [null, Validators.required],
        });
        this.loading = false;
    }


    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/main';


        if (localStorage.getItem('currentUser')) {
            //user is logged in so we will return him to main component
            this.router.navigate([this.returnUrl]);
        }

    }

    login() {
        this.submitAttempt = true;
        this.authenticationService.logout();
        if (!!this.model.email && !!this.model.password) {
            this.loading = true;
            this.authenticationService.login(this.model.email, this.model.password)
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    var errorMessage  = error.json();
                    this.errorMsg = errorMessage[0].message;
                    this.loading = false;
                });
        }
        

        
    }


}

