/**
 * Created by adrian on 6/21/17.
 */
import {Pipe} from "@angular/core";

@Pipe({
    name: 'EllipsisSlicePipe'
})

export class EllipsisSlicePipe {

    transform(value, args) {
        return value.slice(0, args) + (value.length > args ? '...' : '');
    }
}