/**
 * Created by adrian on 5/30/17.
 */
import {
    Component, ViewEncapsulation, OnInit, ViewChild, AfterViewInit, ElementRef, EventEmitter,
    Output
} from '@angular/core';
import {Inbox} from "../_models/inbox";
import {EmailService} from "../_services/email.service";
import {ThreadService} from "../_services/thread.service";
import {InboxErrors} from "../_models/inbox-errors";
import {Router} from "@angular/router";
import {UIService} from "../_services/ui.service";
import {ApiAuthService} from "../_services/api.auth.service";
import {WindowRefService} from "../_services/window.ref.service";

@Component({
    templateUrl: './inbox.create.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './inbox.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [ThreadService],
})

export class InboxCreateComponent implements OnInit, AfterViewInit {

    model: Inbox;
    formErrors: InboxErrors;
    submitted: boolean;
    showStageTwo: boolean;
    showStageThree: boolean;
    messageStageTwo: string;
    messageStageThree: string;
    selectedProvider: string;
    showProvidersList: boolean;
    showImapPortList: boolean;
    showSmtpPortList: boolean;
    selectedImapPort: string;
    selectedSmtpPort: string;
    linkedEmails: any;
    submittingForm: boolean = false;
    logo: any;
    fullEmailLinkForm: boolean;
    public auth2: any;
    _window: Window;

    @ViewChild ('linkMailModal') private linkMailModal: any;
    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private emailService: EmailService,
        private threadService: ThreadService,
        private router: Router,
        private element: ElementRef,
        private uiService: UIService,
        private authService: ApiAuthService,
        private windowRefService: WindowRefService,
    ) {
        this.model = new Inbox();
        this.formErrors = new InboxErrors();
        this.submitted = false;
        this.showStageTwo = false;
        this.messageStageTwo = '';
        this.selectedProvider = '';
        this.showProvidersList = false;
        this.showImapPortList = false;
        this.showSmtpPortList = false;
        this.selectedImapPort= '';
        this.selectedSmtpPort= '';
        this.logo = {};
        this.fullEmailLinkForm = false;
        this._window = this.windowRefService.nativeWindow;

        this.emailService.linkedEmailsObservable.subscribe(data => {
            this.linkedEmails = data;
        });

        this.emailService.getLinkedEmails();
    };

    ngOnInit() {
        if (!!this.emailService.invitedEmail) {
            this.model.email_address = this.emailService.invitedEmail;
        }
    }

    ngAfterViewInit() {}

    callForGapiAuthLink() {
        let linkRequest = this.authService.getAuthLink().toPromise();

        linkRequest.then(data => {
            let popup = this._window.open(data.call_link, '_blank', "height=600,width=600");

            let timer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(timer);

                    this.emailService.getLinkedEmails();

                    // Check server session for some errors
                    this.emailService.getEmailLinkLastError().subscribe(data => {
                        if (data.messages.length) {
                            this.toast({
                                timeout: 4000,
                                type: 'danger',
                                message: data.messages[0]
                            });
                        } else {
                            this.emailService.getFreshEmailsList().subscribe(data => {
                                this.router.navigateByUrl('/main/inbox/' + data.slice(-1)[0].id);
                            });
                        }
                    });
                }
            }, 100);

        });

    }

    clearError(field: string) {
        if (this.formErrors[field]) {
            delete this.formErrors[field];
        }
    }

    watchSmtpPortList() {
        console.log('click');
        this.showSmtpPortList = !this.showSmtpPortList;
        console.log(this.showSmtpPortList);
    }

    watchImapPortList() {
        this.showImapPortList = !this.showImapPortList;
    }

    pickPort(type: string, port: PortListItem) {
        switch (type) {
            case 'imap':
                this.showImapPortList = false;
                this.selectedImapPort = port.port + ' - ' + port.encryption.toUpperCase();
                this.model.port_imap = port.port;
                this.model.encryption_imap = port.encryption;
                break;
            case 'smtp':
                this.showSmtpPortList = false;
                this.selectedSmtpPort = port.port + ' - ' + port.encryption.toUpperCase();
                this.model.port_smtp = port.port;
                this.model.encryption_smtp = port.encryption;
                break;
        }

    }

    validateDataField(patternName: string, field: string, value: string) {
        let error = this.model.validateDataField(patternName, field, value);

        if (JSON.stringify(error).length > 4) {
            error.forEach(data => {
                this.formErrors[data.field] = data.message;
            });
        }
    }

    pickMailProvider(provider: any, showFullEmailLinkForm: boolean) {
        if (provider.name != "google") {
            this.model = new Inbox();
            this.formErrors = new InboxErrors();
            this.logo = provider;
            this.fullEmailLinkForm = showFullEmailLinkForm;
            console.log(provider.name);
        }
    }

    closeBox($event?: any) {

        if ($event) {
            $event.preventDefault();
        }

        this.linkMailModal.hide();

        setTimeout(function () {
            this.logo = {};
            this.fullEmailLinkForm = false;
        }, 300);
    }

    onSubmit() {
        this.model.email_address = this.model.login;
        let errors = this.model.validateDataFields(true, this.linkedEmails.length ? this.linkedEmails : null);

        if (!errors.length) {
          this.submittingForm = true;

            if (this.fullEmailLinkForm) {
                this.emailService.addInbox(this.model)
                    .subscribe(
                        data => {
                            console.log('updated');
                            this.submitted = true;
                            this.emailService.getLinkedEmails();
                            this.submittingForm = false;
                            this.succeededLinkTrigger(data.id);
                        },
                        error => {
                            this.showStageTwo = true;
                            JSON.parse(error._body).forEach(data => {
                                this.formErrors[data.field] = data.message;
                            });
                            this.submittingForm = false;
                        });
            } else {
                if (this.model.applySettings(this.logo.name)) {
                    this.emailService.addInbox(this.model)
                        .subscribe(
                            data => {
                                console.log(data);
                                console.log('updated');
                                this.submitted = true;
                                this.emailService.getLinkedEmails();
                                this.submittingForm = false;
                                this.succeededLinkTrigger(data.id);
                            },
                            error => {
                                this.formErrors['login'] = 'Wrong login or password';
                                this.submittingForm = false;
                            });
                } else {
                    this.formErrors['login'] = 'Wrong login or password';
                    this.submittingForm = false;
                }
            }

        } else {
            errors.forEach(data => {
                this.formErrors[data.field] = data.message;
            });
            this.submittingForm = false;

            this.toast({
                timeout: 4000,
                type: 'danger',
                message: 'There are some errors occurred'
            });
        }
    }

    succeededLinkTrigger(inboxId: number) {
        setTimeout(() => {
            this.router.navigateByUrl('/main/inbox/' + inboxId);
        }, 10000);
        setTimeout(() => {
            this.toast({
                timeout: 10000,
                type: 'info',
                message: 'Syncing your inbox data'
            });
        },1000);
        this.toast({
            timeout: 4000,
            type: 'info',
            message: 'Your inbox successfully linked'
        });
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }
}

interface PortListItem {
    port: number;
    encryption: string;
}
