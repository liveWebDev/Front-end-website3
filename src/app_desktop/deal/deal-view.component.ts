import { Subscription } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import {
    Component, ViewEncapsulation, OnInit, ViewChild, Output, EventEmitter, Renderer, ElementRef,
    OnDestroy
} from '@angular/core';

import {CompanyService} from "../_services/company.service";
import {UserService} from "../_services/user.service";
import {DealService} from "../_services/deal.service";

import { Restangular } from 'ng2-restangular';

import * as moment from 'moment';
import {PopoverContent} from "ngx-popover";
import {ActivatedRoute, Router} from "@angular/router";
import {userInfo} from "os";
import {UIService} from "../_services/ui.service";
import {CompanyContactErrors} from "../_models/company-contact-errors";
import {CompanyContactForm} from "../_models/company-contact-form";
import {UploadItem} from "../_models/upload-item";
import {EmailForm} from "../_models/email-form";
import {EmailService} from "../_services/email.service";
import {DomSanitizer} from "@angular/platform-browser";
import {CreateNewEmailComponent} from "../inbox/create.new.email.component";
import {InboxDealLinkerComponent} from "../inbox/inbox.deal.linker.component";
import {CreateContactComponent} from "../contact/create-contact.component";

@Component({
    templateUrl: './deal-view.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './deal.scss', './deal.comments.scss', './deal.contacts.scss', '../contact/contact.scss', './letter-view.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class DealViewComponent implements OnInit, OnDestroy {
    currentDealPatnerName: string = "";
    currentDealTitle: string = "";
    currentUserId: number;
    currentCompanyId: number;
    companyName: string;
    dealId: number;
    dealPartnerName: string;
    dealPartnerId: number;
    dealTitle: string;
    dealStatus: number;
    dealLastUpdate: any;
    dealOwnerName: string;
    dealOwnerId: number;
    isOwner: boolean;
    reassignAvailable: boolean = false;
    canChangeStatus: boolean = false;
    dealUpdate: any = {};
    reassignmentUser: any = {};
    private sub: any;
    companyUsers: any;
    filteredUsers: any;
    isDataLoaded: boolean;
    commentFormType: string;
    showUploads: boolean;
    expandedContact: any[];
    expanded: boolean[];
    searchText: string;
    contactUpdating: boolean = false;
    focusedIdx: number = -1;

    contacts: any;
    contactForm: CompanyContactForm;
    contactFormErrors: CompanyContactErrors;
    currentForm: CurrentForm;
    attachmentUploading: boolean = false;
    emailSending: boolean = false;

    commentsLoaded: boolean = false;
    comments: any = [];
    newComment: string;

    sendEmailErrors: any = [];

    private userAvatar: any = {
        avatarName: '/assets/images/ava.png',
    };
    currentUser: any = {
        ava: ''
    };
    private uploadedContracts: any[];
    private ngUnsubscribe: Subject<any> = new Subject<any>();
    newEmail: EmailForm;
    uploadItems: UploadItem[];
    showBcc: boolean;

    postponePopoverShown: boolean;

    //datepicker props
    public dt: Date = new Date();
    public postponeDate: number;
    public minDate: Date = void 0;
    public events: any[];
    public formats: string[] = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY',
        'shortDate'];
    public format: string = this.formats[0];
    public dateOptions: any = {
        formatYear: 'YY',
        startingDay: 1
    };
    private fileTypes: any = [
      {
        type: '.jpg',
      },
      {
        type: '.pdf',
      },
      {
        type: 'docx',
      },
      {
        type: '.doc',
      },
      {
        type: '.txt',
      }
    ];
    private opened: boolean = false;

    @ViewChild('dealCloseConfirmationPopover') dealCloseConfirmationPopover: PopoverContent;
    @ViewChild('dealPostponePopover') dealPostponePopover: PopoverContent;
    @ViewChild('userInfoPopover') userInfoPopover: PopoverContent;
    @ViewChild('dealEditModal') dealCreatorModal: any;
    @ViewChild('dealReassignPopover') dealReassignPopover: any;
    @ViewChild('commentTextarea') commentTextarea: ElementRef;
    @ViewChild('createEmailComponentInner') private createEmailComponent: CreateNewEmailComponent;
    @ViewChild('inboxDealLinkerComponent') private inboxDealLinkerComponent: InboxDealLinkerComponent;
    @ViewChild('createContactComponent') private createContactComponent: CreateContactComponent;

    @ViewChild ('contactsForm') contactsFormModal: any;
    private currentEmail: any;

    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private companyService: CompanyService,
        private userService: UserService,
        private dealService: DealService,
        private router: Router,
        private route: ActivatedRoute,
        private restangular: Restangular,
        private uiService: UIService,
        private emailService: EmailService,
        private renderer: Renderer,
        private sanitizer: DomSanitizer
    ) {
        this.companyUsers = this.filteredUsers = [];
        this.isOwner = false;
        this.commentFormType = 'internal';
        this.isDataLoaded = true;
        this.showUploads = false;
        this.contacts = [];
        this.currentForm = {
            header: ""
        };
        this.searchText = '';
        this.expandedContact = [];
        this.uploadedContracts = [];
        this.newComment = "";
        (this.minDate = new Date()).setDate(this.minDate.getDate() + 1);
        //this.currentUserId = JSON.parse(localStorage.getItem('currentUser')).user_id;
        this.uiService.changeLayoutClass(2);
        this.uploadItems = [];
        this.showBcc = false;
        this.currentCompanyId = this.companyService.getCurrentCompanyId();
        this.companyUsers = this.companyService.getCompanyUsers(this.currentCompanyId);

        this.userService.currentAvatarObservable.subscribe(data => {
            this.userAvatar = data;
        });

        this.emailService.linkedEmailsObservable.subscribe(data => {
            this.currentEmail = data[0];
        });

        if (!this.currentEmail && this.emailService.localLinkedEmailsList) {
            this.currentEmail = this.emailService.localLinkedEmailsList[0];
        }

        this.emailService.addEmailToContacts.subscribe(data => {
            this.inboxDealLinkerComponent.addAContactFrom(data);
        });
    };

    public getDate(): number {
        return this.dt && this.dt.getTime() || new Date().getTime();
    }

    setPostponeDate (event:Event) {
        //currently I've have not found any methods of get selected date onclick so I will just rip off first init
        if (this.postponePopoverShown) {
            this.postponeDate = new Date().setDate(this.dt.getDate()+1);
            console.log(this.postponeDate);
        }
        this.postponePopoverShown = true;
    }

    showProfileById(id: number, e: Event) {
        e.preventDefault();
        this.router.navigateByUrl('/main/user/' + id);
    }

    getComments () {
        //'comments/select-comments/<firm_id:\d+>/<deal_id:\d+>' => 'comment/select-comments'
        this.restangular.one("deals/"+this.dealId+"/comments").get().takeUntil(this.ngUnsubscribe).subscribe(data=>{
            this.comments = data;
            this.expanded = [];
            data.forEach((item) => {
                this.expanded.push(false);
                item.date = (new Date(item.date));
                item.date.setMinutes(item.date.getMinutes() - item.date.getTimezoneOffset());
            });
            this.commentsLoaded = true;
        });
    }

    findUidInThread(to: string) {
        let counter = 0;

        while (this.comments.length > counter) {

            if (this.comments[counter].to && this.comments[counter].to === to) {
                return this.comments[counter].thread_id;
            }
            counter++;
        }

        return '';
    }

    changeStatus(val: number, isPostponing: boolean) {
        let data = {};
        if (isPostponing) {
            if (this.dealPostponePopover) {
                this.dealPostponePopover.hide();
            }
            data = {

                timer: new Date(this.getDate() + 1 * 86400000).toISOString().slice(0,10)+" 00:00:00",
            };

        }
        else {
            data = {
                timer: null
            }
        }
        if (this.isOwner) {
            //if current user is owner of deal
            this.restangular.all("deals/update-status-deal-ower/"+this.currentCompanyId+"/"+this.dealPartnerId+"/"+this.dealId+"/"+this.dealStatus+"/"+val).customPUT(data).subscribe(data=>{
                this.toast({
                    timeout: 2000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'info',
                    message: 'Deal status was changed.'
                });
                this.dealStatus = val;
                this.dealService.DealCreateObservable.next(val);
                this.dealCloseConfirmationPopover.hide();
            });
        }
        else {
            //if current user is has role 1 or 2
            this.restangular.all("deals/update-status-deal-not-ower/"+this.currentCompanyId+"/"+this.dealPartnerId+"/"+this.dealId+"/"+this.dealStatus+"/"+val+"/"+this.dealOwnerId).customPUT(data).subscribe(data=>{
                this.toast({
                    timeout: 2000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'info',
                    message: 'Deal status was changed.'
                });
                this.dealStatus = val;
                this.dealService.DealCreateObservable.next(val);
                this.dealCloseConfirmationPopover.hide();
            });
        }
    }

    postComment(event: Event, value: string) {
        event.preventDefault();
        if (value) {
            this.newComment = value;
            /*
             {
                 "body":"sadasdsfsdfdsfdsfdsfdsf",
                 "deal_id":"48782"
             }
            */
            this.restangular.all("comments").post({body: this.newComment, deal_id: this.dealId}).subscribe(data=>{
                this.newComment = "";
                //should reload comments here
                this.getComments();
                this.restangular.one('deals/', this.dealId).get().subscribe(data => {
                    this.dealLastUpdate = new Date(data.updated_at);
                    this.dealLastUpdate.setMinutes(this.dealLastUpdate.getMinutes() - this.dealLastUpdate.getTimezoneOffset());
                });
                //this.dealService.DealCreateObservable.next(data);
            });
        }
    }

    onUpdateSubmit () {
        this.dealCreatorModal.hide();
        this.toast({
            timeout: 2000,
            id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
            type: 'info',
            message: 'Deal was changed.'
        });
    }


    showDealEditModal () {
        this.currentDealPatnerName = this.dealPartnerName;
        this.currentDealTitle = this.dealTitle;
        this.dealCreatorModal.show();
    }

    editContact(event, contact: any) {
        event.stopPropagation();
        event.preventDefault();
        this.companyService.getContactById(contact.contact_id).subscribe(
            data => {
                this.createContactComponent.showUpdateContactForm(event, data, this.currentCompanyId);
            }, error => {
                this.toast({
                    timeout: 2000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'alert',
                    message: 'Couldn`t fetch contact data. Please, try again later'
                });
            }
        );
    }

    showCreateContactForm() {
        this.createContactComponent.showCreateContactForm(this.currentCompanyId);
    }

    changeCommentForm(value) {
        this.commentFormType = value;

        if (value == 'email') {
            this.createEmailComponent.replyOnDeal(null, this.currentEmail.login, this.dealTitle);
        }
    }

    handleKeyEvent(event: KeyboardEvent, value: string) {
        //get to api for matches
        switch (event.keyCode) {
            case 13 : {
              event.preventDefault();
              if (this.focusedIdx > -1) {
                  this.selectUser(this.filteredUsers[this.focusedIdx].id);
              }
              else {
                this.selectUser(this.filteredUsers[0].id);
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
                if (this.focusedIdx < this.filteredUsers.length-1){
                    this.focusedIdx++;
                }
            }
            break;
            default: {
                this.focusedIdx = -1;
                this.searchText = value;
            }
            break;
        }
    }

    selectUser(id: number) {
        //'deals/update-reassign-deal-ower/<firm_id:\d+>/<partner_id:\d+>/<deal_id:\d+>/<user_id_new:\d+>'         get
        //'deals/update-reassign-deal-not-ower/<firm_id:\d+>/<partner_id:\d+>/<deal_id:\d+>/<user_id_old:\d+>/<user_id_new:\d+>'
        this.dealReassignPopover.hide();
        if (this.isOwner) {
            this.restangular.one('deals/update-reassign-deal-ower/'+this.currentCompanyId+'/'+this.dealPartnerId+'/'+this.dealId+'/'+id).get().subscribe(
                data => {
                    this.loadDeal();
                    this.toast({
                        timeout: 2000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'info',
                        message: 'Deal was reassigned'
                    });
                }
            );
        }
        else {
            this.restangular.one('deals/update-reassign-deal-not-ower/'+this.currentCompanyId+'/'+this.dealPartnerId+'/'+this.dealId+'/'+this.dealOwnerId+'/'+id).get().subscribe(
                data => {
                    this.loadDeal();
                    this.toast({
                        timeout: 2000,
                        id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                        type: 'info',
                        message: 'Deal was reassigned'
                    });
                }
            );
        }
    }

    loadDeal () {
        this.dealService.getById(this.dealId).subscribe(
            data => {
                this.currentUserId = JSON.parse(localStorage.getItem('currentUser')).user_id;
                this.isOwner = false;
                this.reassignAvailable = false;
                this.canChangeStatus = false;
                if (data.user_id == this.currentUserId) {
                    this.isOwner = this.dealService.isUserOwner = true;
                }
                this.dealService.currentDealOwnerId = this.dealOwnerId = data.user_id;
                this.currentCompanyId = this.dealService.currentCompanyId = data.firm_id;
                this.dealId = this.dealService.currentDealId = data.deal_id;
                this.dealPartnerId = this.dealService.currentPartnerId = data.partner_id;
                this.dealPartnerName = data.partner_name;
                this.dealOwnerName = data.username;
                this.dealTitle = data.title;
                this.dealStatus = data.status;
                this.dealLastUpdate = new Date(data.updated_at);
                this.dealLastUpdate.setMinutes(this.dealLastUpdate.getMinutes() - this.dealLastUpdate.getTimezoneOffset());
                let time = new Date(this.dealLastUpdate).toTimeString().slice(0,8);
                let date = new Date(this.dealLastUpdate).toISOString().slice(0, 10);
                this.dealLastUpdate = date+' '+time;
                this.filteredUsers = this.companyService.companyUsers;
                if (!!this.filteredUsers) {
                    this.companyUsers = this.filteredUsers = this.filteredUsers.filter(item => item.id !== this.dealOwnerId);
                }
                if (this.isOwner || this.companyService.currentCompanyRole < 3) {
                  this.canChangeStatus = true;
                }
                if (this.companyUsers.length > 0 && (this.companyService.getCurrentCompanyRole() < 3 || this.isOwner)) {
                    this.reassignAvailable = true;
                }
                this.getComments();
                this.companyService.getDealContacts(this.currentCompanyId, this.dealId);
            }
        );
    }

    hideContactForm() {
        this.contactsFormModal.hide();
        this.contactFormErrors = new CompanyContactErrors();
    }

    uploadFile($event) {
      let fileSize = $event.target.files[0].size;
      let fileType = $event.target.files[0].name.slice(-4);
      let correctType:boolean = false;
      if (fileSize < 3145728) {
        this.fileTypes.map((item)=>{
            //if file type is valid and size is less than 3MB
            if (item.type == fileType) {
                correctType = true;
                this.dealService.uploadContract($event.target.files[0], this.dealId).subscribe(data => {
                    this.dealService.updateUploadedContracts(this.currentCompanyId, this.dealId);
                    this.uploadedContracts.push(new UploadItem(data[0], $event.target.files[0].name, 1));
                }, error => {
                    this.toast({
                        timeout: 5000,
                        type: 'danger',
                        message: 'Unsupported file format or size.'
                    });
                    return false;
                });
            }


        });
    }
    else {
        this.toast({
            timeout: 5000,
            type: 'danger',
            message: 'File should be less than 3MB.'
        });
          return false;
    }
    setTimeout(()=> {
        if (!correctType && fileSize < 3145728) {
            this.toast({
                timeout: 5000,
                type: 'danger',
                message: 'Unsupported file format.'
            });
            return false;
        }
    });
    }

    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.commentTextarea.nativeElement, 'focus');
    }

    ngOnInit() {
        this.isOwner = false;
        this.companyName = this.companyService.getCurrentCompanyName();
        this.sub = this.route.params.subscribe(params => {
            this.dealId = +params['id']; // (+) converts string 'id' to a number
            this.companyService.companyUsersObservable.subscribe(data=> {
              this.loadDeal();
            })
            //check if changes were applied to current deal
            this.dealService.DealCreateObservable.subscribe(data => {
                this.loadDeal();
            });
        });

        this.contactForm = new CompanyContactForm();
        this.contactFormErrors = new CompanyContactErrors();

        this.companyService.dealContactsObservable.takeUntil(this.ngUnsubscribe).subscribe(data => {
            this.contacts = data;
            this.isDataLoaded = true;
        });

        this.dealService.uploadedContractsObservable.takeUntil(this.ngUnsubscribe).subscribe(
            data => {
                this.uploadedContracts = data;
            }
        );

        this.companyService.companiesObservable.takeUntil(this.ngUnsubscribe).subscribe(value => {
            this.currentCompanyId = this.companyService.getCurrentCompanyId();
            this.dealService.updateUploadedContracts(this.currentCompanyId, this.dealId);
        });

        this.dealService.updateUploadedContracts(this.currentCompanyId, this.dealId);

    }

    ngOnDestroy() {
        this.sub.unsubscribe();
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    toast(data: any) {
        this.uiService.toastMessage(data);
    }
}

interface Deal {
    deal_id: number,
    deal_title: string,
    updated_at: string,
    username: string,
    partner_id: number,
    partner_name: string,
    timer: number,
}

interface CurrentForm {
    header: string;
}

interface User {
    id: number,
    username: string,
}
