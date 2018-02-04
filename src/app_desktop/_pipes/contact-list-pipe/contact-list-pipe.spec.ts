import { ContactListPipe } from "./contact-list-pipe";

// Contact list pipe isolated tests
describe('Contact list pipe', () => {

    let pipe: ContactListPipe,
        testContactList = [{
            partner_name: 'partner1'
        }, {
            partner_name: 'partner2'
        }, {
            partner_name: 'anotherPartner'
        }];
    beforeEach(() => {
        pipe = new ContactListPipe();
    });

    it('should return empty array if empty input provided', () => {
        expect(pipe.transform([])).toEqual([]);
    });

    describe('Each object in returned array', () => {
        it('should contain defined "contactChar" field', () => {
            pipe.transform(testContactList).forEach(item => {
                expect(item.contactChar).toBeDefined();
            });
        });
    });

    describe('ContactChar field', () => {
        it('should match the first symbol of "partner_name" field in related contact list', () => {
            pipe.transform(testContactList).forEach(item => {
                item.contactList.forEach(contactItem => {
                    expect(Array.from(contactItem.partner_name)[0].toString().toUpperCase()).toEqual(item.contactChar);
                })
            });
        });
    });

    describe('Count of returned contacts', () => {
        it('should match count of input contacts', () => {
            expect(pipe.transform(testContactList).map(item => {
                return item.contactList.length;
            }).reduce((prev, current) => {
                return prev + current;
            })).toEqual(testContactList.length);
        });
    });
});