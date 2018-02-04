/**
 * Created by adrian on 6/1/17.
 */
export class EmailBullitList {
    list: string[];
    input: string;

    constructor(data?: any) {
        if (data && typeof data === "string") {

            this.list = [data];
        } else if (data && data instanceof Array) {

            this.list = data;
        } else {

            this.list = [];
        }

        this.input = '';
    }

    serialize() {
        return this.list.join(', ');
    }

    pullItem(index?: number) {
        if (index) {
            return this.list.splice(index, 1)[0];
        } else {
            return this.list.pop();
        }
    }

    removeItem(index?: number) {
         return this.pullItem(index);
    }

    appendList(item: string) {

        if (this.validateEmail(item)) {
            return this.list.push(item);
        } else {
            return false;
        }
    }

    validateEmail(item: string) {
        let re = new RegExp('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:(?:[a-z0-9-]*[a-z0-9])?.)+(?:[a-z0-9-]*[a-z0-9])?\.[a-z0-9]{2,}$');

        return re.test(item);
    }

    checkAndAppend() {
        if (this.input && this.appendList(this.input)) {
            this.input = '';
        }
    }

}