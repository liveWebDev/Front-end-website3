/**
 * Created by adrian on 7/24/17.
 */
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'dealTimerStatus'})

export class DealTimerStatus implements PipeTransform {
    transform(value, args?:string[]) : any {

        let date = new Date (value),
            today = new Date(),
            result = '';

        date.setTime(date.getTime() + 3*24*3600*1000);
        if (today >= date) {
            result = 'warning';
        }

        date.setTime(date.getTime() + 5*24*3600*1000);
        if (today >= date) {
            result = 'danger';
        }
        return result;
    }
}
