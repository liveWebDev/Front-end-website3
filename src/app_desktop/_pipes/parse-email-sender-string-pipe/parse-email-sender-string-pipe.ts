import {Pipe} from "@angular/core";

@Pipe({
    name: 'ParseEmailSender'
})

export class ParseEmailSenderStringPipe {

    transform(value, args?) {

        if (value && typeof value == 'object') {
            value = value[0];
        }

        let parts = value.replace('<', '').replace('>', '').split(' ');

        return {
            email: parts.pop(), //remove last element which actually is email
            name: parts.length ? parts.join(' ') : ''
        };
    }
}