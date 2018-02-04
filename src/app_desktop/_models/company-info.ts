/**
 * Created by adrian on 6/12/17.
 */
export class CompanyInfo {
    title?: string;
    description?: string;

    constructor(title?, description?) {
        this.title = title ? title : '',
        this.description = description ? description : ''
    }
}