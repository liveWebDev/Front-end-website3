/**
 * Created by adrian on 6/22/17.
 */
import {Pipe} from "@angular/core";

@Pipe({
    name: 'ExtractName'
})

export class ExtractNamePipe {

    transform(value, args?) {

        if (value && typeof value == 'object') {
            value = value[0];
        }

        let parts = value.split('<');

        return parts.length > 1 ? parts[0].replace(/\s+$/, '') : value;
    }
}