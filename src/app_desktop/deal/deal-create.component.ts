import { Subject } from 'rxjs/Subject';
import {Component, OnChanges, ViewEncapsulation, Input, ElementRef, Renderer, ViewChild, EventEmitter, Output} from '@angular/core';

import {FormGroupDirective} from '@angular/forms';

import {DealService} from "../_services/deal.service";

import {CompanyService} from "../_services/company.service";
import { Restangular } from 'ng2-restangular';

@Component({
    selector: 'deal-create',
    templateUrl: 'deal-create.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', 'deal-creator.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class DealCreate implements OnChanges {
    matches: Match[];
    newDeal: any = {};
    oldPartnerName: string = "";
    oldTitle: string = "";
    newPartner: any = {};
    title: string;
    showAutocomplete: boolean = false;
    submitAttempt: boolean = false;
    focusedIdx: number = 0;
    @Input() submit: any;
    @Input() inputTitle: string;
    @Input() inputPartnerName: string;
    @Input() buttonCaption: string;
    @Output() formSubmit: EventEmitter<any> = new EventEmitter();
    @ViewChild("partner") partnerName: any;
    @ViewChild("titleInput") titleInput: any;
    @ViewChild('f') form: FormGroupDirective;
    @ViewChild('partnerEmpty') partnerEmpty: any;
    @ViewChild('titleEmpty') titleEmpty: any;

    private ngUnsubscribe: Subject<any> = new Subject<any>();

    constructor(
        private companyService: CompanyService,
        private restangular: Restangular,
        private dealService: DealService,
        private renderer: Renderer
    ) {
        this.matches = [];
        this.newDeal = {};
        this.newDeal.firm_id = this.companyService.getCurrentCompanyId();
        this.companyService.companyObservable.takeUntil(this.ngUnsubscribe).subscribe(data=> {
          this.matches = [];
          this.newDeal = {};
          this.form.form.reset();
          this.titleEmpty.hide();
          this.partnerEmpty.hide();
          this.submitAttempt = false;
          this.showAutocomplete = false;
          if (this.form.control['titleName']) {
              this.form.control['titleName'].markAsUntouched();
          }
          if (this.form.control['partnerName']) {
              this.form.control['partnerName'].markAsUntouched();
          }
        });
    }

    pick (label, id: number) {
        this.newDeal.name = label;
        this.newDeal.partner_id = id;
        this.focusedIdx = -1;
    }

    showMatches() {
        if (this.matches.length> 1) {
            this.showAutocomplete = true;
        }
    }

    handleKeyEvent(event: KeyboardEvent, value: string) {
        //get to api for matches
        if (value.length>0) {
            switch (event.keyCode) {
                case 13 : {
                    if (this.showAutocomplete) {
                        event.preventDefault();
                        if (this.focusedIdx > -1) {
                            this.pick(this.matches[this.focusedIdx].name, this.matches[this.focusedIdx].id);
                        }
                        this.showAutocomplete = false;
                    }
                }
                break;
                case 38 : {
                    event.preventDefault();
                    if (this.focusedIdx>-1) {
                      this.focusedIdx--;
                    }
                }
                break;
                case 40 : {
                    event.preventDefault();
                    if (this.focusedIdx < this.matches.length-1){
                        this.focusedIdx++;
                    }
                }
                break;
                case 27 : {
                    this.clear();
                }
                break;
                case 9 : {
                    this.clear();
                }
                break;
                default: {
                    this.focusedIdx = -1;
                    this.newDeal.partner_id = null;
                    this.restangular.one('partners/partner-autocomplite/'+ this.companyService.getCurrentCompanyId() +'/'+ value).get().subscribe(
                        data => {
                            this.matches = data;
                            if (this.matches.length> 0) {
                                this.showAutocomplete = true;
                            }
                        },
                        error => {
                        }
                    );
                }
                break;
            }

        }
        else {
            this.matches = [];
            this.showAutocomplete = false;
        }

    }

    save() {
        console.log('saving new deal');
        console.log(this.newDeal);

        if (this.submit == 'update') {
            //newDeal: any, firmId: number, dealId: number, partnerId: number
            this.dealService.updateDeal(this.newDeal);
        }
        else {
            //newDeal: any, firmId: number, dealId: number, partnerId: number, ownerId: number
            this.dealService.createDeal(this.newDeal);
            setTimeout(()=> {
                this.newDeal = {};
                this.title = "";
                this.matches = [];
                this.showAutocomplete = false;
                this.form.form.reset();
                this.submitAttempt = false;
                this.renderer.invokeElementMethod(this.partnerName.nativeElement, 'focus');
                this.titleEmpty.hide();
                this.titleEmpty.hide();
                if (this.form.control['titleName']) {
                    this.form.control['titleName'].markAsUntouched();
                }
            }, 100);
        }
        //this.partnerName.nativeElement;
        this.formSubmit.emit(null);

    }

    clear () {
        setTimeout(()=> {
            this.showAutocomplete = false;
        }, 100);
    }

    createDeal(event: Event) {
        event.preventDefault();
        if (!this.title) {
          this.titleEmpty.show();
        }
        if (!this.newDeal.name) {
          this.partnerEmpty.show();
        }
        this.submitAttempt = true;
        this.matches = [];
        this.newDeal.title = this.title;
        this.newDeal.partner_name = this.newDeal.name;
        this.newDeal.firm_id = this.companyService.getCurrentCompanyId();
        //if it is creating and there is no partner found then we should create new partner
        //else should set 0 as partner_id
        if (!!this.newDeal.title && !!this.newDeal.partner_name) {
            console.log('creating deal');
            console.log(this.newDeal);
            if (!this.newDeal.partner_id) {
                console.log('partner id was not found');
                this.restangular.one('partners/partner-autocomplite/'+ this.companyService.getCurrentCompanyId() +'/'+ this.newDeal.name).get().subscribe(
                    data => {
                        if (data.length && this.newDeal.name == data[0].name) {
                            this.newDeal.partner_id = data[0].id;
                            this.save();
                        }
                        else {
                            this.newPartner.name = this.newDeal.name;
                            this.newPartner.firm_id = this.companyService.getCurrentCompanyId();
                            this.restangular.all("partners").customPOST(this.newPartner).subscribe(
                                data => {
                                    this.newDeal.partner_id = data.partner_id;
                                    console.log(this.newDeal);
                                    this.save();
                                }
                            );
                            /*if (this.submit == 'update') {
                                //this.newDeal.partner_id = 0;
                            }
                            else {
                                this.restangular.all("partners").customPOST(this.newPartner).subscribe(
                                    data => {
                                        this.newDeal.partner_id = data.partner_id;
                                        console.log(this.newDeal);
                                        this.save();
                                    }
                                );
                            }*/

                        }
                    }
                );
            }
            else {
                console.log(this.newDeal);
                this.save();
            }
        }

    }

    ngOnChanges (changes: any) {
        if (!!this.inputPartnerName && this.inputPartnerName !== this.oldPartnerName) {
            this.newDeal.name = this.oldPartnerName = this.inputPartnerName;
        }
        if (!!this.inputTitle && this.inputTitle !== this.oldTitle) {
            this.title = this.oldTitle = this.inputTitle;
        }
    }
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


}

interface Match {
    id: number;
    name: string
}
