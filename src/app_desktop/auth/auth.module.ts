import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AlertComponent } from '../_directives/index';
import { AuthGuard } from '../auth-guard.service';
import { AlertService, AuthenticationService, UserService } from '../_services/index';


import { LoginComponent }  from './login.component';
import { LogoutComponent }  from './logout.component';
import { RegisterComponent }  from './register.component';
import { DudesComponent } from './dudes.component';
import { ForgotComponent } from './forgot.component';
import { RestoreComponent } from './restore.component';
import { EqualValidator } from '../_directives/equal-validator';
import {ValidationOnBlurDirective} from "../_directives/validate-onblur";

const authRoutes: Routes = [
    { path: '',  component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot', component: ForgotComponent },
    { path: 'reset', component: RestoreComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(authRoutes),
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        EqualValidator,
        DudesComponent,
        LoginComponent,
        LogoutComponent,
        RegisterComponent,
        ForgotComponent,
        AlertComponent,
        RestoreComponent,
        ValidationOnBlurDirective,
    ],
    providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
    exports: [
        RouterModule
    ],
})


export class AuthModule { }