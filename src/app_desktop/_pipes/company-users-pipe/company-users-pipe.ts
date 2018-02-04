/**
 * Created by adrian on 6/21/17.
 */
import {Pipe} from "@angular/core";

@Pipe({
    name: 'CompanyUsersPipe'
})

export class CompanyUsersPipe {

    transform(value, args?) {

        let name = new RegExp(args ? args : '.*', 'i');

        return value.filter(user => {
            return user.username.match(name);
        });
    }
}