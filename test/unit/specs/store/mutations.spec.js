/* eslint-disable no-unused-expressions */
import mutations from 'store/mutations';
import {
    TRIGGER_SIDEBAR,
    GET_COURSES_LIST,
    SELECT_COURSE,
    SELECT_VIDEO,
    FETCH_CLICKS,
    FETCH_DEMOGRAPHICINFO,
    UPDATE_CLICKS_FILTER,
    LOADING,
    FINISHED_LOADING,
} from 'store/types';
import { expect, config } from 'chai';

config.truncateThreshold = 0;

describe('mutations', () => {
    describe(TRIGGER_SIDEBAR, () => {
        it('should set the state.sideBarIsCollapsed to value if provide boolean args', () => {
            const state = { sideBarIsCollapsed: false };
            mutations[TRIGGER_SIDEBAR](state, true);
            expect(state.sideBarIsCollapsed).to.equal(true);
            mutations[TRIGGER_SIDEBAR](state, false);
            expect(state.sideBarIsCollapsed).to.equal(false);
        });
        it('should trigger the state.sideBarIsCollapsed if no provide boolean args', () => {
            const state = { sideBarIsCollapsed: false };
            mutations[TRIGGER_SIDEBAR](state);
            expect(state.sideBarIsCollapsed).to.equal(true);
            mutations[TRIGGER_SIDEBAR](state);
            expect(state.sideBarIsCollapsed).to.equal(false);
        });
    });
    describe(GET_COURSES_LIST, () => {
        it('should do nothing if no coursesList', () => {
            const state = {};
            mutations[GET_COURSES_LIST](state, 1);
            expect(Object.keys(state)).with.lengthOf(0);
        });
        it('should sort the courseList and set to state', () => {
            const state = {};
            const coursesList = [
                { year: '2017_Q4_R1', name: '2' },
                { year: '2017_Q4_R1' },
                { name: '2' },
                { name: '3' },
                { year: '2017_Q4_R9', name: '1' },
                { year: '2017_Q4_R9', name: '2' },
            ];
            mutations[GET_COURSES_LIST](state, { coursesList });
            const expectCoursesList = [
                { year: '2017_Q4_R9', name: '2' },
                { year: '2017_Q4_R9', name: '1' },
                { year: '2017_Q4_R1' },
                { year: '2017_Q4_R1', name: '2' },
                { name: '3' },
                { name: '2' },
            ];
            expect(state.coursesList).to.be.frozen;
            expect(state.coursesList).to.have.deep.ordered.members(expectCoursesList);
        });
    });
    describe(SELECT_COURSE, () => {
        it('should do nothing if no course', () => {
            const state = {};
            mutations[SELECT_COURSE](state, 1);
            expect(Object.keys(state)).with.lengthOf(0);
        });
        describe('if selected course is not none', () => {
            it('should set and freeze the new course if it is fresh', () => {
                const state = { courses: [] };
                const course = {
                    id: 'id',
                    videos: [
                        { section: '1>>a>>2>>b' },
                        { section: '2>>a>>3>>b' },
                        { section: '1>>b>>1>>c' }],
                };
                const expectedVideos = [
                    { section: '1>>b>>1>>c' },
                    { section: '1>>a>>2>>b' },
                    { section: '2>>a>>3>>b' },
                ];

                mutations[SELECT_COURSE](state, { course, fresh: true });
                expect(state.courses[course.id]).to.be.frozen;
                expect(state.courses[course.id]).deep.equals(course);
                expect(state.courses[course.id].videos).to.have.deep.equal(expectedVideos);
            });
            it('should set the selectedCourse, reset the selectedVideo and denselogs no matter fresh or not', () => {
                let state = { courses: [], selectedVideo: 1, denseLogs: 2, selectedCourse: null };
                const course = {
                    id: 'id',
                    videos: [
                        { section: '1>>a>>2>>b' },
                        { section: '2>>a>>3>>b' },
                        { section: '1>>b>>1>>c' },
                    ],
                };

                mutations[SELECT_COURSE](state, { course, fresh: true });
                expect(state.selectedVideo).to.be.null;
                expect(state.denseLogs).to.be.null;

                state = { courses: [], selectedVideo: 1, denseLogs: 2, selectedCourse: null };
                mutations[SELECT_COURSE](state, { course, fresh: false });
                expect(state.selectedVideo).to.be.null;
                expect(state.denseLogs).to.be.null;
            });
            it('should set the selectedCourse as a frozen object', () => {
                let state = { courses: [], selectedVideo: 1, denseLogs: 2, selectedCourse: null };
                let course = {
                    id: 'id',
                    videos: [
                        { section: '1>>a>>2>>b' },
                        { section: '2>>a>>3>>b' },
                        { section: '1>>b>>1>>c' },
                    ],
                };
                const expectedVideos = [
                    { section: '1>>b>>1>>c' },
                    { section: '1>>a>>2>>b' },
                    { section: '2>>a>>3>>b' },
                ];

                mutations[SELECT_COURSE](state, { course, fresh: true });
                expect(state.selectedCourse).deep.equals(course);
                expect(state.selectedCourse).to.be.frozen;
                expect(state.selectedCourse.videos).to.have.deep.equal(expectedVideos);

                course = {
                    id: 'id',
                    videos: [
                        { section: '1>>b>>1>>c' },
                        { section: '1>>a>>2>>b' },
                        { section: '2>>a>>3>>b' },
                    ],
                };
                state = { courses: [], selectedVideo: 1, denseLogs: 2, selectedCourse: null };
                mutations[SELECT_COURSE](state, { course, fresh: false });
                Object.freeze(course);
                expect(state.selectedCourse).deep.equals(course);
                expect(state.selectedCourse).to.be.frozen;
                expect(state.selectedCourse.videos).to.have.deep.equal(expectedVideos);
            });
        });
    });
    describe(SELECT_VIDEO, () => {
        it('should do nothing if no video', () => {
            const state = {};
            mutations[SELECT_VIDEO](state, 1);
            expect(Object.keys(state)).with.lengthOf(0);
        });
        describe('if selectedVideo is not null', () => {
            it('should init clicksFilters if no clicksFilters', () => {
                const state = { selectedCourse: { startDate: '100000', endDate: '200000' } };
                const video = {};
                mutations[SELECT_VIDEO](state, { selectedVideo: video });
                expect(video).has.property('clicksFilters').which.is.an('object');
                expect(video.clicksFilters.startDate).to.deep.equal(new Date(state.selectedCourse.startDate));
                expect(video.clicksFilters.endDate).to.deep.equal(new Date(state.selectedCourse.endDate));
                expect(video.clicksFilters.countries).is.an('array').with.lengthOf(0);
            });
            it('should do nothing if clicksFilters already exists', () => {
                const state = { selectedCourse: { startDate: '100000', endDate: '200000' } };
                const video = { clicksFilters: 1 };
                mutations[SELECT_VIDEO](state, { selectedVideo: video });
                expect(video).has.property('clicksFilters').which.is.an('number');
                expect(video.clicksFilters).to.equal(1);
            });
            it('should set the video to selectedVideo', () => {
                const state = { selectedCourse: { startDate: '100000', endDate: '200000' } };
                const video = {};
                mutations[SELECT_VIDEO](state, { selectedVideo: video });
                expect(state.selectedVideo).deep.equals(video);
            });
        });
    });
    describe(FETCH_CLICKS, () => {
        it('should do nothing if no denseLogs', () => {
            const state = {};
            mutations[FETCH_CLICKS](state, 1);
            expect(Object.keys(state)).with.lengthOf(0);
        });
        it('should assign the denseLogs to state.denseLogs if it is not fresh', () => {
            const state = {};
            mutations[FETCH_CLICKS](state, { denseLogs: 101 });
            expect(state.denseLogs).to.equal(101);
        });
        describe('when is fresh', () => {
            it('should freeze the denseLogs and assign the it to the video based on its courseId and videoId', () => {
                const state = { courses: { course: { videos: [{ id: 'video', duration: 100 }] } } };
                const denseLogs = { courseId: 'course', videoId: 'video', denseLogs: [101, 202] };
                mutations[FETCH_CLICKS](state, { denseLogs, fresh: true });
                expect(state.courses.course.videos.find(v => v.id === denseLogs.videoId).denseLogs)
                    .to.deep.equal(denseLogs.denseLogs);
                expect(state.courses.course.videos.find(v => v.id === denseLogs.videoId).denseLogs)
                    .to.be.frozen;
            });
            it('should assign the denseLogs to state.denseLogs', () => {
                const state = { courses: { course: { videos: [{ id: 'video', duration: 100 }] } } };
                const denseLogs = { courseId: 'course', videoId: 'video', denseLogs: [101, 202] };
                mutations[FETCH_CLICKS](state, { denseLogs, fresh: true });
                expect(state.denseLogs).to.deep.equal(denseLogs.denseLogs);
                expect(state.denseLogs).to.be.frozen;
            });
            it('should cal the duration if the targeted video has no duration', () => {
                const state = { courses: { course: { videos: [{ id: 'video' }] } } };
                const denseLogs = {
                    courseId: 'course',
                    videoId: 'video',
                    denseLogs: [
                        { clicks: [{ oldTime: 1 }, { oldTime: 2, currentTime: 3, newTime: 4 }] },
                        { clicks: [{ currentTime: 5 }] },
                        { clicks: [{ newTime: 6 }] },
                    ],
                };
                mutations[FETCH_CLICKS](state, { denseLogs, fresh: true });
                expect(state.courses.course.videos.find(v => v.id === denseLogs.videoId).duration)
                    .to.equal(6);
            });
            it('should inject the demographic data to each clicks if the demographic data exist', () => {
                const state = {
                    demographicInfo: [{ users: [1, 2, 3], code3: 'CHN' }, { users: [4] }],
                    courses: { course: { videos: [{ id: 'video' }] } },
                };
                const denseLogs = {
                    courseId: 'course',
                    videoId: 'video',
                    denseLogs: [
                        { clicks: [{ oldTime: 1, userId: 1 }, { oldTime: 2, currentTime: 3, newTime: 4, userId: 2 }] },
                        { clicks: [{ currentTime: 5, userId: 3 }] },
                        { clicks: [{ newTime: 6, userId: 4 }, { userId: 5 }] },
                    ],
                };
                mutations[FETCH_CLICKS](state, { denseLogs, fresh: true });
                const expectedDenseLogs = [
                    {
                        clicks: [{ oldTime: 1, userId: 1, country: 'CHN' },
                            { oldTime: 2, currentTime: 3, newTime: 4, userId: 2, country: 'CHN' }],
                        countryInjected: true,
                    },
                    { clicks: [{ currentTime: 5, userId: 3, country: 'CHN' }], countryInjected: true },
                    {
                        clicks: [{ newTime: 6, userId: 4, country: 'UnKnown' }, { userId: 5, country: 'UnKnown' }],
                        countryInjected: true,
                    },
                ];
                expect(state.denseLogs).to.deep.equal(expectedDenseLogs);
                expect(state.denseLogs).to.be.frozen;
            });
        });
    });
    describe(FETCH_DEMOGRAPHICINFO, () => {
        it('should do nothing if no denseLogs', () => {
            const state = {};
            mutations[FETCH_DEMOGRAPHICINFO](state, 1);
            expect(Object.keys(state)).with.lengthOf(0);
        });
        it('should assign the demographic to state.demographicInfo if it is not fresh', () => {
            const state = {};
            mutations[FETCH_DEMOGRAPHICINFO](state, { demographicInfo: 101 });
            expect(state.demographicInfo).to.equal(101);
        });
        describe('if it is fresh', () => {
            it('should assign the demographicInfo based on courseId', () => {
                const state = {
                    courses: { course1: { videos: [] } },
                    coursesDemographicInfo: {},
                };
                const demographicInfo = {
                    courseId: 'course1',
                    demographicInfo: [{ users: [1, 2, 3], code3: 'CHN' }, { users: [4] }],
                };
                mutations[FETCH_DEMOGRAPHICINFO](state, { demographicInfo, fresh: true });
                expect(state.coursesDemographicInfo.course1).to.deep.equal(demographicInfo.demographicInfo);
                expect(state.coursesDemographicInfo.course1).to.be.frozen;
                expect(state.demographicInfo).to.deep.equal(demographicInfo.demographicInfo);
            });
            it('should inject country to clicks', () => {
                const videos = [
                    {
                        id: 'video1',
                        denseLogs: [
                            {
                                clicks: [
                                    { oldTime: 1, userId: 1, country: 'CHN' },
                                    { oldTime: 2, currentTime: 3, newTime: 4, userId: 2, country: 'CHN' },
                                ],
                                countryInjected: true,
                            },
                        ],
                    },
                    {
                        id: 'video2',
                        denseLogs: [
                            { clicks: [{ currentTime: 5, userId: 3 }] },
                            { clicks: [{ newTime: 6, userId: 4 }, { userId: 5 }] },
                        ],
                    },
                ];
                const state = { courses: { course1: { videos } }, coursesDemographicInfo: {} };
                const demographicInfo = {
                    courseId: 'course1',
                    demographicInfo: [{ users: [1, 2, 3], code3: 'CHN' }, { users: [4] }],
                };
                mutations[FETCH_DEMOGRAPHICINFO](state, { demographicInfo, fresh: true });
                const expectedVideos = [
                    {
                        id: 'video1',
                        denseLogs: [
                            {
                                clicks: [
                                    { oldTime: 1, userId: 1, country: 'CHN' },
                                    { oldTime: 2, currentTime: 3, newTime: 4, userId: 2, country: 'CHN' },
                                ],
                                countryInjected: true,
                            },
                        ],
                    },
                    {
                        id: 'video2',
                        denseLogs: [
                            { clicks: [{ currentTime: 5, userId: 3, country: 'CHN' }], countryInjected: true },
                            {
                                clicks: [
                                    { newTime: 6, userId: 4, country: 'UnKnown' },
                                    { userId: 5, country: 'UnKnown' }],
                                countryInjected: true,
                            },
                        ],
                    },
                ];
                expect(state.courses.course1.videos).to.deep.equal(expectedVideos);
                expect(state.coursesDemographicInfo.course1).to.be.frozen;
                expect(state.demographicInfo).to.deep.equal(demographicInfo.demographicInfo);
            });
        });
    });
    describe(UPDATE_CLICKS_FILTER, () => {
        it('should do nothing if no id', () => {
            const state = {};
            mutations[UPDATE_CLICKS_FILTER](state, 1);
            expect(Object.keys(state)).with.lengthOf(0);
        });
        it('should remove the filter if value is null or undefined', () => {
            const state = { selectedVideo: { clicksFilters: { filter1: 1, filter2: 2 } } };
            mutations[UPDATE_CLICKS_FILTER](state, { id: 'filter1' });
            expect(state.selectedVideo.clicksFilters).to.have.not.property('filter1');

            mutations[UPDATE_CLICKS_FILTER](state, { id: 'filter2', value: false });
            expect(state.selectedVideo.clicksFilters.filter2).to.equal(false);

            mutations[UPDATE_CLICKS_FILTER](state, { id: 'filter2', value: null });
            expect(state.selectedVideo.clicksFilters).to.have.not.property('filter2');
        });
        it('should set the value of filter based on id', () => {
            const state = { selectedVideo: { clicksFilters: { filter1: 1 } } };
            mutations[UPDATE_CLICKS_FILTER](state, { id: 'filter1', value: 2 });
            expect(state.selectedVideo.clicksFilters.filter1).to.equal(2);

            mutations[UPDATE_CLICKS_FILTER](state, { id: 'filter2', value: false });
            expect(state.selectedVideo.clicksFilters.filter2).to.equal(false);
        });
    });
    describe(LOADING, () => {
        it('should set the state.networkLoading to true', () => {
            const state = { networkLoading: false };
            mutations[LOADING](state);
            expect(state.networkLoading).to.equal(true);
            mutations[LOADING](state);
            expect(state.networkLoading).to.equal(true);
        });
    });
    describe(FINISHED_LOADING, () => {
        it('should set the state.networkLoading to false', () => {
            const state = { networkLoading: true };
            mutations[FINISHED_LOADING](state);
            expect(state.networkLoading).to.equal(false);
            mutations[FINISHED_LOADING](state);
            expect(state.networkLoading).to.equal(false);
        });
    });
});
