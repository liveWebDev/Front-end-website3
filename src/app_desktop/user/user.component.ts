import { UIService } from './../_services/ui.service';
import { Output, EventEmitter } from '@angular/core';
/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation} from '@angular/core';
import { Location } from '@angular/common';

import {User} from "../_models/user";

import {CompanyService} from "../_services/company.service";
import {UserService} from "../_services/user.service";
import { Router, ActivatedRoute } from '@angular/router';
import {DealService} from "../_services/deal.service";
import {exhaustMap} from "rxjs/operator/exhaustMap";
import {EmailService} from "../_services/email.service";
import {ThreadService} from "../_services/thread.service";
import { AuthenticationService } from '../_services/index';
import {UserAvatar} from "../_models/user-avatar";

@Component({
    templateUrl: './user.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './user.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [],
})

export class UserComponent {
    user: User;
    userAvatar: UserAvatar;
    isMe: boolean;
    pageTitle: string;
    email: string;
    isUploadingInProcess: boolean;
    returnUrl: string;
    activity: {}[];
    currentUserId: number;
    originalUserId: number;
    loadedUserAvatar: string;
    private fileTypes: any = [
      {
        type: '.jpg',
      },
      {
        type: '.png',
      },
      {
        type: 'jpeg',
      }
    ];

    avatarErrorMessage: string;
    @Output() toastMessage:EventEmitter<any> = new EventEmitter();

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private uiService: UIService
    ) {
        this.originalUserId = JSON.parse(localStorage.getItem('currentUser')).user_id;
        this.isMe = false;

        this.avatarErrorMessage = '';

        this.route.params.subscribe(params => {
            this.currentUserId = params["id"];
            this.isMe = (this.currentUserId == this.originalUserId) || (this.currentUserId == 0);
            this.userService.getGeneralData(this.currentUserId);
        });
        if (this.isMe) {
          this.userService.getAvatar();
        }

        this.userService.currentAvatarObservable.subscribe(data => {
            this.userAvatar = data;
            if (this.isUploadingInProcess) {
                console.log('uploaded avatar');
                console.log(data);
                this.loadedUserAvatar = data.avatarName;
                this.toast({
                    timeout: 2000,
                    id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                    type: 'info',
                    message: 'Your picture was changed'
                });
            }
            
            this.isUploadingInProcess = false;
            this.avatarErrorMessage = '';
        });

        this.userService.generalDataObservable.subscribe(data => {
            this.user = data[0];
            if (!data[0].avatar_name) {
                this.loadedUserAvatar = '/assets/images/ava.png';
            }
            else {
              this.loadedUserAvatar = '/server/images/'+data[0].avatar_name;
            }
            this.pageTitle = this.user.username;
        });


        this.isUploadingInProcess = false;

    };

    logout (event: Event) {
        event.preventDefault();
        this.authenticationService.logout();
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigate([this.returnUrl]);
    }

    goBack() {
        this.location.back();
    }

    updateAvatar($event) {
        let fileSize = $event.target.files[0].size;
        let fileType = $event.target.files[0].name.slice(-4);
        let correctType:boolean = false;
        
        if (fileSize < 3145728) {
            this.fileTypes.map((item)=>{
                //if file type is valid and size is less than 3MB
                if (item.type == fileType) {
                    correctType = true;
                    this.isUploadingInProcess = true;
                    this.userService.updateAvatar($event.target.files[0]);
                }
            });
            setTimeout(()=> {
                if (!correctType && fileSize < 3145728) {
                    this.toast({
                        type: 'danger',
                        message: 'Only files with these extensions are allowed: png, jpg, jpeg.'
                    });
                }
            });
        }
        else {
            this.toast({
                timeout: 4000,
                id: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                type: 'danger',
                message: 'Picture should be less than 3MB'
            });
        }
        
    }


    toast(data: any) {
        this.uiService.toastMessage(data);
    }

}



