/**
 * Created by adrian on 5/15/17.
 */
import {EventEmitter, Injectable} from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import {Inbox} from "../_models/inbox";
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {EmailForm} from "../_models/email-form";
import {LinkNewDeal} from "../_models/link-new-deal";
import {EmailFolders} from "../_models/email-folders";

@Injectable()
export class EmailService {
    public currentInboxObservable = new Subject<any>();
    public currentInboxFolderObservable = new Subject<any>();
    public emailSummaryObservable = new Subject<any>();
    public linkedEmailsObservable = new Subject<any>();
    public threadObservable = new Subject<any>();
    public emailFoldersObservable = new Subject<any>();
    public currentLoadedEmailBox = new Subject<any>();
    public tokenUpdateObservable = new Subject<any>();
    public suggestedContactsObservable = new Subject<any>();

    public localLinkedEmailsList: any[];

    public invitedEmail: string;
    public currentEmailId: number;
    public currentEmailFolders: EmailFolders;

    public addEmailToContacts: EventEmitter<any>;
    public messageToaster: EventEmitter<any>;

    constructor(private http: Http) {
        this.addEmailToContacts = new EventEmitter();
        this.messageToaster = new EventEmitter();
    }

    addEmailToContactsEvent(data: any) {
        this.addEmailToContacts.emit(data);
    }

    getLinkedEmails() {
        return this.http.get('/server/emails', this.jwt()).map((response: Response) => response.json()).subscribe(
            data => {
                this.updateLinkedEmailsList(data);
            }
        );
    }

    getFreshEmailsList() {
        return this.http.get('/server/emails', this.jwt()).map((response: Response) => response.json())
    }

    getEmailLinkLastError() {
        return this.http.get('/server/email/get-link-errors', this.jwt()).map((response: Response) => response.json())
    }

    getContactEmailSuggestions(query: string) {

        if (query.length) {
            this.http.get('/server/contacts/search-by-email?query=' + query, this.jwt()).map((response: Response) => response.json()).subscribe(data => {
                this.suggestedContactsObservable.next(data);
            })
        } else {
            this.suggestedContactsObservable.next([]);
        }
    }

    updateCurrentInbox(data?) {
        this.currentInboxObservable.next(data ? data : 0);
    }

    updateCurrentInboxFolder(data?) {
        this.currentInboxFolderObservable.next(data ? data : 0);
    }

    updateLinkedEmailsList(data: any) {
        this.linkedEmailsObservable.next(data);
        this.localLinkedEmailsList = data;
    }

    getLinkedEmailById(id: number) {
        if (id) {
            this.http.get('/server/emails/' + id, this.jwt()).map((response: Response) => response.json()).subscribe(
                data => {
                    this.currentLoadedEmailBox.next(data);
                }
            );
        }
    }

    checkToken(id: number) {
        return this.http.get('/server/emails/validate-connection?id=' + id, this.jwt()).map((response: Response) => response.json());
    }

    updateToken(data: any) {
        this.http.post('/server/emails/update-token', data, this.jwt()).map((response: Response) => response.json()).subscribe(data => {
            this.tokenUpdateObservable.next(data);
        }, error => {
            console.log(error);
        });
    }

    updateEmailFolders(data: any) {
        this.emailFoldersObservable.next(new EmailFolders(data));
    }

    getAvailableFolders(linkId: number) {
        return this.http.get('/server/emails/' + linkId + '/folders', this.jwt()).map((response: Response) => response.json()).subscribe(data => {
            console.log(data);
            this.updateEmailFolders(data);
        }, error => {
            console.log(error);
            this.updateEmailFolders([]);
        });
    }

    getEmailIds(linkId: number) {
        return this.http.get('/server/emails/' + linkId + '/identities', this.jwt()).map((response: Response) => response.json());
    }

    deleteMessage(data: any) {
        return this.http.post('/server/emails/delete-message', data, this.jwt()).map((response: Response) => response.json());
    }

    loadThreadEmails(linkId: number, folder?: string, identities?: Identity[], dates?: any) {

        if (identities) {
            let requests = [];
            let requestsObject = {};

            identities.forEach(identity => {
                requests.push(this.getFullEmailData(linkId, identity.uid, identity.folder ? identity.folder : folder));
                requestsObject[identity.uid] = identity.folder;
            });

            Observable.forkJoin(requests).subscribe(results => {

                //we need correct email folder. Lets inject it into response object
                let res = results.filter(item => {
                    return item.hasOwnProperty('mail');
                }).map(item => {
                    if (item['mail'].hasOwnProperty('id')) {

                        item['folder'] = requestsObject[item['mail']['id']];
                        if (dates) {
                            item['timestamp'] = dates[item['mail']['id']];
                        }
                    }

                    return item;
                });

                this.threadObservable.next(res);

            }, error => {
                console.log('Call for email, receive error instead');
                console.log(error);
            });
        } else {
            this.threadObservable.next([]);
        }

    }

