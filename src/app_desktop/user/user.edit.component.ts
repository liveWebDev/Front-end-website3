/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewChild, ViewEncapsulation, SecurityContext} from '@angular/core';
import {Location} from '@angular/common';

import {UserService} from "../_services/user.service";
import {UserGeneralForm} from "../_models/user-general-form";
import {UserCredentialsForm} from "../_models/user-credentials-form";
import {CredentialsErrors} from "../_models/credentials-errors";
import {CompanyService} from "../_services/company.service";
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    templateUrl: './user.edit.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './user.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [UserService],
})

export class UserEditComponent {
    currentTab: string;
    generalForm: UserGeneralForm;
    credentialsForm: UserCredentialsForm;
    submitted: boolean;
    credentialsErrors: CredentialsErrors;
    removedCompanies: any[];
    public alerts: any = [];
    private currentRestoringCompany: number;

    @ViewChild ('restoreWarning')
    private restoreWarning: any;

    constructor(
        private userService: UserService,
        private location: Location,
        private companyService: CompanyService,
        private sanitizer: DomSanitizer
    ) {
        this.generalForm = new UserGeneralForm('');
        this.credentialsForm = new UserCredentialsForm('');
        this.credentialsErrors = new CredentialsErrors;
        this.currentTab = 'about';
        this.removedCompanies = [];

        this.alerts = this.alerts.map((alert:any) => ({
          type: alert.type,
          msg: sanitizer.sanitize(SecurityContext.HTML, alert.msg)
        }));

        this.companyService.removedCompaniesObservable.subscribe(data => {
            this.removedCompanies = data;
        });

        this.companyService.getRemovedCompanies();

        this.userService.getFullData().subscribe(data => {

            this.generalForm.phone = data.phone;
            this.generalForm.skype = data.skype;
            this.generalForm.facebook = data.facebook;
            this.generalForm.linkedin = data.linkedin;

        });

        this.userService.getGeneralData(0);

        this.userService.generalDataObservable.subscribe(data => {
            this.generalForm.username = data[0].username;

            this.credentialsForm.new_email = data[0].email;
            this.credentialsForm.password = '';
        });

    };

    changeTab(newTab) {
        this.currentTab = newTab;
    };

    onSubmitGeneralForm() {
        console.log('Submit');
        this.alerts.push({
          type: 'success',
          msg: `Changes were successfully saved`,
          timeout: 2000
        });
        this.userService.updateGeneralData(this.generalForm)
            .subscribe(
                data => {
                    console.log(data);
                    console.log('updated');
                },
                error => {
                    console.log(error);
                    console.log('error submit');
                });
    }

    onSubmitCredentialForm() {

        if (this.credentialsForm.new_password != this.credentialsForm.newPassRepeat) {
            this.credentialsErrors['newPassRepeat'] = 'Passwords don`t match';

        } else {
            this.userService.updateCredentials(this.credentialsForm)
                .subscribe(
                    data => {
                        this.alerts.push({
                          type: 'success',
                          msg: `Changes were successfully saved`,
                          timeout: 2000
                        });
                    },
                    error => {
                        JSON.parse(error._body).forEach(data => {
                            this.credentialsErrors[data.field] = data.message;
                        });
                    });
        }
    }

    consoleLog(data) {
        console.log(data);
    }

    goBack() {
        this.location.back();
    }

    requestRestore($event, companyId: number) {
        $event.preventDefault();
        this.currentRestoringCompany = companyId;
        this.restoreWarning.show();
    }

    restoreCompany() {
        if (this.currentRestoringCompany) {
            this.companyService.restoreDeletedCompany(this.currentRestoringCompany ).subscribe(
                data => {
                    console.log(data);
                    console.log('company restored');
                    this.companyService.getByUserId();
                    this.companyService.getRemovedCompanies();
                }, error => {
                    console.log(error);
                    console.log('company not restored');
                }
            );
        }
        this.restoreWarning.hide();
    }

}
