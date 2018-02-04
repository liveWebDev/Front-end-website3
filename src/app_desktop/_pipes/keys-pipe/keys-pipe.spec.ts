import {KeysPipe} from "./keys-pipe"

// Keys pipe isolated tests
describe('Keys pipe', () => {

    let pipe: KeysPipe;
    beforeEach(() => { pipe = new KeysPipe(); });

    it('should return empty array if empty object given', () => {
        expect(pipe.transform({}).length).toBe(0);
    });

    describe('Transform function', () => {

        it('should return array with equal length', () => {
            let test = {a: 0};

            expect(pipe.transform(test).length).toBe(Object.keys(test).length);
        });

    });

    describe('Returned value', () => {
        it('should contain key-value objects collected from input', () => {
            let test = {a: 0};

            expect(pipe.transform(test)[0]["key"]).toBe(Object.keys(test)[0]);
            expect(pipe.transform(test)[0]["value"]).toBe(test[Object.keys(test)[0]]);
        });
    });
});