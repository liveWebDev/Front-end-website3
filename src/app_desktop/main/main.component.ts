/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';

import {User} from "../_models/user";


import {UserService} from "../_services/user.service";
import { AuthenticationService } from "../_services/authentication.service";
import {CompanyService} from "../_services/company.service";
import {EmailService} from "../_services/email.service";
import {UserAvatar} from "../_models/user-avatar";
import {DealService} from "../_services/deal.service";
import {ActivatedRoute, NavigationStart, Router, RoutesRecognized} from "@angular/router";
import {UIService} from "../_services/ui.service";
import {PopoverContent} from "ngx-popover";
import { Restangular } from 'ng2-restangular';

@Component({
    selector: 'my-app',
    templateUrl: './main.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './sidebar.scss', '../styles/_toasts.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [UserService, CompanyService, EmailService, DealService, UIService],
})

export class MainComponent implements OnInit {
    userAvatar: UserAvatar;
    companies_own: Company[];
    companies_invited: Company[];
    invite: any;
    emails: any;
    currentFirmId: number;
    currentUserId: number;
    showEmailsFolders: boolean;
    currentInboxId: number;
    emailFolders: EmailFolders;
    currentInboxFolderId: number;
    layout: number;
    emailNotLinked: boolean = false;
    expandedEmailFolders: number[];
    toggledFolders: boolean;

    isSearch: boolean;
    searchQuery: string;
    searchCount: number;
    searchProgress: boolean;
    searchResults: SearchResults;
    toastMessages: ToastMessage[];

    @ViewChild('invitesListModal') invitesListModal: PopoverContent;

    constructor(
        private userService: UserService,
        private dealService: DealService,
        private companyService: CompanyService,
        private emailService: EmailService,
        private router: Router,
        private route: ActivatedRoute,
        private uiService: UIService,
        private restangular: Restangular,
        private authenticationService: AuthenticationService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.userAvatar = new UserAvatar;
        this.userService.getAvatar();
        this.emails = [];
        this.showEmailsFolders = false;
        this.layout = 1;
        this.invite = {};

        this.isSearch = false;
        this.searchQuery = '';
        this.searchCount = 0;
        this.searchResults = {};
        this.toastMessages = [];
        this.expandedEmailFolders = [];
        this.toggledFolders = false;

        this.userService.currentAvatarObservable.subscribe(data => {
            this.userAvatar = data;
        });

        this.userService.logoutTrigger.subscribe(item => {
            console.log('logout triggered');
            this.router.navigate(['/logout']);
        });

        this.uiService.changeLayout.subscribe(data => {
            this.layout = data;
        });

        this.uiService.messageToaster.subscribe(data => {

            this.toastMessages.push(data);
            changeDetectorRef.detectChanges();

            if (data.timeout) {
                setTimeout(()=> {
                    this.toastMessages.map((item)=> {
                        this.toastMessages = this.toastMessages.filter(item => item.id !== data.id);
                    });
                }, data.timeout);
            }
        });

        //start function that will fetch all needed data for companies info
        this.companyService.getByUserId();

        this.emailService.linkedEmailsObservable.subscribe(data => {
            this.emails = data;
        });

        this.emailService.getLinkedEmails();

        this.invite = {};

        this.router.events
            .filter(event => event instanceof NavigationStart)
            .subscribe((event:NavigationStart) => {
                this.layout = 1;
                this.showEmailsFolders = !!event.url.match(/inbox/);
                this.layout = !!event.url.match('/deal/') ? 2 : 1;
            });

        this.emailService.emailFoldersObservable.subscribe(data => {
            this.emailFolders = data;
            this.showEmailsFolders = !!this.router.url.match(/inbox/);
            changeDetectorRef.detectChanges();
        });

        this.emailService.currentInboxObservable.subscribe(data => {
            this.currentInboxId = data;
        });

        this.emailService.currentInboxFolderObservable.subscribe(data => {
            this.currentInboxFolderId = data;
        });

    };

    acceptInvite() {
        this.invitesListModal.hide();
        let invite = JSON.parse(localStorage.getItem('invite'));
        this.restangular.all('roles/invite').post({firm_id: invite.firm_id, token: invite.token}).subscribe(
            data => {
                localStorage.removeItem('invite');
                this.invite = {};
                this.companyService.getByUserId();
                this.companyService.companiesObservable.subscribe(data=> {
                  this.router.navigateByUrl('/main/deal');
                });
                this.emailNotLinked = false;
            },
            error => {
                localStorage.removeItem('invite');
                this.invite = {};
            }
        )
    }

    showSearchResult(section: string, data: any) {
        switch (section) {
            case 'contact':
                this.hideSearch();
                this.router.navigate(['main', 'company', this.currentFirmId, 'contacts', data.id]);
                this.searchQuery = '';
                break;
                case 'deal':
                this.hideSearch();
                this.router.navigate(['main', 'deal', data.id]);
                this.searchQuery = '';
                break;
            case 'letter':
                this.hideSearch();
                this.router.navigate(['main', 'deal', data.deal_id]);
                this.searchQuery = '';
                break;
        }
    }