    dropLoadedThreadList() {
        this.threadObservable.next([]);
    }

    getFullEmailData(linkId: number, identity: number, folder: string) {
        return this.http
            .get('/server/emails/' + (linkId ? linkId : 0) + '/read/' + (identity ? identity : 0) + '?folder=' + (folder ? folder : ''), this.jwt())
            .catch(err => {
                console.log('test???');
                return [err];
            })
            .map((response: Response) => response.json());
    }

    getEmailSummary(linkId: number, folder: string, fromDate: number) {

        if (!folder) {
            folder = '';
        }

        this.getEmailSummaryRequest(linkId, folder, fromDate).subscribe(data => {
            this.updateEmailSummary(data);
        });
    }

    searchEmails(linkId: number, folder: string, searchQuery: string) {

        if (!folder) {
            folder = '';
        }

        return this.http
            .get('/server/emails/' + linkId + '/search', this.jwt({
                folder: folder,
                query: searchQuery,
            }))
            .map((response: Response) => response.json())
            .subscribe(data => {
                this.updateEmailSummary(data);
            }, error => {
                this.messageToaster.emit({
                    timeout: 5000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'danger',
                    message: 'Search has failed. Try to reload the page'
                });
            });
    }

    getEmailSummaryRequest(linkId: number, folder: string, fromDate: number) {
        return this.http.get('/server/emails/' + linkId + '/summary', this.jwt({
            folder: folder,
            fromDate: fromDate,
        })).map((response: Response) => response.json())
    }

    checkEmailUpdates(linkId: number, folder: string) {
        return this.http.get('/server/emails/' + linkId + '/latest', this.jwt({
            folder: folder,
        })).map((response: Response) => response.json()).toPromise();
    }

    linkDeal(model: LinkNewDeal) {
        return this.http.post('/server/emails/link', model, this.jwt()).map((response: Response) => response.json());
    }

    updateEmailSummary(data: any) {
        let result = [];

        for (let thread in data) {
            result.push({
                slag: thread,
                emails: data[thread].messages,
                deals: data[thread].deals,
            });
        }

        this.emailSummaryObservable.next(result);
    }

    updateEmailSummaryWithSearchedData(data: any) {
        let result = [];

        for (let thread in data) {
            result.push({
                slag: thread,
                emails: [{
                    from: typeof data[thread].from !== 'undefined' ? data[thread].from[0] : '',
                    to: typeof data[thread].to !== 'undefined' ? data[thread].to[0] : '',
                    subject: typeof data[thread].subject !== 'undefined' ? data[thread].subject[0] : '',
                    content_brief: typeof data[thread].content_brief !== 'undefined' ? data[thread].content_brief[0] : '',
                    date: typeof data[thread].date !== 'undefined' ? data[thread].date[0] : '0',
                    uid: data[thread].uid
                }],
                deals: [],
            });
        }

        this.emailSummaryObservable.next(result);
    }

    addInbox(inbox: Inbox) {
        return this.http.post('/server/email/create', inbox.getData(), this.jwt()).map((response: Response) => response.json());
    }

    updateInbox(inbox: Inbox, id: number) {
        return this.http.put('/server/emails/' + id, inbox, this.jwt()).map((response: Response) => response.json());
    }

    refreshMailList(inboxId: number) {
        return this.http.put('/server/emails/' + inboxId + '/sync', {}, this.jwt()).map((response: Response) => response.json()).toPromise();
    }

    sendEmail(emailForm: EmailForm, generalData: any, attachments: any[], deal_id?: number) {

        return this.http.post('/server/emails/send', {
            "mail_id": generalData.id,
            "address": emailForm.to,
            "subject": emailForm.subject,
            "body": emailForm.content,
            "cc": emailForm.cc ? emailForm.cc.split(/,\s?/) : [],
            "bcc": emailForm.bcc ? emailForm.bcc.split(/,\s?/) : [],
            "attachments": attachments,
            "replay_to": generalData.email_address,
            "deal_id": deal_id ? deal_id : null,
            "original_uid": emailForm.originalUid ? emailForm.originalUid : null,
            "thread_id": emailForm.threadId ? emailForm.threadId : null,
        }, this.jwt()).map((response: Response) => response.json());

    }

    // private helper methods

    private jwt(params?: any) {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let result: RequestOptions = new RequestOptions();
            result.headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });

            if (params) {
                result.search = new URLSearchParams();
                for (let key in params) {
                    result.search.set(key, params[key]);
                }
            }

            return result;
        }
    }

    private handleError(error: any) {
        console.log(error);
        return Observable.throw(error.json());
    }

    addAttachment(file) {
        let formData = new FormData();
        formData.append("files", file, file.name);

        return this.http.post('/server/emails/set-attachment', formData, this.jwt())
            .map((response: Response) => response.json());
    }
}

interface Identity {
    uid: number;
    folder: string;
}