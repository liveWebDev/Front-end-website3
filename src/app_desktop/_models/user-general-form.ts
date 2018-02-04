/**
 * Created by adrian on 6/3/17.
 */
export class UserGeneralForm {
    username: string;
    phone: string;
    skype: string;
    facebook: string;
    linkedin: string;

    constructor(
        username: string,
        phone?: string,
        skype?: string,
        facebook?: string,
        linkedin?: string,
    ) {}
}