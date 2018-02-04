import {CompanyContactsPipe} from "./company-contacts-pipe";

let testInput = [
    {
        contact_name: 'some-contact-value',
        partner_name: 'some-partner-value'
    }, {
        contact_name: 'another-contact-value',
        partner_name: 'another-partner-value'
    }
];

// Company contacts pipe isolated tests
describe('Company contacts search pipe', () => {

    let pipe: CompanyContactsPipe;
    beforeEach(() => { pipe = new CompanyContactsPipe(); });

    it('should return input if no args', () => {
        expect(pipe.transform(testInput)).toEqual(testInput);
    });

    it('should return sorted data', () => {
        expect(pipe.transform(testInput, 'some'))
            .toEqual([testInput[0]]);
    });

    describe('filter', () => {

        it('must match "contact_name" fields', () => {
            expect(pipe.transform(testInput, 'another-contact'))
                .toEqual([testInput[1]]);
        });

        it('must match "partner_name" fields', () => {
            expect(pipe.transform(testInput, 'some-partner'))
                .toEqual([testInput[0]]);
        });
    });

});