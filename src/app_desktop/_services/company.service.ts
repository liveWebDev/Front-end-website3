/**
 * Created by adrian on 5/15/17.
 */
import { Injectable } from '@angular/core';
import { Restangular } from 'ng2-restangular';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {CompanyInfo} from "../_models/company-info";

@Injectable()
export class CompanyService {
    currentCompanyUsersCount: number;
    currentCompanyId: number;
    currentCompanyRole: number;
    currentCompanyRoleId: number;
    currentCompanyTitle: string;
    noCompanies: boolean = false;
    companyUsers: User[];
    ownCompanies: Company[];
    invitedCompanies: Company[];
    gettingById: boolean = false;
    gotFirmList: boolean = false;
    public companiesObservable = new Subject<any>();
    public companyObservable = new Subject<any>();
    public companyUsersObservable = new Subject<any>();
    public partnersSuggestionObservable = new Subject<any>();
    public companyContactsObservable = new Subject<any>();
    public dealContactsObservable = new Subject<any>();
    public removedCompaniesObservable = new Subject<any>();
    public dealSugestionObservable = new Subject<any>();
    public companySearchDataObservable = new Subject<any>();

    //flag method that will fire appropriate function in main component
    companiesLoaded(val) {
        this.companiesObservable.next(val);
    }

    storeCompany(company) {
        localStorage.setItem('currentFirm', JSON.stringify({ id: company.id, title: company.title }));
    }

    suggestPartners(data) {
        this.partnersSuggestionObservable.next(data);
    }

    updateContacts(data) {
        this.companyContactsObservable.next(data);
    }

    updateRemovedCompanies(data) {
        this.removedCompaniesObservable.next(data);
    }

    updateDealSuggestion(data) {
        this.dealSugestionObservable.next(data);
    }

    //flag method that will fire appropriate function in main component
    companyLoaded(val) {
        this.companyObservable.next(val);
    }

    companyUsersLoaded(val) {
        this.companyUsersObservable.next(val);
    }

    constructor(
        private restangular: Restangular
    ) {
    }

    getCompanyContacts(companyId: number) {
        return this.restangular.one('contacts/get-contacts-firms/' + companyId).get().subscribe(data => {
            this.updateContacts(data);
        });
    }

    getDealContacts(companyId: number, dealId: number) {

        this.restangular.one('contacts/get-contacts-deal/' + companyId + '/' + dealId).get().subscribe(
            data => {
                let fetched = [];

                for (let key in data) {
                    let item = data[key];

                    if (parseInt(key).toString() == key) {
                        let fields = [];
                        for (let key in item.contact_info) {
                            fields.push({key: key, value: item.contact_info[key]});
                        }

                        console.log(item);
                        item.fields = fields;

                        fetched.push(item);
                    }

                }

                this.dealContactsObservable.next(fetched);
            }
        );

    }

    getContactById(contactId: number) {
        return this.restangular.one('contacts/info-contact/' + contactId).get();
    }

    getCurrentCompanyName() {
        //if there is no title in the service, lookup at the local storage
        if (!!this.currentCompanyTitle) {
            return this.currentCompanyTitle;
        }
        else if (JSON.parse(localStorage.getItem('currentFirm'))) {
            if (JSON.parse(localStorage.getItem('currentFirm')).title) {
                return JSON.parse(localStorage.getItem('currentFirm')).title;
            }
        }
        return null
    }

    getCurrentCompanyId() {
        //if there is no id in the service, lookup at the local storage
        if (!!this.currentCompanyId) {
            return this.currentCompanyId;
        }
        else if (JSON.parse(localStorage.getItem('currentFirm'))) {
            if (JSON.parse(localStorage.getItem('currentFirm')).id) {
                return JSON.parse(localStorage.getItem('currentFirm')).id;
            }
        }
        return null
    }

