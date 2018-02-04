/**
 * Created by adrian on 7/23/17.
 */
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'xBytes'})

export class XBytesPipe implements PipeTransform {
    transform(value, args?:string[]) : any {
        let xBytes = value / 1024;

        if (xBytes > 999) {
            return (xBytes / 1024).toFixed(2) + ' Mb';
        } else {
            return xBytes.toFixed(2) + ' Kb';
        }
    }
}