import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CompanyService} from "../_services/company.service";
import {CompanyContactForm} from "../_models/company-contact-form";
import {CompanyContactErrors} from "../_models/company-contact-errors";
import {DealService} from "../_services/deal.service";
import {CreateContactComponent} from "./create-contact.component";

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './contact.scss', '../inbox/inbox.scss']
})

export class ContactComponent implements OnInit {
    contactForm: CompanyContactForm;
    contactFormErrors: CompanyContactErrors;
    private companyId: number;
    private currentCompany: any;
    private matches: any;
    private searchText: string;
    isDataLoaded: boolean = false;
    contacts: any[] = [];
    selectedContact: any;

    @ViewChild('createContactComponent') private createContactComponent: CreateContactComponent;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private companyService: CompanyService,
                private dealService: DealService) {}

    ngOnInit() {
        this.contactForm = new CompanyContactForm();
        this.contactFormErrors = new CompanyContactErrors();
        this.matches = [];
        this.searchText = '';

        this.route.parent.params.subscribe(params => {
            this.companyId = params["id"];
            this.companyService.getById(this.companyId);

        });

        this.route.params.subscribe(params => {
            let contactId = params["contactId"];
            if (contactId) {
                this.companyService.getContactById(contactId).subscribe(
                    data => {
                        console.log(data);
                        this.selectedContact = data;
                        this.dealService.setTimers(this.selectedContact.deals);
                    },
                );
            }
        });

        this.companyService.companyContactsObservable.subscribe(data => {
            this.contacts = data;
            this.isDataLoaded = true;
        });

        this.companyService.getCompanyContacts(this.companyId);

        this.companyService.companyObservable.subscribe(data => {
            this.currentCompany = data;
        });

        this.companyService.partnersSuggestionObservable.subscribe(data => {
            this.matches = data;
        });
    }

    search(text: string) {
        this.searchText = text;
    }

    backToDeals() {
        //this.companyService.storeCompany(this.currentCompany);
        this.router.navigateByUrl('/main/deals/');
    }

    viewContact(contactId: number) {
        console.log('View Contact number ' + contactId);
        this.companyService.getContactById(contactId).subscribe(
            data => {
                this.selectedContact = data;
                this.dealService.setTimers(this.selectedContact.deals);
            },
            error => {}
            );
    }

    showCreateContactForm() {
        this.createContactComponent.showCreateContactForm(this.companyId);
    }

    showUpdateContactForm($event) {
        this.createContactComponent.showUpdateContactForm($event, this.selectedContact, this.companyId);
    }

    viewDeal($event, dealId: number) {
        $event.stopPropagation();
        this.router.navigate(['main', 'deal', dealId]);
    }
}
