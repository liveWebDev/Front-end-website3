/**
 * Created by adrian on 6/2/17.
 */
import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../_services/user.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { DudesComponent } from './dudes.component';

import { AlertService, AuthenticationService } from '../_services/index';
import { ValidationOnBlurDirective } from '../_directives/validate-onblur';

@Component({
    template: '',
})

export class LogoutComponent implements OnInit {

    constructor(private _authService: AuthenticationService, private router: Router) {}

    ngOnInit() {
        this._authService.logout();
        this.router.navigate(['/']);
    }


}

