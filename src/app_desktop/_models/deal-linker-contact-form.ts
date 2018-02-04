/**
 * Created by adrian on 6/19/17.
 */
import {CompanyContactField} from "./company-contact-field";
import {forEach} from "@angular/router/src/utils/collection";
import {ContactFormModelInterface} from "../_interfaces/ContactFormModelInterface";

export class DealLinkerContactForm implements ContactFormModelInterface {
    name: string;
    companyName?: string;
    position?: string;
    currentContactId?: number;
    emailFields: CompanyContactField[];
    phoneFields: CompanyContactField[];
    skypeFields: CompanyContactField[];
    facebookFields: CompanyContactField[];
    linkedinFields: CompanyContactField[];
    patterns: any;
    fields: CompanyContactField[];
    errors: {} = {};

    constructor(data?: any) {

        this.emailFields = [];

        let initialFields = [
            "email",
            "phone",
            "skype",
            "facebook",
            "linkedin",
        ];

        let bindings = {
            email: this.emailFields,
        };

        if (data) {

            this.name = data.contact_name ? data.contact_name : "";

            data.info.forEach((fieldItem) => {
                if (bindings[fieldItem.name]) {
                    bindings[fieldItem.name].push(new CompanyContactField(fieldItem));
                }
            });

            initialFields.forEach((fieldItem) => {
                if (bindings[fieldItem] && !bindings[fieldItem].length) {
                    bindings[fieldItem].push(new CompanyContactField(fieldItem));
                }
            });
        } else {

            this.name = "";

            initialFields.forEach((fieldItem) => {
                if (bindings[fieldItem]) {
                    bindings[fieldItem].push(new CompanyContactField(fieldItem));
                }
            });
        }

        this.patterns = {
            email: '^[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$',
        }
    }

    validateContactForm() {
        let errors = [];

        let dataFieldErrors = this.validateDataFields();

        dataFieldErrors.forEach(function (item) {
            errors.push(item);
        });

        if (!this.name) {
            errors.push({
                field: 'name',
                message: 'Name cannot be blank.',
            });
        }

        if (!this.emailFields[0].value) {
            errors.push({
                field: 'email',
                message: 'Email cannot be blank.',
            });
        }

        return errors;
    }

    validateDataFields() {
        let bindings = {
            email: this.emailFields,
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

    generalCheck() {
        this.validateContactForm().forEach(data => {
            this.errors[data.field] = data.message;
        });
    }

    hasErrors() {
        return JSON.stringify(this.errors).length > 4;
    }

    clearError(name: string) {
        delete this.errors[name];
    }

    validateDealContactForm() {
        return [];
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