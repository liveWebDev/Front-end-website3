/**
 * Created by adrian on 5/14/17.
 */
import { UIService } from './../_services/ui.service';
import {Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {EmailService} from "../_services/email.service";
import {LinkNewDeal} from "../_models/link-new-deal";
import {isNullOrUndefined} from "util";
import {CompanyService} from "../_services/company.service";
import {DealService} from "../_services/deal.service";
import {ActivatedRoute, Router} from "@angular/router";
import {InboxCompanyContactForm} from "../_models/inbox-company-contact-form";
import {SignatureService} from "../_services/signature.service";
import {Signature} from "../_models/signature";

@Component({
    selector: 'signature-editor',
    templateUrl: './signature.edit.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './inbox.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class SignatureEditComponent implements OnDestroy, OnInit {
    currentEmailId: number;
    emailsList: SignatureSummaryItem[];
    signatureList: SignatureItem[];
    currentSignature: Signature;

    private alive: boolean = true;

    @Output() toastMessage:EventEmitter<any> = new EventEmitter();
    @ViewChild('signatureEditorModal') private signatureEditorModal: any;

    constructor(
        private uiService: UIService,
        private signatureService: SignatureService,
        private route: ActivatedRoute,
    ) {
        this.currentSignature = new Signature();
    };

    ngOnDestroy() {
        this.alive = false;
    }

    ngOnInit() {
        this.signatureService.currentSignaturesSummary.takeWhile(() => this.alive).subscribe(data => {
                this.emailsList = data;
            }
        );

        this.signatureService.currentSignaturesList.takeWhile(() => this.alive).subscribe(data => {
                this.signatureList = data;
            }
        );

        this.signatureService.currentSignature.takeWhile(() => this.alive).subscribe(data => {
                this.currentSignature = new Signature(data);
            }
        );

        //load data when router initialized
        this.route.params.takeWhile(() => this.alive).subscribe(params => {
            this.currentEmailId = params["id"];
            this.signatureService.getSignaturesByEmail(this.currentEmailId);
        });

        this.signatureService.getSignaturesSummary();
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }

    openWindow(emailID: number) {
        this.signatureEditorModal.show();

        if (emailID) {
            this.currentEmailId = emailID;
        }
    }

    loadSignatureList(emailID: number) {
        this.currentEmailId = emailID;
        this.signatureService.getSignaturesByEmail(emailID);
    }

    selectSignature(signature: SignatureItem) {
        this.currentSignature = new Signature(signature);
    }

    addSignature(email_id?: number) {
        let emailID = email_id ? email_id : this.currentEmailId;

        this.signatureService.addSignature(emailID).subscribe(data => {
            this.toast({
                timeout: 5000,
                type: 'info',
                message: 'New signature added'
            });

            this.signatureService.getSignaturesSummary();

            this.signatureService.getSignaturesByEmail(emailID);
            this.signatureService.getSignature(data.id);
        }, error => {
            this.toast({
                timeout: 5000,
                type: 'alert',
                message: 'Can`t create new signature record. Please, try again later'
            });
        })
    }

    updateSignature() {
        this.signatureService.updateSignature(this.currentSignature).subscribe(data => {
            this.signatureService.getSignature(data.id);
            this.signatureService.getSignaturesByEmail(data.email_id);

            this.toast({
                timeout: 5000,
                type: 'info',
                message: 'Signature successfully updated'
            });
        }, error => {
            this.toast({
                timeout: 5000,
                type: 'alert',
                message: 'Can`t update signature record. Please, try again later'
            });
        })
    }

    removeSignature() {
        if (this.currentSignature.id) {
            this.signatureService.removeSignature(this.currentSignature.id).subscribe(data => {
                this.signatureService.getSignaturesByEmail(this.currentEmailId);
                this.signatureService.getSignaturesSummary();
                this.currentSignature = new Signature();

                this.toast({
                    timeout: 5000,
                    type: 'info',
                    message: 'Signature successfully removed'
                });
            }, error => {
                this.toast({
                    timeout: 5000,
                    type: 'alert',
                    message: 'Can`t remove signature record. Please, try again later'
                });
            })
        } else {
            this.toast({
                timeout: 5000,
                type: 'alert',
                message: 'Please, select signature to remove'
            });
        }
    }
}

interface SignatureSummaryItem {
    id: number,
    email_address: string,
    count: number
}

interface SignatureItem {
    id: number,
    user_id?: number,
    email_id: number,
    name: string,
    text: string
}