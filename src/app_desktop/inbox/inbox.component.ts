/**
 * Created by adrian on 5/14/17.
 */
import { UIService } from '../_services/ui.service';
import {
    Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnDestroy,
    ChangeDetectorRef, OnInit
} from '@angular/core';
import {UserService} from "../_services/user.service";
import {EmailService} from "../_services/email.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserAvatar} from "../_models/user-avatar";
import {InboxDealLinkerComponent} from "./inbox.deal.linker.component";
import {GoogleAuthComponent} from "./google.auth.component";
import {CreateNewEmailComponent} from "./create.new.email.component";
import {CreateEmailService} from "../_services/create.email.service";
import "rxjs/add/operator/takeWhile";
import {EmailFolders} from "../_models/email-folders";
import {ConfirmDeactivateGuard} from "../_services/can.deactivate.service";

@Component({
    templateUrl: './inbox.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './inbox.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    entryComponents: [InboxDealLinkerComponent, GoogleAuthComponent],
})

export class InboxComponent implements OnDestroy, OnInit {
    currentEmailId: number;
    filterFolders: EmailFolders = new EmailFolders();
    currentTab: string = '';
    searchText: string = '';
    emailsSummary: any[] = [];
    today: number = new Date().getTime();
    inSearch: boolean = true;
    loadingThread: boolean = false;
    currentEmail: any;
    thread: any[] = [];
    showBcc: boolean;
    selectedThread: any;
    currentTabIndex: number = 0;
    currentEmailCreatorState: string;
    private alive: boolean = true;
    emailUpdater: any;
    emailUpdaterCounter: number = 0;
    emailUpdaterProgress: boolean = false;
    isEmailUpdaterLocked: boolean = false;

