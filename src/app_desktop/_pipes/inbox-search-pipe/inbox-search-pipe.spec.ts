import { InboxSearchPipe } from "./inbox-search-pipe";
import {Inbox} from "../../_models/inbox";

// Inbox search pipe isolated tests
describe('Inbox search pipe', () => {

    let pipe: InboxSearchPipe,
        thread1 = {
            emails: [{
                from: 'email1-from',
                to: 'email1-to',
                subject: 'email1 subject',
            }],
        },
        thread2 = {
            emails: [{
                from: 'email1-from',
                to: 'email2-to',
                subject: 'email2 subject',
            }],
        };
    beforeEach(() => {
        pipe = new InboxSearchPipe();
    });

    it('should return input if no search string provided', () => {
        expect(pipe.transform([thread1, thread2])).toEqual([thread1, thread2]);
    });

    it('should return empty array if no conjunctions found', () => {
        expect(pipe.transform([thread1, thread2], 'dashfjkdsahf')).toEqual([]);
    });

    describe('filter', () => {

        it('should filter by "from" field', () => {
            expect(pipe.transform([thread1, thread2], thread1.emails[0].from)).toEqual([thread1, thread2]);
        });

        it('should filter by "to" field', () => {
            expect(pipe.transform([thread1, thread2], thread1.emails[0].to)).toEqual([thread1]);
            expect(pipe.transform([thread1, thread2], thread2.emails[0].to)).toEqual([thread2]);
        });

        it('should filter by "subject" field', () => {
            expect(pipe.transform([thread1, thread2], thread1.emails[0].subject)).toEqual([thread1]);
            expect(pipe.transform([thread1, thread2], thread2.emails[0].subject)).toEqual([thread2]);
        });

    });
});