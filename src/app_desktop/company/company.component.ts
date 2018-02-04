import { UIService } from './../_services/ui.service';
/**
 * Created by adrian on 5/14/17.
 */
import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';

import {User} from "../_models/user";

import { Restangular } from 'ng2-restangular';

import {CompanyService} from "../_services/company.service";
import {UserService} from "../_services/user.service";
import {DealService} from "../_services/deal.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CompanyInfo} from "../_models/company-info";
import {ModalModule} from "ngx-bootstrap";
import {CompanyUsersPipe} from "../_pipes/company-users-pipe/company-users-pipe";
import {error} from "util";



@Component({
    templateUrl: './company.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './company.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [UserService],
    // pipes: [CompanyUsersPipe],
})

export class CompanyComponent {
    user: User;
    companyId: number;
    currentCompany: CurrentCompany;
    isDataLoaded: boolean;
    roles: string[];
    users: User[];
    currentUserId: number;
    userRole: number;
    ownerId: number;
    companyInfoModal: CompanyInfo;
    dealsToReassign: {}[];
    usersToReassign: User[];
    filteredUsers: User[];
    inviteEmail: string;
    previousDealsOwner: number;
    removedUserName: string;
    private searchText: string;
    private companyInfoErrors: any;
    inviteSubmitAttempt: boolean = false;
    inviting: boolean = false;

    @ViewChild ('companyInfoModalWindow')
    private companyInfoModalWindow: any;

