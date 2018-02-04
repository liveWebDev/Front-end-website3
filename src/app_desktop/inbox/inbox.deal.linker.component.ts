/**
 * Created by adrian on 5/14/17.
 */
import { UIService } from './../_services/ui.service';
import {Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnDestroy} from '@angular/core';
import {EmailService} from "../_services/email.service";
import {LinkNewDeal} from "../_models/link-new-deal";
import {isNullOrUndefined} from "util";
import {CompanyService} from "../_services/company.service";
import {DealService} from "../_services/deal.service";
import {Router} from "@angular/router";
import {GetCounteragentEmailPipe} from "../_pipes/get-counteragent-email-pipe/get-counteragent-email-pipe";
import {ExtractEmailPipe} from "../_pipes/extract-email-pipe/extract-email-pipe";
import {DealLinkerContactForm} from "../_models/deal-linker-contact-form";

@Component({
    selector: 'inbox-deal-linker',
    templateUrl: './inbox.deal.linker.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './inbox.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class InboxDealLinkerComponent implements OnDestroy {
    currentEmailId: number;
    searchText: string;
    today: number;
    thread: any;
    isCreateDeal: boolean;
    newDeal: LinkNewDeal;
    companySuggestionList: any[];
    showCompanySuggestion: boolean;
    selectedCompany: any;
    matches: any[];
    partnerMatches: any[];
    errors: {} = {};

    selectedThread: any;
    selectedNewPartner: any;
    selectedNewPartnerNameText: string;
    selectedNewDealTitle: string;
    selectedNewDeal: number;
    newDealInput: string;
    linkErrors: any;
    creating: boolean = false;
    private alive: boolean = true;
    existingContacts: any[] = [];
    suggestedContact: any = false;
    contactForm: DealLinkerContactForm = new DealLinkerContactForm();

    @ViewChild ('dealLinkModal') private dealLinkModal: any;
    @ViewChild ('dealOrPartner') private dealOrPartner: any;
    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private emailService: EmailService,
        private router: Router,
        private companyService: CompanyService,
        private dealService: DealService,
        private uiService: UIService,
    ) {
        this.showCompanySuggestion = false;
        this.matches = [];
        this.partnerMatches = [];

        this.companyService.dealSugestionObservable.subscribe(data => {
            this.matches = data;
        });

        this.companyService.partnersSuggestionObservable.subscribe(data => {
            this.partnerMatches = data;
        });
    };

    pickCompany(title: string, id: number) {
        this.selectedCompany = {
            title: title,
            id: id
        };

        this.contactForm.companyName = title;
        this.toggleCompanySuggestion(false);
    }

    watchCompanySuggestions($event) {
        $event.stopPropagation();
        this.toggleCompanySuggestion();
    }

    toggleCompanySuggestion(flag?: boolean) {
        if (!isNullOrUndefined(flag)) {
            this.showCompanySuggestion = flag;
        } else {
            this.showCompanySuggestion = !this.showCompanySuggestion;
        }
    }

    closeDealModal() {
        this.dealLinkModal.hide();
    }

    pickDeal(item: any) {
        this.selectedNewDealTitle = item.partner_name + " | " + item.deal_title;
        this.matches = [];
        this.selectedNewDeal = item.deal_id;
    }

    pickPartner(item: any) {
        this.selectedNewPartnerNameText = item.name;
        this.selectedNewPartner = item;
        this.partnerMatches = [];
    }

    suggestDealByDealOrPartner(condition?: string) {
        if (condition) {
            this.companyService.getDealSuggestion(this.selectedCompany.id, condition);
        } else {
            this.matches = [];
        }
    }

    suggestPartner(condition: string) {
        if (condition) {
            this.companyService.getPartnersSuggestions(condition, this.selectedCompany.id);
        } else {
            this.partnerMatches = [];
        }
    }

    addAContactFrom(emailData?: any) {
        if (emailData) {
            this.companyService.findContactsByEmail(emailData.email).takeWhile(() => this.alive).subscribe(data => {
                this.existingContacts = data;
                this.suggestedContact = emailData;

                // this.currentEmailId = currentInboxId;
                this.newDealInput = '';
                // this.selectedThread = thread;
                this.companySuggestionList = this.companyService.getCompanyList();
                this.selectedCompany = this.companySuggestionList.length ? this.companySuggestionList[0] : {};
                this.dealLinkModal.show();

                this.contactForm = new DealLinkerContactForm({
                    contact_name: emailData.name,
                    partner_name: this.selectedCompany.title,

                    info: [{
                        name: 'email',
                        value: emailData.email
                    }]
                });
            }, error => {
                console.log(error);

                this.toast({
                    timeout: 15000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'alert',
                    message: 'Couldn\'t fetch current contact data. Please, try again later'
                });
            });

        } else {
            // this.currentEmailId = currentInboxId;
            this.newDealInput = '';
            // this.selectedThread = thread;
            this.companySuggestionList = this.companyService.getCompanyList();
            this.selectedCompany = this.companySuggestionList.length ? this.companySuggestionList[0] : {};
            this.dealLinkModal.show();
        }
    }

    linkDealForm(thread: any, currentInboxId: number, emailData?: any, currentEmail?: string) {

        if (emailData) {
            this.companyService.findContactsByEmail(emailData.email).takeWhile(() => this.alive).subscribe(data => {
                this.existingContacts = data;
                this.suggestedContact = emailData;
                this.prepareAndShowForm(thread, currentInboxId);
                this.contactForm = new DealLinkerContactForm({
                    contact_name: emailData.name,
                    partner_name: this.selectedCompany.title,

                    info: [{
                        name: 'email',
                        value: emailData.email
                    }]
                });
            }, error => {
                console.log(error);

                this.toast({
                    timeout: 15000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'alert',
                    message: 'Couldn\'t fetch current contact data. Please, try again later'
                });
            });

        } else {
            this.prepareAndShowForm(thread, currentInboxId);
            if (currentEmail) {
                this.contactForm = new DealLinkerContactForm({
                    partner_name: this.selectedCompany.title,

                    info: [{
                        name: 'email',
                        value: new ExtractEmailPipe().transform(
                                    new GetCounteragentEmailPipe().transform([thread.emails[0].from, thread.emails[0].to], [currentEmail])
                                )
                    }]
                });
            }
        }
    }

    protected prepareAndShowForm(thread: any, currentInboxId: number) {
        this.currentEmailId = currentInboxId;
        this.newDealInput = '';
        this.selectedThread = thread;
        this.companySuggestionList = this.companyService.getCompanyList();
        this.selectedCompany = this.companySuggestionList.length ? this.companySuggestionList[0] : {};
        this.dealLinkModal.show();
    }

    linkDeal() {
        this.contactForm.generalCheck();

        if (this.selectedNewDeal && !this.contactForm.hasErrors()) {

            this.creating = true;

            this.companyService.updateCompanyContact(this.contactForm, this.selectedCompany.id, this.selectedNewPartner.name).then(
                data => {
                    console.log('updated');

                    this.toast({
                        timeout: 2000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'info',
                        message: 'Contact data was successfully updated'
                    });
                },
                error => {
                    console.log(JSON.parse(error._body));

                    this.toast({
                        timeout: 15000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'alert',
                        message: 'Couldn\'t create contact record. Please, try again later'
                    });
                }
            );

            if (this.selectedThread) {
                this.newDeal = new LinkNewDeal(this.currentEmailId, this.selectedThread.slag, this.selectedNewDeal);
                this.emailService.linkDeal(this.newDeal).subscribe(
                    data => {
                        this.toast({
                            timeout: 2000,
                            id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                            type: 'info',
                            message: 'Thread was successfully linked with deal'
                        });
                        this.creating = false;
                        this.dealLinkModal.hide();
                        this.router.navigate(['main', 'deal', this.selectedNewDeal]);
                    }, error => {
                        this.creating = false;
                        console.log(error);
                        this.linkErrors = error;
                    }
                );
            } else {
                this.creating = false;
                this.dealLinkModal.hide();
            }

        } else {

            this.linkErrors = 'there is no selected deal';
        }
    }

    createAndLink() {
        this.contactForm.generalCheck();

        if (!this.contactForm.hasErrors()) {
            this.creating = true;

            if (this.selectedNewPartner && this.selectedNewPartner.id) {
                this.createAndLinkRequest();
                console.log(this.selectedNewPartner);

            } else {
                this.companyService
                    .getPartnersSuggestionsRequest(this.selectedNewPartnerNameText, this.selectedCompany.id)
                    .subscribe(
                        data => {
                            if (data.length == 0) {
                                this.companyService.createNewPartner(this.selectedNewPartnerNameText, this.selectedCompany.id).subscribe(
                                    data => {
                                        this.selectedNewPartner = {
                                            id: data.partner_id,
                                            name: this.selectedNewPartnerNameText,
                                        };
                                        this.createAndLinkRequest();
                                    }
                                );
                            } else if (data.length == 1) {
                                this.pickPartner(data[0]);
                                this.createAndLinkRequest();
                            }
                        }
                    );
            }
        }
    }

    createAndLinkRequest() {

        this.dealService.createDealRaw({
            title: this.newDealInput,
            firm_id: this.selectedCompany.id,
            partner_id: this.selectedNewPartner.id
        }).subscribe(
            data => {
                this.creating = false;
                this.selectedNewDeal = data.id;
                this.linkDeal();
            },
            errror=> {
                this.creating = false;
            }
        );
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }

    ngOnDestroy() {
        this.alive = false;
    }
}