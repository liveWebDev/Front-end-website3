import {Pipe} from "@angular/core";

@Pipe({
	name : "convertTimeAgo"
})

export class convertTimeAgo{
	transform(value){

        let newValue = value;

        newValue = newValue.replace('an hour', '1 hour');
        newValue = newValue.replace('a day', '1 day');
        newValue = newValue.replace('1 days left', '1 day left');
        newValue = newValue.replace('-0 days left', '0 day left');
        newValue = newValue.replace(' 00:00:00', '');

		return newValue;
	}
}