    @ViewChild ('dealsReassignModal') private dealsReassignModal: any;
    @ViewChild ('inviteModalWindow') private inviteModalWindow: any;
    @ViewChild ('removingWarning') private removingWarning: any;
    @ViewChild('emailError') emailError: any;
    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private companyService: CompanyService,
        private userService: UserService,
        private dealService: DealService,
        private route: ActivatedRoute,
        private restangular: Restangular,
        private router: Router,
        private uiService: UIService
    ) {
        this.currentUserId = JSON.parse(localStorage.getItem('currentUser')).user_id;
        this.companyInfoModal = new CompanyInfo('', '');
        this.searchText = '';
        this.users = this.filteredUsers = this.companyInfoErrors = [];

        this.route.params.subscribe(params => {
            this.companyId = params["id"];
            this.companyService.getById(this.companyId);
            this.companyService.getCompanyUsers(this.companyId);
        });

        this.companyService.companyObservable.subscribe(
            data => {
                this.currentCompany = data;
                this.companyInfoModal = new CompanyInfo(data.title, data.description);
            });

        this.companyService.companyUsersObservable.subscribe(data => {
            this.users = this.filteredUsers = data;
            this.userRole = this.companyService.currentCompanyRole;
            this.users.map((index)=> {
                if (index.role == 1) {
                    this.ownerId = index.id;
                }
            })
        });

        this.isDataLoaded = false;
        this.roles = ['Founder', 'Manager', 'Sales']



    };

    filterUsers(value: string) {
        this.searchText = value;
    }

    ngOnInit() {
    }

    changeRole(role: number, userId: number, event: Event) {
        event.preventDefault();
        let companyId = JSON.parse(localStorage.getItem('currentFirm')).id;
        this.restangular.one("firms/"+companyId+"/users/"+userId+"/roles/"+role).patch().subscribe(data=>{
            this.companyService.getCompanyUsers(this.companyId);
            this.toast({
                timeout: 2000,
                id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                type: 'info',
                message: 'Role was successfully changed.'
            });
        });
        //PATCH firms/{id}/users/{id}/roles/{new_role}
    }

    //firms/{id}/users/{id}/roles DELETE
    removeUser (userId: number) {
        let companyId = JSON.parse(localStorage.getItem('currentFirm')).id;
        //if it is self-deleting
        //firms/{id}
        if (userId == this.currentUserId) {
            this.restangular.one('firms/'+this.companyId).remove().subscribe(
                data => {
                    this.companyService.getByUserId();
                    this.companyService.companiesObservable.subscribe(
                         data => {
                            this.router.navigateByUrl('/main/deal');
                         }
                     );
                },
                error => {
                    if (JSON.parse(error._body).error == 'User has deals') {
                        this.dealsReassignModal.show();
                        this.dealsToReassign = [];
                        this.usersToReassign = this.users;
                        this.usersToReassign = this.usersToReassign.filter(item => item.id !== userId);
                    }
                }
            )
        }
        //if deleting issues by other user
        else {
          this.restangular.one("firms/"+companyId+"/users/"+this.previousDealsOwner+"/roles").remove().subscribe(
                data=>{
                    this.companyService.getCompanyUsers(this.companyId);
                    this.toast({
                        timeout: 2000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'info',
                        message: this.removedUserName+' was removed from company.'
                    });
                },
                error => {
                    if (JSON.parse(error._body).error == 'User has deal(s)') {
                        this.dealsReassignModal.show();
                        this.dealsToReassign = [];
                        this.usersToReassign = this.users;
                        //it should not be possible to reassign deals to deleting user
                        this.usersToReassign = this.usersToReassign.filter(item => item.id !== userId);
                        if (this.userRole == 2) {
                          //if there is more than 2 users in firm then should be able to reassign to any user except owner
                          // if there is exactly owner, manager and deleted user then should be able to reassign to owner
                          if (this.users.length > 2) {
                            this.usersToReassign = this.usersToReassign.filter(item => item.id !== this.ownerId);
                          }
                        }
                    }
                });
        }
    }



    kickAss (user: any, event: Event) {
        event.preventDefault();
        this.previousDealsOwner = user.id;
        this.removedUserName = user.username;
        this.removeUser(this.previousDealsOwner);
    }

    //PUT firms/{id}/deals/owners
    reassign (newOwner: number) {
        this.dealsReassignModal.hide();
        let companyId = JSON.parse(localStorage.getItem('currentFirm')).id;
        this.restangular.one("firms/"+companyId+"/deals/owners").customPUT({new_owner: newOwner, current_owner: this.previousDealsOwner}).subscribe(
            data => {
                this.removeUser(this.previousDealsOwner);
            }
        );
    }

    updateCompanyInfo() {
        console.log('Submit');

        this.companyService.updateCompanyInfo(this.companyId, this.companyInfoModal)
            .subscribe(
                data => {
                    console.log('updated');
                    this.companyInfoModalWindow.hide();
                    this.companyService.getById(this.companyId);
                    this.toast({
                        timeout: 2000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'info',
                        message: 'Company info was changed.'
                    });
                },
                error => {
                    JSON.parse(error._body).forEach(data => {
                        this.companyInfoErrors[data.field] = data.message;
                        console.log(this.companyInfoErrors);
                    })
                });
    }

    search(text: string) {
        this.searchText = text;
    }

    backToDeals() {
        //this.companyService.storeCompany(this.currentCompany);
        this.router.navigateByUrl('/main/deals/');
    }

    inviteUser(event: Event, email: string) {
        event.preventDefault();
        this.inviteSubmitAttempt = true;
        if (!!email) {
        this.inviting = true;
            let invite = {
                email: email,
                firm_id: this.companyId
            };
            this.restangular.all('firms/invite').post(invite).subscribe(
                data => {
                this.inviting = false;
                    this.inviteModalWindow.hide();
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

    removeCompany() {
        console.log('try to delete the company');
        if (this.userRole == 1) {
            this.companyService.removeCompany(this.companyId).subscribe(
                data => {
                    this.companyService.getByUserId();
                    console.log('successfully deleted company');
                    localStorage.removeItem('currentFirm');
                    this.companyService.companiesObservable.subscribe(data=> {
                        this.router.navigateByUrl('/main/deal');
                    });
                }, error => {
                });
        }
        else {
             this.previousDealsOwner = this.currentUserId;
             this.removeUser(this.previousDealsOwner);
             this.removingWarning.hide();
        }
    }
    toast(data: any) {
        this.uiService.toastMessage(data);
    }
}

interface CurrentCompany {
    id: number,
    title: string,
    description: string,
    creator: number,
    created_at: string,
    updated_at: string,
}
