import { MomentModule } from 'angular2-moment';
/**
 * Created by adrian on 5/15/17.
 */
import { Injectable} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Restangular } from 'ng2-restangular';

import * as moment from 'moment';
@Injectable()
export class DealService{
    active: number;
    postponed: number;
    closed: number;
    selectedUserId: number;
    selectedTabState: number;
    isUserOwner: boolean;
    currentDealId: number;
    currentPartnerId: number;
    currentDealOwnerId: number;
    currentCompanyId: number;
    currentDeals: Deal[];
    notLoadingDeals: boolean = true;
    public DealsObservable = new Subject<any>();
    public FilterObservable = new Subject<any>();
    public DealCreateObservable = new Subject<any>();
    public uploadedContractsObservable = new Subject<any>();


    //'deals/update-name/<firm_id:\d+>/<deal_id:\d+>/<partner_id:\d+>' => 'deal/update-name',  // инзминение  имени сделик и партнера для владельца сделок
    //'deals/update-name-not-owner/<firm_id:\d+>/<deal_id:\d+>/<partner_id:\d+>/<owner_id:\d+>' => 'deal/update-name-not-owner',  // инзминение name update для менеджера или администратора

    createDeal (newDeal: any) {
        this.restangular.all("deals").post(newDeal).subscribe(data=>{
            this.dealCreated(data);
        });
    }

    createDealRaw (newDeal: any) {
        return this.restangular.all("deals").post(newDeal);
    }

    updateDeal (newDeal: any) {
        //if user is owner of deal
        if (this.isUserOwner) {
            //deals/update-name/<firm_id:\d+>/<deal_id:\d+>/<partner_id:\d+>    метод  put    в айдишники  забиваешь  текущие данные.   и на этот адрес отсылаешь  джейсон.  {
            //"partner_id": 5,    -  если автокомплит  ничего не нашел  то в партнер айди в  джейсоне ставишь 0
            //"title": "sdfdsfdsf",
            //"partner_name": "sdfdsfsdffdgfg"
            //deals/update-name-not-owner'/<firm_id:\d+>/<deal_id:\d+>/<partner_id:\d+>/<owner_id:\d+>   - для  менеджера или админа.   ситуация  штатная, как и в предыдущей ссылке , только + в урл попадает owner_id  - владелец сделки (нужен  для проверки - нету ли махинаций)
            this.restangular.one("deals/update-name/"+this.currentCompanyId+"/"+this.currentDealId+"/"+this.currentPartnerId).customPUT({partner_id: newDeal.partner_id, title: newDeal.title, partner_name: newDeal.partner_name}).subscribe(data=>{
                this.dealCreated(data);
            });
        }
        else {
            this.restangular.all("deals/update-name-not-owner/"+this.currentCompanyId+"/"+this.currentDealId+"/"+this.currentPartnerId+"/"+this.currentDealOwnerId).customPUT(newDeal).subscribe(data=>{
                this.dealCreated(data);
            });
        }
    }

    uploadContract(file, companyId: number) {
        let formData = new FormData();
        formData.append("deal_id", companyId.toString());
        formData.append("file", file, file.name);

        return this.restangular.one('deal-files/files').customPOST(formData);
    }

    dealCreated(val) {
        this.DealCreateObservable.next(val);
    }

    dealsLoaded(val) {
        //should return false if no deals loaded
        this.DealsObservable.next(val);
    }
    filtersLoaded(val) {
        this.FilterObservable.next(val);
    }

    constructor(
        private restangular: Restangular
    ) { }

    getAll(userId: number) {
        return this.restangular.one('deals', userId).get();
    }

    getFilters(user_id: number, firm_id: number) {
        // console.log('launched getFilters');
        // console.log(user_id);
        let userId = user_id;
        // console.log('user_id is '+userId);
        // console.log('firm_id is '+firm_id);
        this.restangular.one('deals/filters/').one(userId.toString(), firm_id.toString()).get().subscribe(
            data => {
                this.selectedUserId = user_id;
                this.filtersLoaded(data);
                this.notLoadingDeals = true;
            },
            error => {
                //this.getFilters(user_id, firm_id);
            }
        );
    }

    //setting style class for deal if it has exceed some time after last update
    setTimers (data: any) {
        data.forEach(function(value, key) {
            let date = new Date (value.updated_at),
                today = new Date();
            date.setDate(date.getDate()+3);
            if (today > date) {
                value.dateWarning = true;
            }
            date.setDate(date.getDate()+5);
            if (today > date) {
                value.dateDanger = true;
            }
        });
    }

    //check for three types of deals, if there is such
    getByFilter(user_id: number, firm_id: number, tab: number) {
        console.log('getByFilter, userId is: '+user_id);
        //fetching all deals if they are listed in the filter
        this.restangular.one('deals/deals/' + tab + '/'+ user_id +'/'+ firm_id).get().subscribe(
            data => {
                this.selectedTabState = tab;
                this.selectedUserId = user_id;
                this.setTimers(data);
                data.map((item)=> {
                    // console.log(new Date(item.timer));
                    // console.log(new Date());
                    if (new Date > new Date(item.timer)) {
                        // console.log('setting timer to today');
                        item.timer = new Date();
                    }
                  item.updated_at = new Date(item.updated_at);
                  item.updated_at.setMinutes(item.updated_at.getMinutes() - item.updated_at.getTimezoneOffset());
                });
                this.dealsLoaded(data);
                this.notLoadingDeals = true;
                this.currentDeals = data;
            },
            error => {
                console.log('error while fetching active deals');
            }
        );
        this.notLoadingDeals = false;
    }

    updateUploadedContracts(companyId: number, dealId: number) {
        return this.restangular
            .one('deal-files/select-files?firm_id=' + companyId + '&deal_id=' + dealId)
            .get()
            .subscribe(data => {
            this.uploadedContractsObservable.next(data);
        });
    }

    getById(id: number) {
      this.notLoadingDeals = true;
        return this.restangular.one('deals/', id).get();
    }

    // private helper methods
    private handleError(error: any) {
        console.log(error);
        return Observable.throw(error.json());
    }

}
interface Deal {
    contracts: string,
    dateDanger: boolean,
    dateWarning: boolean,
    deal_id: number,
    deal_title: string,
    partner_id: number,
    partner_name: string,
    posts: string,
    timer: any,
    updated_at: string,
    username: string
}