    @ViewChild ('dealLinkModal') private dealLinkModal: any;
    @ViewChild ('dealOrPartner') private dealOrPartner: any;
    @ViewChild('inboxDealLinkerComponent') private inboxDealLinkerComponent: InboxDealLinkerComponent;
    @ViewChild('googleAuthComponent') private googleAuthComponent: GoogleAuthComponent;
    @ViewChild('createEmailComponent') private createEmailComponent: CreateNewEmailComponent;
    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private emailService: EmailService,
        private route: ActivatedRoute,
        private router: Router,
        private uiService: UIService,
        private createEmailService: CreateEmailService,
        private confirmDeactivateGuard: ConfirmDeactivateGuard,
    ) {
        this.emailService.emailFoldersObservable.takeWhile(() => this.alive).subscribe((data: EmailFolders) => {
            this.filterFolders = data;
            this.emailsSummary = [];

            if (this.filterFolders.isNotEmpty() || this.filterFolders.allMailFolder) {
                this.emailService.currentEmailFolders = this.filterFolders;
                this.emailService.getEmailSummary(this.currentEmailId, (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, 0);
            }
        });

        this.emailService.currentLoadedEmailBox.subscribe(data => {
            this.currentEmail = data;
        });

        this.emailService.emailSummaryObservable.subscribe(data => {
            let newData = this.emailsSummary.concat(data),
                dupesArray = newData
                    .map(item => item.slag)
                    .map((item, i, arr) => {
                        if (item && arr.indexOf(item) !== i) {
                            return i;
                        }
                    })
                    .filter(item => typeof item !== 'undefined');

            this.emailsSummary = newData.filter((item, i, arr) => dupesArray.indexOf(i) < 0);
            this.inSearch = false;
        });

        this.emailService.threadObservable.subscribe(
            data => {
                this.thread = data;
                this.loadingThread = false;
            }
        );

        this.emailService.addEmailToContacts.subscribe(data => {
            this.inboxDealLinkerComponent.linkDealForm(this.selectedThread, this.currentEmailId, data);
        });

        this.createEmailService.emailCreatorStateObservable.subscribe(data => {
            this.currentEmailCreatorState = data;
        });

        //load data when router initialized
        this.route.params.takeWhile(() => this.alive).subscribe(params => {
            let newEmailId = params["id"];
            this.currentTabIndex = params["folder"] ? params["folder"] : -1;

            if (!this.currentEmailId) this.currentEmailId = this.emailService.currentEmailId;
            if (!this.filterFolders.isNotEmpty() && this.emailService.currentEmailFolders) this.filterFolders = this.emailService.currentEmailFolders;

            let hasOldEmailId = !!this.currentEmailId;
            let hasDifferentNewEmailId = this.currentEmailId != newEmailId;

            if (!hasOldEmailId || (hasOldEmailId && hasDifferentNewEmailId)) {
                this.emailService.currentEmailId = this.currentEmailId = newEmailId;
                this.emailService.getLinkedEmailById(this.currentEmailId);
            }

            if (hasDifferentNewEmailId) {
                this.emailService.updateEmailFolders([]);
            }

            if (!hasOldEmailId || hasDifferentNewEmailId) {
                this.emailService.checkToken(this.currentEmailId).takeWhile(() => this.alive).subscribe(data => {

                    // Clean up email folders

                    this.emailService.getAvailableFolders(this.currentEmailId);
                    this.emailService.getLinkedEmailById(this.currentEmailId);

                    this.emailService.updateCurrentInboxFolder(this.currentTabIndex);
                    this.emailService.updateCurrentInbox(this.currentEmailId);

                    if (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) {
                        this.emailsSummary = [];
                        this.emailService.getEmailSummary(this.currentEmailId, (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, 0);
                    }

                });
            } else {

                // Update main components folder highlighting
                this.emailService.updateCurrentInboxFolder(this.currentTabIndex);
                this.emailService.updateCurrentInbox(this.currentEmailId);

                this.emailService.getLinkedEmailById(this.currentEmailId);

                if (this.filterFolders.isNotEmpty()) {
                    this.emailsSummary = [];
                    this.emailService.getEmailSummary(this.currentEmailId, (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, 0);
                }
            }
        });

        this.emailUpdater = setInterval(() => {

            if (!this.emailUpdaterProgress && !this.isEmailUpdaterLocked) {
                this.emailUpdaterProgress = true;
                this.emailService.checkEmailUpdates(this.currentEmailId, '').then(
                    data => {
                        if (data.status) {

                            setTimeout(()=> {
                                this.inSearch = true;
                                this.emailsSummary = [];

                                this.emailService.getEmailSummary(this.currentEmailId, this.filterFolders.folders[this.currentTabIndex] ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, 0);
                                this.emailUpdaterProgress = false;
                            }, 15000);
                        } else {
                            this.emailUpdaterProgress = false;
                        }
                    },
                ).catch(reason => {
                    this.toast({
                        timeout: 5000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'alert',
                        message: 'Something went wrong. Try to reload the page'
                    });
                });
                this.emailUpdaterCounter++;
            }
        }, 30000);
    };

    consoleLog(data) {
        console.log(data);
    }

    createNewEmail() {
        if (this.confirmDeactivateGuard.canDeactivate(this)) {
            this.createEmailComponent.createNewEmail();
        }
    }

    search(text: string) {

        if (text) {
            this.isEmailUpdaterLocked = true;
            this.inSearch = true;
            this.emailsSummary = [];
            this.emailService.searchEmails(this.currentEmailId, (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, text);
        } else if (this.isEmailUpdaterLocked) {
            this.isEmailUpdaterLocked = false;
            this.emailService.getEmailSummary(this.currentEmailId, (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, 0);
        }
    }

    hasChanges() {
        return this.createEmailComponent.hasChanges();
    }

    showMessage(thread: any) {
        if (this.confirmDeactivateGuard.canDeactivate(this)) {
            this.showBcc = false;
            let identities = [];
            let dates = {};
            this.emailService.dropLoadedThreadList();
            this.loadingThread = true;
            this.selectedThread = thread;
            console.log('thread!!!');
            console.log(this.selectedThread);
            thread.emails.forEach(email => {
                identities.push({
                    uid: email.uid,
                    folder: email.box,
                });
                dates[email.uid] = email.date;
            });

            this.emailService.loadThreadEmails(this.currentEmailId, (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, identities, dates);
            this.createEmailService.dropEmailCreatorsState();
            this.createEmailComponent.clearComponent();
        }
    }

    deleteLetter(uid: number, folder?: string, timestamp?: number) {
        this.emailService.deleteMessage({
            "email_id": this.currentEmailId,
            "folder": folder ? folder : this.filterFolders.folders[this.currentTabIndex],
            "uid": uid,
            "date": timestamp ? timestamp : new Date(this.thread[0].mail.date).getTime(),
        }).subscribe(
            data => {
                this.emailsSummary = [];
                this.inSearch = true;
                this.emailService.getEmailSummary(this.currentEmailId, this.filterFolders.folders[this.currentTabIndex], 0);
                this.emailService.dropLoadedThreadList();
                this.toast({
                    timeout: 2000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'info',
                    message: 'Email was successfully deleted'
                });
            }, error => {
                this.toast({
                    timeout: 2000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'alert',
                    message: 'Something went wrong. Try again later'
                });
            }
        );
    }

    loadMore() {
        console.log('triggered load more function');

        if (!this.inSearch && this.emailsSummary.length) {
            this.inSearch = true;
            this.emailService.getEmailSummary(this.currentEmailId, (this.filterFolders.isNotEmpty() && this.currentTabIndex >= 0) ? this.filterFolders.folders[this.currentTabIndex] : this.filterFolders.allMailFolder, (this.emailsSummary.length && this.emailsSummary.slice(-1)[0].emails.length) ? this.emailsSummary.slice(-1)[0].emails.slice(-1)[0].date : 0);
        }
    }

    linkDealForm($event, thread: any) {
        $event.stopPropagation();
        this.inboxDealLinkerComponent.linkDealForm(thread, this.currentEmailId, null, this.currentEmail.email_address);
    }

    refreshMailList($event) {
        $event.preventDefault();
        this.emailService.checkEmailUpdates(this.currentEmailId, '').then(
            data => {
                if (data.status) {
                    let that = this;

                    this.inSearch = true;
                    this.emailsSummary = [];
                    that.emailService.getEmailSummary(that.currentEmailId, that.filterFolders.folders[that.currentTabIndex], 0);

                    this.toast({
                        timeout: 10000,
                        type: 'info',
                        message: 'Successfully updated'
                    });
                } else {
                    this.toast({
                        timeout: 10000,
                        type: 'info',
                        message: 'Your inbox is up to date'
                    });
                }
            },
            error => {
                this.toast({
                    timeout: 15000,
                    type: 'danger',
                    message: 'Something went wrong, please try again later...'
                });
            },
        );
        this.toast({
            timeout: 10000,
            type: 'info',
            message: 'Checking your mailbox...'
        });
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }

    ngOnDestroy() {
        this.alive = false;
        clearInterval(this.emailUpdater);
    }

    ngOnInit() {
        this.emailUpdaterProgress = false;
    }
}