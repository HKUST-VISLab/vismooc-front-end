/* eslint-disable import/no-webpack-loader-syntax, no-unused-expressions */
import { expect } from 'chai';

const datamanagerInjector = require('inject-loader!src/service/datamanager');

const mockVue =
    {
        use() { },
        http: {
            get(url) {
                this.url = '';
                return {
                    then: func => func(url),
                };
            },
        },
        url: '',
    };
const datamanager = datamanagerInjector({
    vue: mockVue,
});

const mainPath = process.env.NODE_ENV === 'development' ? 'http://localhost:9999' : location.origin;
const api = `${mainPath}/api`;
describe('Data API', () => {
    describe('getClicks', () => {
        it('should getCLicks', () => {
            const courseId = '1';
            const videoId = '2';
            const paramters = { a: 1, b: 2 };

            datamanager.default.getClicks(courseId, videoId, paramters, (url) => {
                let tmpURL = `${api}/getClicks?courseId=${courseId}&videoId=${videoId}`;
                Object.keys(paramters).forEach((p) => { tmpURL += `&${p}=${paramters[p]}`; });
                expect(url).to.be.equal(tmpURL);
            });
        });
    });

    describe('getCourseList', () => {
        it('should getCourseList', () => {
            datamanager.default.getCourseList((url) => {
                const tmpURL = `${api}/getCourseList`;
                expect(url).to.be.equal(tmpURL);
            });
        });
    });

    describe('getCourseInfo', () => {
        it('should getCourseInfo', () => {
            const courseId = '1';
            datamanager.default.getCourseInfo(courseId, (url) => {
                const tmpURL = `${api}/getCourseInfo?courseId=${courseId}`;
                expect(url).to.be.equal(tmpURL);
            });
        });
    });

    describe('getDemographicData', () => {
        it('should getDemographicData', () => {
            const courseId = '1';
            datamanager.default.getDemographicData(courseId, (url) => {
                const tmpURL = `${api}/getDemographicInfo?courseId=${courseId}`;
                expect(url).to.be.equal(tmpURL);
            });
        });
    });

    describe('logout', () => {
        it('should redirect to /logout', () => {
            // datamanager.default.logout();
        // TODO, need to mock window.location
            expect(true).to.be.true;
        });
    });

    describe('login', () => {
        it('should redirect to /login', () => {
            // datamanager.default.login();
        // TODO, need to mock window.location
            expect(true).to.be.true;
        });
    });
});
