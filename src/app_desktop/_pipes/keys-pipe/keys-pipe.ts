/**
 * Created by adrian on 7/11/17.
 */
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'keys'})

export class KeysPipe implements PipeTransform {
    transform(value, args?:string[]) : any {
        let keys = [];
        for (let key in value) {
            keys.push({key: key, value: value[key]});
        }
        return keys;
    }
}