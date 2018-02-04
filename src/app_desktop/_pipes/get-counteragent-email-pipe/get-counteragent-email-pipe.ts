/**
 * Created by adrian on 6/22/17.
 */
import {Pipe} from "@angular/core";

@Pipe({
    name: 'GetCounteragentEmail'
})

export class GetCounteragentEmailPipe {

    transform(value, args) {

        let pattern = new RegExp(args, 'i'),
            result = value.filter(email => {
                return email ? !email.match(pattern) : email;
            });

        return result.length && result[0].length ? result : value[0];
    }
}