import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";

@Injectable()
export class CreateEmailService {
    public emailCreatorStateObservable = new Subject<any>();

    dropEmailCreatorsState() {
        this.emailCreatorStateObservable.next('');
    }

    setEmailCreatorsState(value: string) {
        this.emailCreatorStateObservable.next(value);
    }
}