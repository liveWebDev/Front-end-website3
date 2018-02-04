/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation} from '@angular/core';

import {User} from "../_models/user";

import {CompanyService} from "../_services/company.service";
import {UserService} from "../_services/user.service";
import {DealService} from "../_services/deal.service";


@Component({
    templateUrl: './company.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './company.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [UserService],
})

export class CompanyComponent {
    user: User;
    currentCompany: CurrentCompany;
    isDataLoaded: boolean;
    roles: string[];
    users: User[];

    constructor(
        private companyService: CompanyService,
        private userService: UserService,
        private dealService: DealService
    ) {

        this.companyService.companyObservable.subscribe(data => {
            this.currentCompany = data;

        });

        this.isDataLoaded = false;
        this.roles = ['Founder', 'Manager', 'Sales']

    };
}

interface Company {
    firm_id: number,
    hot: string,
    title: string,
}

interface CurrentCompany {
    id: number,
    title: string,
    description: string,
    creator: number,
    created_at: string,
    updated_at: string,
}