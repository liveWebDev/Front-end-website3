/**
 * Created by adrian on 6/27/17.
 */
export class Signature {
    id: number;
    emailID: number;
    name: string;
    text: string;

    constructor(data?: SignatureInterface) {

        if (data) {
            this.id = data.id;
            this.emailID = data.email_id;
            this.name = data.name;
            this.text = data.text;
        } else {
            this.id = 0;
            this.emailID = 0;
            this.name = '';
            this.text = '';
        }
    }

    prepareForTransfer() {
        return {
            name: this.name,
            text: this.text
        }
    }
}

interface SignatureInterface {
    id: number,
    email_id: number,
    name: string,
    text: string
}