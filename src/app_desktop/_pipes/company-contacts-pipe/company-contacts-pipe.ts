/**
 * Created by adrian on 6/22/17.
 */
import {Pipe} from "@angular/core";

@Pipe({
    name: 'CompanyContactsPipe'
})

export class CompanyContactsPipe {

    transform(value, args?) {

        let name = new RegExp(args ? args : '.*', 'i');
        return value.filter(contact => {
            return contact.contact_name.match(name) || contact.partner_name.match(name);
        });
    }
}