/**
 * Created by adrian on 5/14/17.
 */
import { UIService } from './../_services/ui.service';
import {Component, ViewChild, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {CompanyService} from "../_services/company.service";
import {DealService} from "../_services/deal.service";
import {CompanyContactForm} from "../_models/company-contact-form";
import {CompanyContactErrors} from "../_models/company-contact-errors";

@Component({
    selector: 'contact-creator',
    templateUrl: './create-contact.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './contact.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class CreateContactComponent {

    contactForm: CompanyContactForm = new CompanyContactForm();
    contactFormErrors: CompanyContactErrors = new CompanyContactErrors();
    private companyId: number;
    private currentForm: CurrentForm = {
        header: ''
    };
    private matches: any = [];
    isDataLoaded: boolean;
    contacts: any[];
    selectedContact: any;

    @ViewChild ('contactsForm') private contactsFormModal: any;
    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private uiService: UIService,
        private dealService: DealService,
        private companyService: CompanyService,
    ) {
        this.companyService.partnersSuggestionObservable.subscribe(data => {
            this.matches = data;
        });
    };

    suggestPartners(partnersName: string) {
        this.companyService.getPartnersSuggestions(partnersName, this.companyId);
    }

    pickPartner(partnerName: string) {
        this.contactForm.companyName = partnerName;
        this.companyService.getPartnersSuggestions('', this.companyId);
    }

    showCreateContactForm(companyId) {
        this.currentForm.header = 'Create contact';
        this.companyId = companyId;
        this.contactForm = new CompanyContactForm();
        this.contactsFormModal.show();
    }

    showUpdateContactForm($event, selectedContact, companyId) {
        $event.preventDefault();
        this.selectedContact = selectedContact;
        this.companyId = companyId;

        this.currentForm.header = 'Update contact';
        this.contactForm = new CompanyContactForm(this.selectedContact);
        console.log(this.contactForm);
        this.contactsFormModal.show();
    }

    hideContactForm() {
        this.contactsFormModal.hide();
        this.contactFormErrors = new CompanyContactErrors();
    }

    updateContact(contactId?: number) {

        let errors = this.contactForm.validateContactForm();

        if (!errors.length) {
            this.companyService.updateCompanyContact(this.contactForm, this.companyId, 0, contactId).then(
                data => {
                    console.log('updated');
                    this.companyService.getCompanyContacts(this.companyId);
                    this.hideContactForm();
                    this.companyService.getContactById(contactId).subscribe(
                        data => {
                            this.selectedContact = data;
                            this.dealService.setTimers(this.selectedContact.deals);
                        },
                        error => {}
                    );
                },
                error => {
                    let errorData = JSON.parse(error._body);
                    if (errorData.length) {
                        errorData.forEach(data => {
                            this.contactFormErrors[data.field] = data.message;
                        });
                    }
                }
            )
        } else {
            errors.forEach(data => {
                this.contactFormErrors[data.field] = data.message;
            })
        }
    }

    validateDataField(patternName: string, field: string, value: string) {
        let error = this.contactForm.validateDataField(patternName, field, value);

        if (JSON.stringify(error).length > 4) {
            error.forEach(data => {
                this.contactFormErrors[data.field] = data.message;
            });
        }
    }

    clearError(field: string) {
        if (this.contactFormErrors[field]) {
            delete this.contactFormErrors[field];
        }
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }
}

interface CurrentForm {
    header: string;
}