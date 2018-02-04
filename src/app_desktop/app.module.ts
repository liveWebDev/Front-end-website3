import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { AuthModule }    from './auth/auth.module';


import { PerfectScrollbarModule } from 'angular2-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'angular2-perfect-scrollbar';
import { RestangularModule, Restangular } from 'ng2-restangular';

import { AuthGuard } from './auth-guard.service';
import { AlertService, AuthenticationService, UserService, CompanyService, EmailService } from './_services/index';

import { AppRoutingModule } from './app-routing.routes';

import { AppComponent }         from './app.component';
import {ChangelogService} from "./_services/changelog.service";
import {DealService} from "./_services/deal.service";
import {ThreadService} from "./_services/thread.service";
import {StatsService} from "./_services/stats.service";
import {PopoverModule} from "ngx-popover";
import { ModalModule } from 'ngx-bootstrap';
import {CreateEmailService} from "./_services/create.email.service";
import {ApiAuthService} from "./_services/api.auth.service";
import {WindowRefService} from "./_services/window.ref.service";
import {SignatureService} from "./_services/signature.service";
import {ConfirmDeactivateGuard} from "./_services/can.deactivate.service";

export function RestangularConfigFactory (RestangularProvider, authService) {

  // set static header
  RestangularProvider.setBaseUrl(location.origin+'/server/');
  RestangularProvider.setDefaultHeaders({'Authorization': 'Bearer UDXPx-Xko0w4BRKajozCVy20X11MRZs1'});

  // by each request to the server receive a token and update headers with it
  RestangularProvider.addFullRequestInterceptor((element, operation, path, url, headers, params) => {

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let bearerToken = 'UDXPx-Xko0w4BRKajozCVy20X11MRZs1';
    if (currentUser && currentUser.token) {
      bearerToken = currentUser.token;
    }

    return {
      headers: Object.assign({}, headers, {Authorization: `Bearer ${bearerToken}`})
    };
  });
}

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};

@NgModule({
  imports: [
    AuthModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    PopoverModule,
    ModalModule,
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    RestangularModule.forRoot(RestangularConfigFactory)
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [ AppComponent ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    CompanyService,
    EmailService,
    SignatureService,
    ChangelogService,
    DealService,
    ThreadService,
    StatsService,
    CreateEmailService,
    ApiAuthService,
    WindowRefService,
    ConfirmDeactivateGuard,
  ],
})

export class AppModule { }