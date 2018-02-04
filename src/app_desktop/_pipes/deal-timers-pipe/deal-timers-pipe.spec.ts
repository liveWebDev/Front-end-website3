import { DealTimerStatus } from "./deal-timers-pipe";

// Deal timer status pipe isolated tests
describe('Deal timer status pipe', () => {

    let pipe: DealTimerStatus;
    beforeEach(() => {
        pipe = new DealTimerStatus;
    });

    it('should return empty string on empty input', () => {
        expect(pipe.transform('')).toEqual('');
    });

    it('should return string "warning" if provided timestamp is from 3 to 8 days old', () => {
        expect(pipe.transform(new Date().getTime() - (3 * 24 * 3600 * 1000))).toEqual('warning');
        expect(pipe.transform(new Date().getTime() - (5 * 24 * 3600 * 1000))).toEqual('warning');
        expect(pipe.transform(new Date().getTime() - (8 * 24 * 3600 * 1000 - 1))).toEqual('warning');
    });

    it('should return string "danger" if provided timestamp is 8 or more days old', () => {
        expect(pipe.transform(new Date().getTime() - (8 * 24 * 3600 * 1000))).toEqual('danger');
        expect(pipe.transform(new Date().getTime() - (10 * 24 * 3600 * 1000))).toEqual('danger');
        expect(pipe.transform(0)).toEqual('danger');
    });

    it('should return empty string if provided timestamp is lesser than 3 days old', () => {
        expect(pipe.transform(new Date().getTime())).toEqual('');
        expect(pipe.transform(new Date().getTime() - (3 * 24 * 3600 * 1000 - 1))).toEqual('');
    });
});