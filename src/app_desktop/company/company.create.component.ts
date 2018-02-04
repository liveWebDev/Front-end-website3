/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation} from '@angular/core';

import {CompanyService} from "../_services/company.service";
import { Router, ActivatedRoute } from '@angular/router';
import {UserService} from "../_services/user.service";
import {DealService} from "../_services/deal.service";


@Component({
    templateUrl: './company.create.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './company.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [UserService],
})

export class CompanyCreateComponent {
    newCompany: any = {};
    submitAttempt: boolean = false;
    constructor(
        private companyService: CompanyService,
        private router: Router
    ) {

    };

    createCompany (event: Event, title: string, description: string) {
        event.preventDefault();
        this.submitAttempt = true;
        this.companyService.create(title, description).subscribe(
            data => {
                localStorage.setItem('currentFirm', JSON.stringify({
                    id: data.id,
                    title: data.title,
                }));
                this.companyService.currentCompanyTitle = data.title;
                this.companyService.currentCompanyId = data.id;
                this.companyService.getByUserId();
                this.companyService.noCompanies = false;
                this.companyService.companiesObservable.subscribe(res=> {
                  //alert('got company in list left');
                    this.router.navigate(["/main/deal"]);
                });
            }
        );
    }

}

