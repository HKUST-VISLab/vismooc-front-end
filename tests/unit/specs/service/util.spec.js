import { arrayAggregate } from 'src/service/util';
import { expect } from 'chai';

describe('arrayAggregate', () => {
    describe('length of arr is less than 1', () => {
        it('should return the arr directly', () => {
            const input0 = [];
            const input1 = [1];
            expect(arrayAggregate(0, input0)).to.be.equal(input0);
            expect(arrayAggregate(1, input1)).to.be.equal(input1);
        });
    });
    describe('aggregate the arr', () => {
        it('should aggregatethe arr', () => {
            const input = [1, 2, 3, 4];
            expect(arrayAggregate(2, input)).to.be.deep.equal([3, 7]);
            expect(arrayAggregate(3, input)).to.be.deep.equal([6, 4]);
        });
    });
});
