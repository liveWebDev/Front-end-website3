/**
 * Created by adrian on 5/15/17.
 */
import {EventEmitter, Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {Restangular} from "ng2-restangular";
import {Signature} from "../_models/signature";

@Injectable()
export class SignatureService {
    private path = 'emails/signatures/';

    public currentSignaturesSummary: Subject<any> = new Subject();
    public currentSignaturesList: Subject<any> = new Subject();
    public currentSignature: Subject<any> = new Subject();
    // public currentSignature: Subject<any> = new Subject();
    // public currentSignature: Subject<any> = new Subject();

    constructor(private restangular: Restangular) {}

    getSignaturesByEmail(emailID: number) {
        if (emailID) {
            return this.restangular
                .one(this.path + 'find/' + emailID)
                .get()
                .subscribe(data => {
                    this.currentSignaturesList.next(data);
                });
        }
    }

    getSignature(id: number) {
        return this.restangular
            .one(this.path + id)
            .get()
            .subscribe(data => {
                this.currentSignature.next(data);
            });
    }

    getSignaturesSummary() {
        return this.restangular
            .one(this.path + 'summary')
            .get()
            .subscribe(data => {
                this.currentSignaturesSummary.next(data);
            });
    }

    addSignature(emailID: number) {
        return this.restangular
            .one(this.path + 'add')
            .customPOST({
                email_id: emailID
            });
    }

    removeSignature(id: number) {
        return this.restangular
            .one(this.path + id + '/remove')
            .post();
    }

    updateSignature(data: Signature) {
        return this.restangular
            .one(this.path + data.id + '/update')
            .customPOST(data.prepareForTransfer());
    }
}