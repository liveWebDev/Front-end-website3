import { UIService } from './../_services/ui.service';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
/**
 * Created by adrian on 5/14/17.
 */
import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef, ViewChild, Output } from '@angular/core';

import {User} from "../_models/user";
import { Restangular } from 'ng2-restangular';

import {CompanyService} from "../_services/company.service";
import {UserService} from "../_services/user.service";
import {DealService} from "../_services/deal.service";

import {DealCreate} from "./deal-create.component"
import { AuthenticationService } from "../_services/authentication.service";

import { Subscription } from 'rxjs/Rx';
import {PopoverContent} from "ngx-popover";
import {ActivatedRoute, Router} from "@angular/router";
import {userInfo} from "os";

@Component({
    templateUrl: './deal.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './deal.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [UserService],
    entryComponents: [DealCreate],
})

export class DealComponent implements OnInit {
    loading: boolean;
    currentUserId: number;
    currentCompanyTitle: string;
    currentCompanyId: number;
    active_deals: number;
    postponed_deals: number;
    closed_deals: number;
    filterUsers: User[];
    deals: Deal[];
    gotDeals: boolean;
    selectedTabState: number;
    invites: {}[];
    creator: boolean;
    noDeals: boolean = false;
    inviteEmail: string;
    inviteSubmitAttempt: boolean = false;
    inviting: boolean = false;
    
    private ngUnsubscribe: Subject<any> = new Subject<any>();

    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    //observableFilters: Observable<any>;

    @ViewChild('userInfoPopover') userInfoPopover: PopoverContent;
    @ViewChild('userInviteModal') userInviteModal: PopoverContent;
    @ViewChild('emailError') emailError: any;

    constructor(
        private companyService: CompanyService,
        private userService: UserService,
        private dealService: DealService,
        private router: Router,
        private route: ActivatedRoute,
        private restangular: Restangular,
        private authenticationService: AuthenticationService,
        private uiService: UIService
    ) {
        this.selectedTabState = 1;
        this.active_deals = 0;
        this.closed_deals = 0;
        this.postponed_deals = 0;
        this.invites = [];
        this.inviteSubmitAttempt = false;
        //fetch current user if from localStorage

    };

    filterByUser(user) {
        console.log('filterByUser, id is: '+user.id);
        this.deals = [];
        this.loading = true;
        this.noDeals = false;
        this.dealService.getFilters(user.id, this.companyService.getCurrentCompanyId());
        this.dealService.getByFilter(user.id, this.companyService.getCurrentCompanyId(), this.selectedTabState);
    }

    stopPropagationNow(e) {
        e.stopPropagation();
    }

    changeTab(type: number, tab:string, event: Event) {
        event.preventDefault();
        this.deals = [];
        this.loading = true;
        this.noDeals = false;
        this.selectedTabState = type;
        this.dealService.getByFilter(this.currentUserId, this.currentCompanyId, type);
        console.log('launching getByFilter, userid is: '+this.currentUserId);
    }

    showProfile(filterUser, e) {
        e.stopPropagation();
        this.router.navigateByUrl('/main/user/' + filterUser.id);
    }

    inviteUser(event: Event, email: string) {
        event.preventDefault();
        this.inviteSubmitAttempt = true;
        if (!!email) {
        this.inviting = true;
            let invite = {
                email: email,
                firm_id: this.currentCompanyId
            };
            this.restangular.all('firms/invite').post(invite).subscribe(
                data => {
                this.inviting = false;
                    this.userInviteModal.hide();
                    this.inviteSubmitAttempt = false;
                    this.inviteEmail = '';
                    this.toast({
                        timeout: 2000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'info',
                        message: 'Member '+email+' was invited'
                    });
                },
                error => {
                this.inviting = false;
                    this.emailError.show();
                    this.inviteSubmitAttempt = false;
                }
            );
        }
    }

    viewDeal(id: number, event: Event) {
        event.preventDefault();
        this.router.navigateByUrl('/main/deal/' + id);
    }

    // /server/deals/47652

    loadDeals() {
        //refresh postponed deals
        //firms/{id}/deals/postponed
        console.log('started loadDeals');
        //if (this.dealService.notLoadingDeals) {
            console.log('currently not loading deals in service');
            this.deals = [];
            this.companyService.getCompanyUsers(this.companyService.getCurrentCompanyId());
            this.dealService.getFilters(this.currentUserId, this.companyService.getCurrentCompanyId());
            this.dealService.getByFilter(this.currentUserId, this.companyService.getCurrentCompanyId(), this.selectedTabState);
            //this.restangular.one('firms/'+this.companyService.getCurrentCompanyId()+'/deals/postponed').customPUT();
        //}
    }

