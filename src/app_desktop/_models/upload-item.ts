/**
 * Created by adrian on 6/30/17.
 */
export class UploadItem {
    id: number;
    filename: string;
    status: number;

    constructor(id:number, filename: string, status: number) {
        this.id = id;
        this.filename = filename;
        this.status = status;
    }
}