/**
 * Created by adrian on 6/10/17.
 */
export class CredentialsErrors {
    password: string;
    new_email: string;
    new_password: string;
    newPassRepeat: string;

    constructor(
        password?: string,
        new_email?: string,
        new_password?: string,
        newPassRepeat?: string,
    ) {  }
}