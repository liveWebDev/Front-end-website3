import { convertTimeAgo } from './../_pipes/time-ago-converting-pipe/time-ago-converting-pipe';
/**
 * Created by adrian on 5/15/17.
 */
import { NgModule }      from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule, Routes} from "@angular/router";
import {FormsModule} from '@angular/forms';

import {MainComponent}   from './main.component';
import {AboutComponent} from "../page/about.component";
import {DealComponent} from "../deal/deal.component";
import {DealViewComponent} from "../deal/deal-view.component";
import {DealCreate} from "../deal/deal-create.component";
import {InboxComponent} from "../inbox/inbox.component";
import {UserComponent} from "../user/user.component";
import {CompanyComponent} from "../company/company.component";
import {CompanyCreateComponent} from "../company/company.create.component";
import {InboxInfoComponent} from "../inbox/inbox.info.component";
import {InboxCreateComponent} from "../inbox/inbox.create.component";
import {UserEditComponent} from "../user/user.edit.component";
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { MomentModule } from 'angular2-moment';
import {PopoverModule} from "ngx-popover";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import {ContactComponent} from "../contact/contact.component";
import {CompanyUsersPipe} from "../_pipes/company-users-pipe/company-users-pipe";
import {CompanyContactsPipe} from "../_pipes/company-contacts-pipe/company-contacts-pipe";
import {InboxSearchPipe} from "../_pipes/inbox-search-pipe/inbox-search-pipe";
import {TinymceModule} from "angular2-tinymce";
import {ContactRootComponent} from "../contact/contact.root.component";
import {KeysPipe} from "../_pipes/keys-pipe/keys-pipe";
import { ListFocus } from "../_directives/list-focus";
import {InstructionsComponent} from "../page/instructions.component";
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {XBytesPipe} from "../_pipes/x-bytes-pipe/x-bytes-pipe";
import {DealTimerStatus} from "../_pipes/deal-timers-pipe/deal-timers-pipe";
import {ContactListPipe} from "../_pipes/contact-list-pipe/contact-list-pipe";
import {InboxDealLinkerComponent} from "../inbox/inbox.deal.linker.component";
import {GoogleAuthComponent} from "../inbox/google.auth.component";
import {CreateNewEmailComponent} from "../inbox/create.new.email.component";
import {SafeHtmlPipe} from "../_pipes/safe-html-pipe/safe-html-pipe";
import {EmailHtmlViewComponent} from "../inbox/email.html.view.component";
import {ExtractNamePipe} from "../_pipes/extract-name-pipe/extract-name-pipe";
import {GetCounteragentEmailPipe} from "../_pipes/get-counteragent-email-pipe/get-counteragent-email-pipe";
import {ClipboardModule} from "ngx-clipboard/dist";
import {CreateContactComponent} from "../contact/create-contact.component";
import {ParseEmailSenderStringPipe} from "../_pipes/parse-email-sender-string-pipe/parse-email-sender-string-pipe";
import {SignatureEditComponent} from "../inbox/signature.edit.component";
import 'tinymce/plugins/textcolor/plugin.js';
import 'tinymce/plugins/lists/plugin.js';
import 'tinymce/plugins/paste/plugin.js';
import 'tinymce/plugins/directionality/plugin.js';
import 'tinymce/plugins/noneditable/plugin.js';
import {BrowserModule} from "@angular/platform-browser";
import {Ng2DragDropModule} from "ng2-drag-drop";
import {StopMousedownPropagation} from "../_directives/stop-mousedown-propagation";
import {ConfirmDeactivateGuard} from "../_services/can.deactivate.service";
import {EllipsisSlicePipe} from "../_pipes/ellipsis-slice-pipe/ellipsis-slice-pipe";
import {ExtractEmailPipe} from "../_pipes/extract-email-pipe/extract-email-pipe";
import {ClickOutsideModule} from "ng-click-outside";