    getCurrentCompanyRole() {
        //if there is no role in the service, lookup at the local storage
        if (!!this.currentCompanyRole) {
            return this.currentCompanyRole;
        }
        else if (JSON.parse(localStorage.getItem('currentFirm'))) {
            if (JSON.parse(localStorage.getItem('currentFirm')).role) {
                return JSON.parse(localStorage.getItem('currentFirm')).role;
            }
        }
        return null
    }

    getOwnCompanies() {
        return !!this.ownCompanies ? this.ownCompanies : [];
    }

    getInvitedCompanies() {
        return !!this.invitedCompanies ? this.invitedCompanies : [];
    }

    getCompanyUsers(companyId: number) {

        return this.restangular.one('firms/users-into-firms/' + companyId).get().subscribe(
            data => {
                this.companyUsers = data;
                this.currentCompanyUsersCount = data.length;
                let currentUserId = JSON.parse(localStorage.getItem('currentUser')).user_id;
                data.map( (element) => {
                    if (element.id === currentUserId) {
                        this.currentCompanyRole = element.role;
                    }
                });
                setTimeout(()=> {
                  this.companyUsersLoaded(data);
                })
            },
            error => {});
    }

    loadCompany(id:number, title: string) {
        this.currentCompanyTitle = title;
        this.getById(id);
        this.getCompanyUsers(id);
    }


    loadCompanies(data:any) {
        console.log('launched loadCompanies');
        console.log(data);
        if (data.owned_firms.length>0) {
            console.log('found owned firm');
            localStorage.setItem('currentFirm', JSON.stringify({ id: data.owned_firms[0].id, title: data.owned_firms[0].title }));
            this.currentCompanyId = data.owned_firms[0].id;
            this.currentCompanyTitle = data.owned_firms[0].title;
            this.currentCompanyRole = data.owned_firms[0].role;
            this.noCompanies = false;
            this.gotFirmList = true;
            this.companyLoaded(data);
        }
        else if (data.invited_firms.length>0) {
            localStorage.setItem('currentFirm', JSON.stringify({ id: data.invited_firms[0].id, title: data.invited_firms[0].title }));
            this.currentCompanyId = data.invited_firms[0].id;
            this.currentCompanyTitle = data.invited_firms[0].title;
            this.currentCompanyRole = data.invited_firms[0].role;
            this.noCompanies = false;
            this.gotFirmList = true;
            this.companyLoaded(data);
        }
        else {
            this.noCompanies = true;
        }
    }

    getDealSuggestion(companyId: number, query: string) {
        this.restangular.one('emails/search-partner-deals/' + companyId).one(query).get().subscribe(data => {
            this.updateDealSuggestion(data);
        });
        return 0;
    }

    getByUserId() {
        this.restangular.one('firm/index').get().subscribe(data => {
            if (data.owned_firms.length == 0 && data.invited_firms.length == 0) {
                this.noCompanies = true;
            }
            else if (localStorage.getItem('currentFirm')) {
                if (JSON.parse(localStorage.getItem('currentFirm')).id) {
                    this.currentCompanyId = JSON.parse(localStorage.getItem('currentFirm')).id;
                    this.gotFirmList = true;
                    this.noCompanies = false;
                }
                else {
                    this.loadCompanies(data);
                }
            }
            else {
                this.loadCompanies(data);
                this.gotFirmList = true;
            }
            this.ownCompanies = data.owned_firms;
            this.invitedCompanies = data.invited_firms;

            this.companiesLoaded(data.owned_firms);
        }, error => {
        });

    }

    companyGlobalSearch(searchQuery?: string, companyId?: number) {
        if (searchQuery && companyId) {
            this.restangular.one('firms/' + companyId + '/search').get({query: searchQuery}).subscribe(
                data => {
                    this.companySearchDataObservable.next(data);
                }
            );
        } else {
            this.companySearchDataObservable.next({});
        }
    }

    getCompanyList() {
        return this.ownCompanies ? this.ownCompanies.concat(this.invitedCompanies) : [];
    }

    getRemovedCompanies() {
        return this.restangular.one('firms/selected-delete-firms').get().subscribe(data => {
            this.updateRemovedCompanies(data);
        });
    }

