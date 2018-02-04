import { convertTimeAgo } from "./time-ago-converting-pipe";

// convertTimeAgo isolated tests
describe('convertTimeAgo pipe', () => {

    let pipe: convertTimeAgo;
    beforeEach(() => {
        pipe = new convertTimeAgo();
    });

    it('should change input with substring "an hour"', () => {
        describe('The output', () => {

            it('should contain string "1 hour"', () => {
                expect(pipe.transform('an hour')).toContain('1 hour');
            });

            it('should not contain string "an hour"', () => {
                expect(pipe.transform('an hour')).not.toContain('an hour');
            });
        });
    });

    it('should change input with substring "a day"', () => {
        describe('The output', () => {

            it('should contain string "1 day"', () => {
                expect(pipe.transform('a day')).toContain('1 day');
            });

            it('should not contain string "an hour"', () => {
                expect(pipe.transform('a day')).not.toContain('a day');
            });
        });
    });

    it('should change input with substring "1 days left"', () => {
        describe('The output', () => {

            it('should contain string "1 day left"', () => {
                expect(pipe.transform('1 days left')).toContain('1 day left');
            });

            it('should not contain string "1 days left"', () => {
                expect(pipe.transform('1 days left')).not.toContain('1 days left');
            });
        });
    });

    it('should change input with substring "-0 days left"', () => {
        describe('The output', () => {

            it('should contain string "0 days left"', () => {
                expect(pipe.transform('-0 days left')).toContain('0 days left');
            });

            it('should not contain string "-0 days left"', () => {
                expect(pipe.transform('-0 days left')).not.toContain('-0 days left');
            });
        });
    });

    it('should change input with time substring "00:00:00"', () => {
        describe('The output', () => {

            it('should not contain string " 00:00:00"', () => {
                expect(pipe.transform(' 00:00:00')).not.toContain(' 00:00:00');
            });
        });
    });
});