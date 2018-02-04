import {CompanyContactField} from "../_models/company-contact-field";

export interface ContactFormModelInterface {
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

    // incrementPhones(data: any);
    // removePhones(data: any, index: number);
    validateContactForm(): ErrorField[];
    validateDealContactForm();
    validateDataFields(): ErrorField[];
    validateDataField(patternName: string, field: string, value: string): ErrorField[];
    getFieldArray();
    checkChanges(data?);
}

interface ErrorField {
    field: string;
    message: string;
}