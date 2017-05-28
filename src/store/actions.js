import {
    GET_COURSES_LIST,
    SELECT_COURSE,
    SELECT_VIDEO,
    FETCH_CLICKS,
    FETCH_DEMOGRAPHICINFO,
    UPDATE_CLICKS_FILTER,
    // Sentiment && SocialNetwork by xuanwu
    FETCH_SENTIMENT,
    FETCH_FORUMSOCIALNETWORK,
    FETCH_WORDCLOUD,

    LOADING,
    FINISHED_LOADING,
    LOGINED,
    LOGOUTED,
} from './types';
import dataManager from '../service/datamanager';
import { isAuthenticated } from '../service/auth';

function fetchDataWrapper(commit, mutationType, func, target, ...params) {
    commit(LOADING);
    params.push((response) => {
        const data = response.data;
        if (isAuthenticated(data)) {
            commit(mutationType, {
                [target]: data,
                fresh: true,
            });
            commit(LOGINED);
        } else {
            commit(LOGOUTED);
        }
        commit(FINISHED_LOADING);
    });
    func(...params);
}

const actions = {
    [GET_COURSES_LIST]({ commit, state }) {
        // fetchDataWrapper(commit, GET_COURSES_LIST, dataManager.getCourseList, 'coursesList');
        commit(LOADING);
        dataManager.getCourseList((response) => {
            if (isAuthenticated(response.data)) {
                const { coursesList, selectedCourseId } = response.data;
                commit(GET_COURSES_LIST, { coursesList, fresh: true });
                commit(LOGINED);
                if (selectedCourseId) {
                    actions.SELECT_COURSE({ commit, state }, { selectedCourseId });
                }
            } else {
                commit(LOGOUTED);
            }
            commit(FINISHED_LOADING);
        });
    },
    [SELECT_COURSE]({ commit, state }, playload) {
        const { selectedCourseId } = playload;
        if (!selectedCourseId) {
            return;
        }
        if (selectedCourseId in state.courses) {
            commit(SELECT_COURSE, {
                course: state.courses[selectedCourseId],
            });
        } else {
            fetchDataWrapper(commit, SELECT_COURSE, dataManager.getCourseInfo, 'course', selectedCourseId);
            // commit(LOADING);
            // dataManager.getCourseInfo(selectedCourseId, (response) => {
            //     const course = response.data;
            //     if (isAuthenticated(course)) {
            //         commit(SELECT_COURSE, { course, fresh: true });
            //         commit(LOGINED);
            //     } else {
            //         commit(LOGOUTED);
            //     }
            //     commit(FINISHED_LOADING);
            // });
        }
    },
    [SELECT_VIDEO]({ commit, state }, playload) {
        const { selectedVideo } = playload;
        selectedVideo.duration = selectedVideo.duration || 0;
        commit(SELECT_VIDEO, { selectedVideo });
    },
    [FETCH_CLICKS]({ commit, state }) {
        if (state.selectedVideo.denseLogs) {
            commit(FETCH_CLICKS, { denseLogs: state.selectedVideo.denseLogs, fresh: false });
        } else {
            const courseId = state.selectedCourse.id;
            const videoId = state.selectedVideo.id;
            fetchDataWrapper(commit, FETCH_CLICKS, dataManager.getClicks, 'denseLogs', courseId, videoId, {});

            // commit(LOADING);
            // dataManager.getClicks(courseId, videoId, {}, (response) => {
            //     const denseLogs = response.data;
            //     if (isAuthenticated(denseLogs)) {
            //         commit(FETCH_CLICKS, { denseLogs, fresh: true });
            //         commit(LOGINED);
            //     } else {
            //         commit(LOGOUTED);
            //     }
            //     commit(FINISHED_LOADING);
            // });
        }
    },
    [FETCH_DEMOGRAPHICINFO]({ commit, state }) {
        const selectedCourse = state.selectedCourse;
        if (state.coursesDemographicInfo[selectedCourse.id]) {
            commit(FETCH_DEMOGRAPHICINFO, {
                demographicInfo: state.coursesDemographicInfo[selectedCourse.id],
                fresh: false,
            });
        } else {
            const courseId = selectedCourse.id;
            fetchDataWrapper(commit, FETCH_DEMOGRAPHICINFO, dataManager.getDemographicData,
                'demographicInfo', courseId);
            // commit(LOADING);
            // dataManager.getDemographicData(courseId, (response) => {
            //     const demographicInfo = response.data;
            //     if (isAuthenticated(demographicInfo)) {
            //         commit(FETCH_DEMOGRAPHICINFO, { demographicInfo, fresh: true });
            //         commit(LOGINED);
            //     } else {
            //         commit(LOGOUTED);
            //     }
            //     commit(FINISHED_LOADING);
            // });
        }
    },
    [UPDATE_CLICKS_FILTER]({ commit }, playload) {
        commit(UPDATE_CLICKS_FILTER, playload);
    },
    [FETCH_SENTIMENT]({ commit, state }) {
        const courseId = state.selectedCourse.id;
        if (state.coursesSentimentInfo[courseId]) {
            commit(FETCH_SENTIMENT, {
                sentimentInfo: state.coursesSentimentInfo[courseId],
                fresh: false,
            });
        } else {
            fetchDataWrapper(commit, FETCH_SENTIMENT, dataManager.getSentimentData, 'sentimentInfo', courseId);
        }
    },
    [FETCH_FORUMSOCIALNETWORK]({ commit, state }, playload) {
        const courseId = state.selectedCourse.id;
        const { threshold } = playload;
        if (state.coursesSocialNetworkInfo[courseId] && state.coursesSocialNetworkInfo[courseId][threshold]) {
            commit(FETCH_FORUMSOCIALNETWORK, {
                socialNetworkInfo: state.coursesSocialNetworkInfo[courseId][threshold],
                fresh: false,
            });
        } else {
            commit(LOADING);
            dataManager.getSocialNetworkLayout(courseId, threshold, (response) => {
                const socialNetworkInfo = response.data;
                if (isAuthenticated(socialNetworkInfo)) {
                    commit(FETCH_FORUMSOCIALNETWORK, { socialNetworkInfo, threshold, fresh: true });
                    commit(LOGINED);
                } else {
                    commit(LOGOUTED);
                }
                commit(FINISHED_LOADING);
            });
        }
        // dataManager.getSocialNetworkLayout(courseId, thresholdValue, (response) => {
        //     const socialNetworkData = response.data;
        //     commit(FETCH_FORUMSOCIALNETWORK, { socialNetworkData });
        // });
    },
    [FETCH_WORDCLOUD]({ commit, state }, playload) {
        const courseId = state.selectedCourse.id;
        const { wordCloudType, wordCloudArgs } = playload;
        if (wordCloudType === 'byUser') {
            const { userId } = wordCloudArgs;
            dataManager.getWordCloudDataByUser(courseId, userId, (response) => {
                const { wordCloudData } = response.data;
                commit(FETCH_WORDCLOUD, { wordCloudData });
            });
        } else if (wordCloudType === 'byGeo') {
            const { countrycode } = wordCloudArgs;
            dataManager.getWordCloudDataByGeo(courseId, countrycode, (response) => {
                const { wordCloudData } = response.data;
                commit(FETCH_WORDCLOUD, { wordCloudData });
            });
        }
    },
};

export default actions;
