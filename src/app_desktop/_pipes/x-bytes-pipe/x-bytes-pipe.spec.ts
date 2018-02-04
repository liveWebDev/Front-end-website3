import {XBytesPipe} from "./x-bytes-pipe"

// XBytes pipe isolates tests
describe('XBytes pipe', () => {

    let pipe: XBytesPipe;
    beforeEach(() => { pipe = new XBytesPipe(); });

    it('should correctly work with 0', () => {
        expect(pipe.transform(0)).toBe('0.00 Kb');
    });

    it('should return "Kb" as a measure if input is lesser then 1000000', () => {
        expect(pipe.transform(1000)).toBe('0.98 Kb');
        expect(pipe.transform(5000)).toBe('4.88 Kb');
        expect(pipe.transform(200000)).toBe('195.31 Kb');
        expect(pipe.transform(1000035)).toBe('976.60 Kb');
    });

    it('should return "Mb" as a measure if input is greater then 1000000', () => {
        expect(pipe.transform(1048036)).toBe('1.00 Mb');
        expect(pipe.transform(5000000)).toBe('4.77 Mb');
        expect(pipe.transform(20000000)).toBe('19.07 Mb');
    });
});