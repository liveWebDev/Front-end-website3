/**
 * Created by adrian on 6/19/17.
 */
import {CompanyContactField} from "./company-contact-field";
import {forEach} from "@angular/router/src/utils/collection";

export class CompanyContactForm {
    name: string;
    companyName?: string;
    position: string;
    currentContactId?: number;
    emailFields: CompanyContactField[];
    phoneFields: CompanyContactField[];
    skypeFields: CompanyContactField[];
    facebookFields: CompanyContactField[];
    linkedinFields: CompanyContactField[];
    patterns: any;

    fields: CompanyContactField[];

    constructor(data?: any) {

        this.emailFields = [];
        this.phoneFields = [];
        this.skypeFields = [];
        this.facebookFields = [];
        this.linkedinFields = [];

        let initialFields = [
            "email",
            "phone",
            "skype",
            "facebook",
            "linkedin",
        ];

        let bindings = {
            email: this.emailFields,
            phone: this.phoneFields,
            skype: this.skypeFields,
            facebook: this.facebookFields,
            linkedin: this.linkedinFields,
        };

        if (data) {

            this.currentContactId = data.contact_id;
            this.name = data.contact_name ? data.contact_name : "";
            this.companyName = data.partner_name ? data.partner_name : "";
            this.position = data.position ? data.position : "";

            data.info.forEach((fieldItem) => {
                if (bindings[fieldItem.name]) {
                    bindings[fieldItem.name].push(new CompanyContactField(fieldItem));
                } else if (fieldItem.name.match(/phone/)) {
                    bindings.phone.push(new CompanyContactField(fieldItem))
                }
            });
            initialFields.forEach((fieldItem) => {
                if (bindings[fieldItem] && !bindings[fieldItem].length) {
                    bindings[fieldItem].push(new CompanyContactField(fieldItem));
                }
            });
        } else {

            this.name = "";
            this.companyName = "";
            this.position = "";

            initialFields.forEach((fieldItem) => {
                if (bindings[fieldItem]) {
                    bindings[fieldItem].push(new CompanyContactField(fieldItem));
                }
            });
        }

        this.patterns = {
            email: '^[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$',
            phone: '^\\+[0123456789-]{6,18}$',
            skype: '^[a-zA-Z][a-zA-Z0-9\.,\-_]{5,31}$',
            facebook: '^https?:\/\/(www\.)?facebook.com\/[a-zA-Z0-9(\.\?)?-]+\/?$',
            linkedin: '^https?:\/\/(www\.)?linkedin.com\/in\/[a-zA-Z0-9(\.\?)?-]+\/?$',

        }
    }

    incrementPhones(data: any) {

        let index = data.name.substr('phone'.length);

        this.phoneFields.push(
            new CompanyContactField(
                'phone' + (index.length ? parseInt(index) + 1 : 1)
            )
        );
    };

    removePhones(data: any, index: number) {

        if (!data.index && !data.value) {
            this.phoneFields.splice(index, 1);
        }

    };

    validateContactForm() {
        let errors = [];

        let dataFieldErrors = this.validateDataFields();

        dataFieldErrors.forEach(function (item) {
            errors.push(item);
        });

        if (!this.companyName) {
            errors.push({
                field: 'partner_id',
                message: 'This field cannot be blank.',
            });
        }

        if (!this.name) {
            errors.push({
                field: 'name',
                message: 'This field cannot be blank.',
            });
        }

        if (!this.emailFields[0].value && !this.phoneFields[0].value && !this.skypeFields[0].value && !this.facebookFields[0].value && !this.linkedinFields[0].value) {
            errors.push({
                field: 'value',
                message: 'You must fill at least one of contact fields.',
            });
        }

        return errors;
    }

    validateDealContactForm() {
        let errors = [];

        let dataFieldErrors = this.validateDataFields();
        dataFieldErrors.forEach(function (item) {
            errors.push(item);
        });

        if (!this.name) {
            errors.push({
                field: 'name',
                message: 'This field cannot be blank.',
            });
        }

        if (!this.emailFields[0].value && !this.phoneFields[0].value && !this.skypeFields[0].value && !this.facebookFields[0].value && !this.linkedinFields[0].value) {
            errors.push({
                field: 'value',
                message: 'You must fill at least one of contact fields.',
            });
        }

        return errors;
    }

    validateDataFields() {
        let bindings = {
            email: this.emailFields,
            phone: this.phoneFields,
            skype: this.skypeFields,
            facebook: this.facebookFields,
            linkedin: this.linkedinFields,
        };

        let errors = [];
        let that = this;

        for (let fieldType in bindings) {
            bindings[fieldType].forEach(function (item: CompanyContactField) {
                let data = that.validateDataField(fieldType, item.name, item.value);
                if (data.length) {
                    errors.push(data[0]);
                }
            })
        }

        return errors;
    }

    validateDataField(patternName: string, field: string, value: string) {
        let re = new RegExp(this.patterns[patternName]);
        let error = [];

        if (value.length && !re.test(value)) {
             error.push({
                 field: field,
                 message: 'This is not a valid field',
             });
        }

        return error;
    }

    getFieldArray() {
        return [
            ...this.emailFields,
            ...this.phoneFields,
            ...this.skypeFields,
            ...this.facebookFields,
            ...this.linkedinFields
        ].filter(item => !!item.value || item.id > 0);
    }

    checkChanges(data?) {
        if (this.currentContactId) {
            if (this.companyName == data.partner_name) {
                delete this.companyName;
            }
        }
    }
}