    restoreDeletedCompany(companyId: number) {
        return this.restangular.one('firms/rebuild-firm/' + companyId).get();
    }

    getById(id: number) {
        console.log('launched getById');
        this.gettingById = true;
        this.restangular.one('firms', id).get().subscribe(
             data => {
                  localStorage.setItem('currentFirm', JSON.stringify({
                      id: data.firm_id,
                      title: data.title,
                      role: data.role
                  }));
                  this.currentCompanyRole = data.role;
                  this.currentCompanyTitle = data.title;
                  this.currentCompanyId = data.firm_id;
                 // this.currentCompanyRoleId = data[0].role_id;
                 this.companyLoaded(data);
                 this.gettingById = false;
             },
            error => {
                console.log('localstorage firm is unreachable, clearing');
                localStorage.removeItem('currentFirm');
                this.getByUserId();
                this.gettingById = false;
            }
        );
    }

    getPartnersSuggestions(partnersName: string, companyId: number) {
        if (partnersName) {
            this.getPartnersSuggestionsRequest(partnersName, companyId).subscribe(
                data => {
                    this.suggestPartners(data);
                },
                error => {
                    console.log('error while fetching partner');
                }
            );
        } else {
            this.suggestPartners([]);
        }
    }

    findContactsByEmail(email: string) {
        return this.restangular.one('contacts/find-by-email').get({
            email: email
        });
    }

    getPartnersSuggestionsRequest(partnersName: string, companyId: number) {
        return this.restangular.one('partners/partner-autocomplite/'+ companyId +'/'+ partnersName).get();
    }

    checkPartner(partnersName: string, companyId: number) {
        return this.restangular.one('partners/partner-autocomplite/'+ companyId +'/'+ partnersName).get();
    }

    createNewPartner(partnersName: string, firmId: number) {
        return this.restangular.one('partners').customPOST({
            name: partnersName,
            firm_id: firmId,
        });
    }

    // Check is partners with followed name exists. If not - create new one
    // and return his data
    updateCompanyContact(contactForm: any, companyId: number, currentPartnerData: any, contactId?: number) {

        return this.checkPartner(contactForm.companyName ? contactForm.companyName : currentPartnerData, companyId).toPromise()
            .then(data => {
                if (data.length) {
                    return data[0];
                }
                return data;
            })
            .then(data => {
                if (data.id) {
                    return data;
                }
                return this.createNewPartner(contactForm.companyName, companyId).toPromise();
            }).then(partner => {
                let partnerId = '';

                if (partner.partner_id) {
                    partnerId = partner.partner_id;
                } else if (partner.id) {
                    partnerId = partner.id;
                }

                let transferringData = {
                    name: contactForm.name,
                    partner_id: partnerId,
                    firm_id: companyId,
                    position: contactForm.position,
                    fields: contactForm.getFieldArray()
                };

                if (contactId) {
                    return this.restangular.one('contacts' + "/" + contactId).customPUT(transferringData).toPromise();
                } else {
                    return this.restangular.one('contacts').customPOST(transferringData).toPromise();
                }
            });
    }

    updateCompanyInfo(companyId: number, companyInfo: CompanyInfo) {
        return this.restangular.one('firms/' + companyId).customPUT(companyInfo);
    }

    create(title: string, description: string) {
        /*this.restangular.all("partners").customPOST(this.newPartner).subscribe(
            data => {
                this.newDeal.partner_id = data.partner_id;
                this.dealService.createDeal(this.newDeal);
            }
        );*/
        return this.restangular.all("firms").post({title: title, description: description});
    }

    removeCompany(id: number) {
        return this.restangular.one("firms/" + id).remove();
    }

    private handleError(error: any) {
        return Observable.throw(error.json());
    }

}

interface Company {
  id: number,
  firm_id: number,
  hot_deals: string,
  title: string,
}

interface User {
    count_deals: string,
    id: number,
    role: number,
    role_id: number
    username: string
}
