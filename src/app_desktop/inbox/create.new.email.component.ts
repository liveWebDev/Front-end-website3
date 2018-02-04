/**
 * Created by adrian on 5/14/17.
 */
import { UIService } from './../_services/ui.service';
import {
    Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnDestroy, AfterViewInit,
    Input, AfterViewChecked
} from '@angular/core';
import {EmailService} from "../_services/email.service";
import {UserAvatar} from "../_models/user-avatar";
import {EmailForm} from "../_models/email-form";
import {UploadItem} from "../_models/upload-item";
import {CreateEmailService} from "../_services/create.email.service";
import {ParseEmailSenderStringPipe} from "../_pipes/parse-email-sender-string-pipe/parse-email-sender-string-pipe";
import {CompanyService} from "../_services/company.service";
import {SignatureEditComponent} from "./signature.edit.component";
import {SignatureService} from "../_services/signature.service";
import {EmailBullitList} from "../_models/email-bullit-list";
import {TinymceComponent} from "angular2-tinymce/dist/angular2-tinymce.component";
import {UserService} from "../_services/user.service";
import {Popover} from "ngx-popover";

@Component({
    selector: 'create-new-email',
    templateUrl: './create.new.email.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './inbox.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class CreateNewEmailComponent implements OnDestroy, AfterViewChecked {

    currentTab: string;
    searchText: string;
    emailsSummary: any;
    today: number;
    inSearch: boolean;
    loadingThread: boolean;
    currentEmail: any;
    currentAction: string;
    userAvatar: UserAvatar = new UserAvatar;
    newEmail: EmailForm;
    showBcc: boolean;
    isCreateDeal: boolean;
    uploadItems: UploadItem[];
    showCompanySuggestion: boolean;
    matches: any[];
    partnerMatches: any[];
    suggestedEmailFromList: any[] = [];
    selectedEmailFrom: any = false;
    suggestedContactEmails: string[] = [];

    emailList: EmailBullitList = new EmailBullitList();
    emailListCc: EmailBullitList = new EmailBullitList();
    emailListBcc: EmailBullitList = new EmailBullitList();

    newDealInput: string;
    linkErrors: any;
    attachmentUploading: boolean = false;
    emailSending: boolean = false;

    currentTabIndex: number;
    contactExists: boolean = true;
    dragStarted: boolean = false;

    emailSenderParser: ParseEmailSenderStringPipe;

    signatureList: SignatureItem[] = [];
    selectedSign: SignatureItem;
    emailSuggesiontListFlags: EmailSuggestListFlags = {
        to: false,
        cc: false,
        bcc: false,
    };
    emailSuggestionActiveIndex = -1;

    private alive: boolean = true;

    @Output() toastMessage:EventEmitter<any> = new EventEmitter();
    @Output() addToContacts:EventEmitter<any> = new EventEmitter();
    @Input() thread: any;
    @ViewChild('signatureEditComponent') private signatureEditComponent: SignatureEditComponent;
    @ViewChild('tinyEditor') private tinyEditor: TinymceComponent;

    constructor(
        private emailService: EmailService,
        private uiService: UIService,
        private userService: UserService,
        private companyService: CompanyService,
        private createEmailService: CreateEmailService,
        private signatureService: SignatureService,
    ) {
        this.currentTab = '';
        this.currentTabIndex = 0;
        this.searchText = '';
        this.emailsSummary = [];
        this.today = new Date().getTime();
        this.inSearch = true;
        this.loadingThread = false;
        this.newEmail = new EmailForm();
        this.showBcc = false;
        this.isCreateDeal = true;
        this.uploadItems = [];
        this.showCompanySuggestion = false;
        this.matches = [];
        this.partnerMatches = [];
        this.newDealInput = '';
        this.linkErrors = '';
        this.emailSenderParser = new ParseEmailSenderStringPipe();

        this.userService.currentAvatarObservable.subscribe(data => {
            this.userAvatar = data;
        });

        this.emailService.currentLoadedEmailBox.subscribe(data => {
            this.currentEmail = data;
        });

        this.createEmailService.emailCreatorStateObservable.subscribe(data => {
            this.currentAction = data;
        });

        this.signatureService.currentSignaturesList.takeWhile(() => this.alive).subscribe(data => {
                this.signatureList = data;
            }
        );

        this.emailService.linkedEmailsObservable.subscribe(data => {
            this.suggestedEmailFromList = data;

            if (!this.currentEmail && data.length) {
                this.selectedEmailFrom = this.currentEmail = data[0];
                this.updateSignatures();
            }
        });

        this.emailService.suggestedContactsObservable.subscribe(data => {
            this.suggestedContactEmails = data;
        });

        this.emailService.getLinkedEmails();

        this.createEmailService.dropEmailCreatorsState();
    };

    createNewEmail() {
        this.createEmailService.dropEmailCreatorsState();
        this.emailService.dropLoadedThreadList();

        this.newEmail = new EmailForm(this.currentEmail.login);
        this.uploadItems = [];
        this.showBcc = false;
        this.createEmailService.setEmailCreatorsState('create');
        setTimeout(() => {
            this.selectDefaultSignature()
        });
    }

    editSignatures() {
        this.signatureEditComponent.openWindow(this.currentEmail.id);
    }

    updateSignatures() {
        this.selectDefaultSignature();
        this.signatureService.getSignaturesByEmail(this.selectedEmailFrom.id);
    }

    selectSignature(signatureItem?: SignatureItem) {
        this.selectedSign = signatureItem ? signatureItem : null;
        this.clearSigns();

        if (signatureItem && typeof this.tinyEditor !== 'undefined') {
            let content = this.tinyEditor.editor.getContent({format: 'raw'}) + '<div id="editor-email-sign">' + signatureItem.text.split('\n').join('<br>') + '</div>';
            this.tinyEditor.editor.execCommand('mceSetContent', true, content);
        }
    }

    hasChanges() {
        if (typeof this.tinyEditor === 'undefined') {
            return false;
        } else {
            console.log(this.tinyEditor.editor.getContent());
            return this.tinyEditor.editor.getContent({format: 'raw'}).length
        }
    }

    selectDefaultSignature() {
        if (this.signatureList.length) {
            this.selectSignature(this.signatureList[0]);
        }
    }

    clearComponent() {
        this.emailList = new EmailBullitList();
        this.emailListCc = new EmailBullitList();
        this.emailListBcc = new EmailBullitList();
        this.newEmail = new EmailForm();
        if (this.tinyEditor) {
            this.tinyEditor.editor.execCommand('mceSetContent', true, '');
        }
    }

    clearSigns() {
        if (typeof this.tinyEditor !== 'undefined') {
            let item = this.tinyEditor.editor.dom.doc.querySelector('#editor-email-sign');

            if (item) {
                item.remove();
            }
        }
    }

    replyOnDeal($event, login, dealTitle) {
        if ($event) {
            $event.preventDefault();
        }

        this.emailList = new EmailBullitList();

        this.uploadItems = [];

        // this.appendEmailsList(this.thread[0].mail.fromAddress.match(this.currentEmail.login) ? this.thread[0].mail.toString : this.thread[0].mail.fromAddress);

        this.newEmail = new EmailForm(
            login,
            '',
            dealTitle
        );
        this.uploadItems = [];

        this.createEmailService.setEmailCreatorsState('reply');

        setTimeout(() => {
            this.selectDefaultSignature();
        });
    }

    replyNow($event) {
        $event.preventDefault();

        this.emailList = new EmailBullitList();

        if (this.currentAction !== 'create') {
            this.uploadItems = [];

            this.appendEmailsList(this.thread[0].mail.fromAddress.match(this.currentEmail.login) ? this.thread[0].mail.toString : this.thread[0].mail.fromAddress);

            this.newEmail = new EmailForm(
                this.currentEmail.login,
                '',
                this.thread[0].mail.subject,
                this.thread.slice(-1)[0].mail.id
            );
            this.createEmailService.setEmailCreatorsState('reply');
            setTimeout(() => {
                this.selectDefaultSignature()
            });
        }
    }

    sendMail() {
        let attachments = this.uploadItems.filter(item => !!item.status).map(item => item.id);
        this.newEmail.to = this.emailList.serialize();
        this.emailSending = true;
        this.emailService.sendEmail(this.newEmail, this.selectedEmailFrom ? this.selectedEmailFrom : this.currentEmail, attachments).subscribe(data => {
            this.emailSending = false;
            this.toast({
                timeout: 2000,
                id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                type: 'info',
                message: 'Message was successfully sent'
            });
            this.uploadItems = [];
            this.createEmailService.dropEmailCreatorsState();
        }, error => {
            this.emailSending = false;
            console.log(error);
        });
    }

    deleteAttach(id: number) {
        this.uploadItems.splice(id, 1);
    }

    uploadAttachment($event) {
        this.attachmentUploading = true;
        let fileSize = $event.target.files[0].size;
        if (fileSize < 5242880) {
            this.emailService.addAttachment($event.target.files[0]).subscribe(data => {
                this.attachmentUploading = false;
                this.uploadItems.push(new UploadItem(data[0], $event.target.files[0].name, 1));
            }, error => {
                this.attachmentUploading = false;
                this.uploadItems.push(new UploadItem(0, $event.target.files[0].name, 0));
            });
        }
        else {
            this.attachmentUploading = false;
            this.toast({
                timeout: 15000,
                type: 'danger',
                message: 'File should be less than 5MB.'
            });
        }

    }

    onItemDrop($event, $model) {
        $model.appendList($event.dragData.item);
        $event.dragData.originalList.pullItem($event.dragData.originalIndex);
    }

    checkForNewItem($event, $model: EmailBullitList) {
        console.log($event.which);
        console.log($event);
        if ($event.which == 13 && $model.input) {
            $event.preventDefault();

            if ($model.appendList($model.input)) {
                $model.input = '';
            }

            return;
        }

        if (($event.which == 8 || $event.which == 46) && !$model.input) {
            $event.preventDefault();
            $model.pullItem();

            return;
        }
    }

    checkForEmailSuggestions($model, flagName, $event) {

        if ($event.key === 'ArrowDown') {
            this.emailSuggestionActiveIndex += (this.emailSuggestionActiveIndex < this.suggestedContactEmails.length - 1) ? 1 : 0;
        } else if ($event.key === 'ArrowUp') {
            this.emailSuggestionActiveIndex -= (this.emailSuggestionActiveIndex > 0) ? 1 : 0;
        } else if ($event.key === 'Enter' && typeof this.suggestedContactEmails[this.emailSuggestionActiveIndex] !== 'undefined') {
            $model.input = this.suggestedContactEmails[this.emailSuggestionActiveIndex]['email'];
            this.emailSuggestionActiveIndex = -1;
            this.emailSuggesiontListFlags[flagName] = false;
            this.emailService.getContactEmailSuggestions('');

        } else {
            this.emailService.getContactEmailSuggestions('');
            this.emailSuggestionActiveIndex = -1;

            if ($model.input.length >= 1 ) {
                this.emailSuggesiontListFlags[flagName] = true;
                this.emailService.getContactEmailSuggestions($model.input);
            }
        }
    }

    pasteDataIntoEditor($event) {
        $event.preventDefault();
    }

    appendEmailsList(text) {
        this.emailList.appendList(text);
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }

    addEmailToContacts(data: any) {
        this.emailService.addEmailToContactsEvent(data);
    }

    checkEmailInContacts(email: string) {
        let checkEmail = this.companyService.findContactsByEmail(email).subscribe(data => {
            this.contactExists = data.length;
            checkEmail.unsubscribe();
        });
    }

    getPopoverStyleHack() {
        return this.dragStarted ? 'none' : 'block';
    }

    ngAfterViewChecked() {

    }

    ngOnDestroy() {
        this.alive = false;
    }

}

interface SignatureItem {
    id: number,
    user_id?: number,
    email_id: number,
    name: string,
    text: string
}

interface EmailSuggestListFlags {
    to: boolean,
    cc: boolean,
    bcc: boolean
}