    globalSearch() {
        this.searchProgress = true;
        this.companyService.companyGlobalSearch(this.searchQuery, this.currentFirmId);
    }

    hideSearch() {
        this.isSearch = false;
        this.searchQuery = '';
        this.searchResults = {};
        this.searchCount = 0;
    }

    deleteInvite() {
        this.invitesListModal.hide();
        this.invite = {};
        localStorage.removeItem('invite');
        //should send request to server to remove invite from database
    }

    ngOnInit() {
        this.companyService.companySearchDataObservable.subscribe(data => {
            this.searchResults = data;
            this.searchCount =
                (data.contacts ? data.contacts.length : 0) +
                (data.deals ? data.deals.length : 0) +
                (data.letters ? data.letters.length : 0);

            this.searchProgress = false;
        });

        if (!this.companyService.noCompanies) {
            this.companies_own = this.companyService.getOwnCompanies();
            this.companies_invited = this.companyService.getInvitedCompanies();
            this.currentFirmId = this.companyService.getCurrentCompanyId();
        }

        //get companies referred to current user
        this.companyService.companiesObservable.subscribe(value => {

            this.router.events.subscribe((data:any) => {
              this.toastMessages.map((item)=> {
                  //Clear all error toasts
                  this.toastMessages = this.toastMessages.filter(item => item.type !== 'danger');
              });
            });
            if (this.router.url == '/main/deal'  && this.companyService.noCompanies) {
                this.router.navigateByUrl('/main/company-create');
            }
            this.companies_own = this.companyService.getOwnCompanies();
            this.companies_invited = this.companyService.getInvitedCompanies();
            this.currentFirmId = this.companyService.getCurrentCompanyId();

            //Check if there is an invite in localstorage
            let invite = JSON.parse(localStorage.getItem('invite'));
            if (invite) {
              let firmPresent = false;
              this.companies_own.map((item)=> {
                if (item.id == invite.firm_id) {
                  firmPresent = true;
                }
              });
              this.companies_invited.map((item)=> {
                if (item.id == invite.firm_id) {
                  firmPresent = true;
                }
              });
              // make sure that invited firm id is not present in current firm list
              if (!firmPresent) {
                this.invite = invite;
                this.restangular.one('firms/'+invite.firm_id+'/name').get().subscribe(
                    data => {
                        this.invite.company_name = data[0].title;
                    }
                );
                this.emailNotLinked = true;
                //need to compare invite email to current user's email
                let userEmail = '';
                //firms/{id}/name
                this.restangular.one('users/main-user-information/0').get().subscribe(
                    data => {
                        userEmail = data[0].email;
                        if (userEmail == invite.email) {
                            this.emailNotLinked = false;
                        }
                        else {
                            let userLinkedEmails = [];
                            this.restangular.one('emails').get().subscribe(
                                data => {
                                    userLinkedEmails = data.map((item) => {
                                        if (item.email_address == invite.email) {
                                            this.emailNotLinked = false;
                                        }
                                    });
                                    this.emailService.invitedEmail = this.emailNotLinked ? invite.email : '';
                                }
                            );
                        }
                    }
                );
              }
              else {
                localStorage.removeItem('invite');
              }


            }
        });
    }

    //fires when one clicked company on left
    loadCompany(id:number, title: string) {

        this.companyService.loadCompany(id, title);
        this.currentUserId = JSON.parse(localStorage.getItem('currentUser')).user_id;
        if (!this.currentUserId) {
            this.currentUserId = this.authenticationService.currentUserId;
        }
        this.currentFirmId = id;

        //this.companyService.currentCompanyTitle = title;


        //this.dealService.getFilters(this.currentUserId, id);
        //this.dealService.getByFilter(this.currentUserId, id, 1);
        //this.companyService.getCompanyUsers(id);

    }

    toggleEmailSubfolders(index, $event) {
        $event.preventDefault();

        if (this.expandedEmailFolders.indexOf(index) >= 0) {
            this.expandedEmailFolders.splice(this.expandedEmailFolders.indexOf(index), 1);
        } else {
            this.expandedEmailFolders.push(index);
        }
    }

    closeToast(index: number) {
        this.toastMessages.splice(index, 1);
    }

}

interface Company {
  id: number,
  firm_id: number,
  hot_deals: string,
  title: string,
}

interface SearchResults {
    contacts?: [
        {
            name: string,
            id: number
        }
        ],
    deals?: [
        {
            title: string,
            id: number,
            partner_name: string
        }
        ],
    letters?: [
        {
            subject: string,
            thread_id: string,
            email: string
        }
        ]

}

interface ToastMessage {
    timeout: number;
    id: number;
    type: string;
    message: string;
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