    ngOnInit() {
        //clear stored deals
        console.log('start deal component');
        this.deals = [];
        this.gotDeals = false;
        this.noDeals = false;
        this.loading = true;
        this.active_deals = 0;
        this.postponed_deals = 0;
        this.closed_deals = 0;
        console.log('gettingById= '+this.companyService.gettingById);
        console.log('noCompanies= '+this.companyService.noCompanies);
        if (!this.companyService.noCompanies) {
            if (!this.companyService.gettingById) {
                console.log(this.companyService.getCurrentCompanyId());
                if (!!this.companyService.getCurrentCompanyId() && this.companyService.gotFirmList) {
                    console.log('fetched currentCompanyId : '+this.companyService.getCurrentCompanyId());
                    this.companyService.getById(this.companyService.getCurrentCompanyId());
                    this.companyService.getCompanyUsers(this.companyService.getCurrentCompanyId());
                }
                else {
                    console.log('could not fetch currentCompanyId');
                    this.companyService.companiesObservable.takeUntil(this.ngUnsubscribe).subscribe(data => {
                        this.companyService.getById(this.companyService.getCurrentCompanyId());
                        this.companyService.getCompanyUsers(this.companyService.getCurrentCompanyId());
                    })
                }
            }
            
            
            //update companyTitle each time it changes
            this.companyService.companyObservable.takeUntil(this.ngUnsubscribe).subscribe(value => {
                console.log('launched companyObservable');
                    this.loading = true;
                    this.noDeals = false;
                    this.deals = [];
                    console.log('got currentCompanyId: '+value.firm_id);
                    this.currentCompanyId = value.firm_id;
                    this.currentCompanyTitle = value.title;
                    this.currentUserId = JSON.parse(localStorage.getItem('currentUser')).user_id;
                    if (!this.currentUserId) {
                        this.currentUserId = this.authenticationService.currentUserId;
                    }
                    this.creator = this.companyService.getCurrentCompanyRole() < 3;
                    this.loadDeals();

            });

        }
        else {
            this.router.navigateByUrl('/main/company-create');
        }
        



        this.companyService.companyUsersObservable.takeUntil(this.ngUnsubscribe).subscribe(data => {
            this.filterUsers = data;
        });


        this.dealService.DealCreateObservable.takeUntil(this.ngUnsubscribe).subscribe(value => {
            if (this.currentUserId == JSON.parse(localStorage.getItem('currentUser')).user_id) {
                this.loading = true;
                this.noDeals = false;
                this.deals = [];
                this.loadDeals();
            }
            else {
                console.log('wrong tab, redirecting');
                this.filterByUser({id:JSON.parse(localStorage.getItem('currentUser')).user_id});
            }
        });

        //load deals on init
        this.dealService.DealsObservable.takeUntil(this.ngUnsubscribe).subscribe(value => {
            this.gotDeals = true;
            this.loading = false;
            this.noDeals = false;
            this.dealService.notLoadingDeals = true;
            //this.selectedTabState = this.dealService.selectedTabState;
            //this.currentUserId = this.dealService.selectedUserId;

            console.log('got deals observable value');
            console.log(value);
            if (value.length === 0) {
                this.noDeals = true;
                this.loading = false;
            }
            else {
                this.deals = value;
            }
        });

        this.dealService.FilterObservable.takeUntil(this.ngUnsubscribe).subscribe(value => {
            this.dealService.notLoadingDeals = true;
            this.active_deals = value[0].active_deals;
            this.postponed_deals = value[0].postponed_deals;
            this.closed_deals = value[0].closed_deals;
            console.log('selectedUserId in dealComponent is: '+this.dealService.selectedUserId);
            if (this.dealService.selectedUserId !== 0) {
                this.currentUserId = !!this.dealService.selectedUserId ? this.dealService.selectedUserId : this.currentUserId;
            }
            else {
                this.currentUserId = 0;
            }
        });


    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}

interface Deal {
    contracts: string,
    dateDanger: boolean,
    dateWarning: boolean,
    deal_id: number,
    deal_title: string,
    partner_id: number,
    partner_name: string,
    posts: string,
    timer: any,
    updated_at: string,
    username: string
}
