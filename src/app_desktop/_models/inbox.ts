/**
 * Created by adrian on 6/1/17.
 */
export class Inbox {
    email_address: string;
    host_imap: string;
    host_smtp: string;
    port_imap: number;
    port_smtp: number;
    encryption_imap: string;
    encryption_smtp: string;
    login: string;
    password: string;
    oauth_token: string;

    baseFields: {};
    baseFieldsHeaders: string[];
    patterns: any;
    allowedImapPorts: PortListItem[];
    allowedSmtpPorts: PortListItem[];

    constructor(data?: any) {
        this.email_address = '';
        this.host_imap = '';
        this.host_smtp = '';
        this.port_imap = null;
        this.port_smtp = null;
        this.encryption_imap = '';
        this.encryption_smtp = '';
        this.login = '';
        this.password = '';
        this.oauth_token = '';

        if (data) {
            this.email_address = data.email_address;
            this.host_imap = data.host_imap;
            this.host_smtp = data.host_smtp;
            this.port_imap = data.port_imap;
            this.port_smtp = data.port_smtp;
            this.encryption_imap = data.encryption_imap;
            this.encryption_smtp = data.encryption_smtp;
            this.login = data.login;
        }

        this.baseFields = {
            google: {
                host_imap: 'imap.gmail.com',
                port_imap: 993,
                encryption_imap: 'ssl',
                host_smtp: 'smtp.gmail.com',
                port_smtp: 465,
                encryption_smtp: 'ssl',
            },
            yahoo: {
                host_imap: 'imap.mail.yahoo.com',
                port_imap: 993,
                encryption_imap: 'ssl',
                host_smtp: 'smtp.mail.yahoo.com',
                port_smtp: 465,
                encryption_smtp: 'ssl',
            },
            yandex: {
                host_imap: 'imap.yandex.com',
                port_imap: 993,
                encryption_imap: 'ssl',
                host_smtp: 'smtp.yandex.com',
                port_smtp: 587,
                encryption_smtp: 'ssl',
            },
            mail: {
                host_imap: 'imap.mail.ru',
                port_imap: 993,
                encryption_imap: 'ssl',
                host_smtp: 'smtp.mail.ru',
                port_smtp: 465,
                encryption_smtp: 'ssl',
            },
            exchange: {
                host_imap: 'outlook.office365.com',
                port_imap: 993,
                encryption_imap: 'ssl',
                host_smtp: 'smtp.office365.com',
                port_smtp: 587,
                encryption_smtp: 'ssl',
            },
            icloud: {
                host_imap: 'imap.mail.me.com',
                port_imap: 993,
                encryption_imap: 'ssl',
                host_smtp: 'smtp.mail.me.com',
                port_smtp: 465,
                encryption_smtp: 'ssl',
            },
        };

        this.allowedImapPorts = [{
            port: 993,
            encryption: 'ssl',
        }];
        this.allowedSmtpPorts = [{
            port: 25,
            encryption: 'ssl',
        },{
            port: 465,
            encryption: 'ssl',
        },{
            port: 587,
            encryption: 'tls',
        }];

        this.baseFieldsHeaders = [
            'gmail',
            'yahoo',
            'yandex',
            'mailru',
            'outlook',
            'icloud',
            'other',
        ];
        this.patterns = {
            email: '^[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$',
        }
    }

    applySettings(mailboxProvider: string) {

        if (mailboxProvider) {
            this.host_imap = this.baseFields[mailboxProvider].host_imap;
            this.host_smtp = this.baseFields[mailboxProvider].host_smtp;
            this.port_imap = this.baseFields[mailboxProvider].port_imap;
            this.port_smtp = this.baseFields[mailboxProvider].port_smtp;
            this.encryption_imap = this.baseFields[mailboxProvider].encryption_imap;
            this.encryption_smtp = this.baseFields[mailboxProvider].encryption_smtp;

            return true;
        } else {
            return false;
        }
    }

    getData() {
        return {
            email_address: this.email_address,
            host_imap: this.host_imap,
            host_smtp: this.host_smtp,
            port_imap: this.port_imap,
            port_smtp: this.port_smtp,
            encryption_imap: this.encryption_imap,
            encryption_smtp: this.encryption_smtp,
            login: this.login,
            password: this.password,
            oauth_token: this.oauth_token,
        }
    }

    validateDataFields(compact?: boolean, linkedEmails?: any) {

        let errors = [];
        let that = this;
        let fields;

        if (compact) {
            fields = [
                "email_address",
                "login",
                "password",
            ];
        } else {
            fields = [
                "email_address",
                "host_imap",
                "host_smtp",
                "port_imap",
                "port_smtp",
                "encryption_imap",
                "encryption_smtp",
                "login",
                "password",
            ];
        }

        fields.forEach(function (item) {
           let currentError = that.validateDataField('', item, that[item]);
           currentError.forEach(function (errorItem) {
               errors.push(errorItem);
           });

           if (item == 'login' && !currentError.length && linkedEmails) {
               let flag = true;
               linkedEmails.forEach(function (emailObject) {
                   if (flag && emailObject.email_address == that[item]) {
                       flag = false;
                       errors.push({
                           field: item,
                           message: 'You have already link such email'
                       });
                   }
               })
           }
        });


        return errors;
    }

    validateDataField(patternName: string, field: string, value: string) {
        let error = [];

        if (field == 'login') {
            let re = new RegExp(this.patterns['email']);
            if (!re.test(value)) {
                error.push({
                    field: field,
                    message: 'This is not a valid email address',
                });
            }

        } else if (!value) {
            error.push({
                field: field,
                message: 'This field must be non-empty',
            });
        }

        return error;
    }
}

interface PortListItem {
    port: number;
    encryption: string;
}