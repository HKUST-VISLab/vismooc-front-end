/* eslint-disable no-unused-expressions */
import { isAuthenticated } from 'src/service/auth';
import { NO_PERMISSION_1 } from 'src/service/datamanager';

import { expect } from 'chai';

describe('isAuthenticated', () => {
    describe('authenticated', () => {
        it('should return true if isAuthenticated', () => {
            expect(isAuthenticated()).to.be.true;
        });
    });
    describe('unAuthenticated', () => {
        it('should return false if unAuthenticated', () => {
            expect(isAuthenticated(NO_PERMISSION_1)).to.be.false;
        });
    });
});
