import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'contactList'})

export class ContactListPipe implements PipeTransform {
    transform(value, args?:string[]) : any {

        let result = [];
        let charList: string[] = [];

        value.forEach(item => {
            if (item.partner_name) {
                charList.push(Array.from(item.partner_name)[0].toString().toUpperCase());
            }
        });

        charList = charList.filter((item, index, arr) => {
            return arr.indexOf(item) === index;
        }).sort();

        charList.forEach(char => {
            let group = {
                contactChar: char,
                contactList: []
            };

            value.forEach(item => {
                if (item.partner_name && Array.from(item.partner_name)[0].toString().toUpperCase() === char) {
                    group.contactList.push(item);
                }
            });

            result.push(group);
        });

        return result;

    }
}