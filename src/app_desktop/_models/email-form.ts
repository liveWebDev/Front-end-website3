/**
 * Created by adrian on 6/27/17.
 */
export class EmailForm {
    from: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    content: string;
    attaches: File[];

    originalUid: number;
    threadId: string;

    constructor(from?: string, to?: string, subject?: string, originalUid?: number) {

        this.from = from ? from : '';
        this.to = to ? to : '';
        this.cc = '';
        this.bcc = '';
        this.subject = subject ? subject : '';
        this.content = '';
        this.attaches = [];
        this.originalUid = originalUid;

    }
}