// used to create fake backend
/*
import { fakeBackendProvider } from '../_helpers/index';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { BaseRequestOptions } from '@angular/http';
*/

const mainRoutes: Routes = [
    { path: '',  component: MainComponent, children: [
        { path: 'about', component: AboutComponent},
        { path: 'deal', component: DealComponent},
        { path: 'deal/:id', component: DealViewComponent},
        { path: 'user/:id', component: UserComponent},
        { path: 'user/:id/edit', component: UserEditComponent},
        { path: 'company/:id', component: CompanyComponent},
        { path: 'company/:id/edit', component: CompanyComponent},
        { path: 'company/:id/contacts', component: ContactRootComponent, children: [
            { path: '', component: ContactComponent},
            { path: ':contactId', component: ContactComponent},
        ]},
        { path: 'company-create', component: CompanyCreateComponent},
        { path: 'instructions', component: InstructionsComponent},
        { path: 'inbox-create', component: InboxCreateComponent},
        { path: 'inbox/:id', component: InboxComponent, canDeactivate: [ConfirmDeactivateGuard]},
        { path: 'inbox/:id/folder/:folder', component: InboxComponent, canDeactivate: [ConfirmDeactivateGuard]},
        { path: 'inbox/:id/info', component: InboxInfoComponent},
        { path: '', redirectTo: 'deal'},
    ]},

];

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(mainRoutes),
        FormsModule,
        MomentModule,
        PopoverModule,
        TinymceModule.withConfig({
            skin_url: '/assets/tinymce/skins/feasy',
            plugins: [
                'textcolor',
                'lists',
                'directionality',
                'noneditable',
            ],
            height: 450,
            statusbar: false,
            menubar: false,
            toolbar: 'fontselect | fontsizeselect | forecolor | bold italic underline strikethrough | alignleft aligncenter alignright | numlist bullist | ltr rtl ',
            init_instance_callback: function (editor) {

                editor.on('paste', function (e) {

                    let data = e.clipboardData.getData('Text');

                    if (data.indexOf('<blockqute>') > 0) {
                        e.preventDefault();
                        e.stopPropagation();

                        data = '<div class="mceNonEditable">' + data + '</div>';

                        editor.execCommand('mceInsertRawHTML', true, data);
                    }
                });
            }
        }),
        Ng2DragDropModule.forRoot(),
        ModalModule.forRoot(),
        DatepickerModule.forRoot(),
        AlertModule.forRoot(),
        TooltipModule.forRoot(),
        ClipboardModule,
        ClickOutsideModule,
        PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG)
    ],
    declarations: [
        MainComponent,
        AboutComponent,
        DealComponent,
        DealViewComponent,
        InboxComponent,
        UserComponent,
        UserEditComponent,
        CompanyComponent,
        ContactRootComponent,
        ContactComponent,
        CompanyCreateComponent,
        InboxInfoComponent,
        InboxCreateComponent,
        InboxDealLinkerComponent,
        GoogleAuthComponent,
        CreateNewEmailComponent,
        CreateContactComponent,
        EmailHtmlViewComponent,
        InstructionsComponent,
        SignatureEditComponent,
        DealCreate,
        CompanyUsersPipe,
        CompanyContactsPipe,
        InboxSearchPipe,
        XBytesPipe,
        EllipsisSlicePipe,
        ContactListPipe,
        SafeHtmlPipe,
        GetCounteragentEmailPipe,
        ExtractNamePipe,
        ExtractEmailPipe,
        ParseEmailSenderStringPipe,
        DealTimerStatus,
        KeysPipe,
        convertTimeAgo,
        ListFocus,
        StopMousedownPropagation
    ],
    exports: [
        RouterModule,
    ],
    providers: [
        // providers used to create fake backend
        /*fakeBackendProvider,
        MockBackend,
        BaseRequestOptions*/
        CompanyUsersPipe,
        CompanyContactsPipe,
        InboxSearchPipe,
        ConfirmDeactivateGuard,
    ]

})

export class MainModule {}
