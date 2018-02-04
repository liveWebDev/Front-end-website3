/**
 * Created by adrian on 6/21/17.
 */
import {Pipe} from "@angular/core";

@Pipe({
    name: 'InboxSearchPipe'
})

export class InboxSearchPipe {

    transform(value, args?) {

        let criteria = new RegExp(args ? args : '.*', 'i');

        return value.filter(thread => {
            return thread.emails[0].from.match(criteria) || thread.emails[0].to.match(criteria) || thread.emails[0].subject.match(criteria);
        });
    }
}