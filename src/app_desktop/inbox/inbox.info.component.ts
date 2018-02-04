/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation} from '@angular/core';

import {User} from "../_models/user";

import {CompanyService} from "../_services/company.service";
import {UserService} from "../_services/user.service";
import {DealService} from "../_services/deal.service";
import {exhaustMap} from "rxjs/operator/exhaustMap";
import {EmailService} from "../_services/email.service";
import {ThreadService} from "../_services/thread.service";
import {StatsService} from "../_services/stats.service";
import {Inbox} from "../_models/inbox";
import {InboxErrors} from "../_models/inbox-errors";
import {ActivatedRoute, Router} from "@angular/router";


@Component({
    templateUrl: './inbox.info.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './inbox.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [StatsService, EmailService],
})

export class InboxInfoComponent {
    model: Inbox;
    formErrors: InboxErrors;
    submitted: boolean;
    currentEmailId: number;

    constructor(
        private emailService: EmailService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.model = new Inbox();
        this.formErrors = new InboxErrors();
        this.submitted = false;

        this.route.params.subscribe(params => {
            this.currentEmailId = params["id"];
            this.emailService.getLinkedEmailById(this.currentEmailId);
        });

        this.emailService.currentLoadedEmailBox.subscribe(data => {
            this.model = new Inbox(data);
        });

    };

    onSubmit() {
        console.log('Submit');

        this.emailService.updateInbox(this.model, this.currentEmailId)
            .subscribe(
                data => {
                    console.log(data);
                    console.log('updated');
                    this.submitted = true;
                    this.emailService.getLinkedEmails();
                    this.router.navigateByUrl('/main/inbox/' + this.currentEmailId);
                },
                error => {
                    console.log(error);
                    console.log('error submit');
                    JSON.parse(error._body).forEach(data => {
                        this.formErrors[data.field] = data.message;
                    })
                });
    }

}

