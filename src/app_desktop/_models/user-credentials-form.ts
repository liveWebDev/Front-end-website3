/**
 * Created by adrian on 6/4/17.
 */
export class UserCredentialsForm {
    password: string;
    new_email: string;
    new_password: string;
    newPassRepeat: string;

    constructor(
        password: string,
        new_email?: string,
        new_password?: string,
        newPassRepeat?: string,
    ) {  }

}