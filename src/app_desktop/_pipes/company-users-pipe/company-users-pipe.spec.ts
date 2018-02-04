import { CompanyUsersPipe } from "./company-users-pipe";
import { User } from "../../_models/user";

// Company users pipe isolated tests
describe('Compay users pipe', () => {

    let pipe: CompanyUsersPipe,
        testInput = [
            new User('user1'),
            new User('user2'),
        ];
    beforeEach(() => {
        pipe = new CompanyUsersPipe();
    });

    it('should return input if no args specified', () => {
        expect(pipe.transform(testInput)).toEqual(testInput);
    });

    it('should return data filtered by username', () => {
        expect(pipe.transform(testInput, 'user1')).toEqual([testInput[0]]);
    });

    it('should return empty array if no relevant names found', () => {
        expect(pipe.transform(testInput, 'dhjkfhsdjk')).toEqual([]);
    });
});