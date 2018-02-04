/**
 * Created by adrian on 6/30/17.
 */
export class LinkNewDeal {
    email_id: number;
    thread_id: string;
    deal_id: number;

    constructor(userInbox: number, threadSlug: string, dealId: number) {
        this.email_id = userInbox;
        this.thread_id = threadSlug;
        this.deal_id = dealId;
    }
}