/**
 * Created by adrian on 6/30/17.
 */
import {EventEmitter, Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";

@Injectable()
export class UIService {
    public changeLayout: EventEmitter<any>;
    public messageToaster: EventEmitter<any>;

    constructor() {
        this.changeLayout = new EventEmitter();
        this.messageToaster = new EventEmitter();
    }

    changeLayoutClass(data: any) {
        this.changeLayout.emit(data);
    }

    toastMessage(data: any) {
        this.messageToaster.emit(data);
    }
}