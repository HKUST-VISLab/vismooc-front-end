import {
    TRIGGER_SIDEBAR,
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
} from './types';
import dataManager from '../service/datamanager';

function fetchDataWrapper(commit, mutationType, func, target, ...params) {
    commit(LOADING);
    params.push((response) => {
        const data = response.data;
        commit(mutationType, {
            [target]: data,
            fresh: true,
        });
        commit(FINISHED_LOADING);
    });
    func(...params);
}

const actions = {
    [TRIGGER_SIDEBAR]({ commit }, payload) {
        commit(TRIGGER_SIDEBAR, payload);
    },
    [GET_COURSES_LIST]({ commit, state, dispatch }) {
        // fetchDataWrapper(commit, GET_COURSES_LIST, dataManager.getCourseList, 'coursesList');
        commit(LOADING);
        dataManager.getCourseList((response) => {
            const { coursesList, selectedCourseId } = response.data;
            commit(GET_COURSES_LIST, { coursesList, fresh: true });
            if (selectedCourseId) {
                dispatch(SELECT_COURSE, { selectedCourseId });
                commit(TRIGGER_SIDEBAR, true);
            } else {
                commit(TRIGGER_SIDEBAR, false);
            }
            commit(FINISHED_LOADING);
        });
    },
    [SELECT_COURSE]({ commit, state }, payload) {
        const { selectedCourseId } = payload;
        if (!selectedCourseId) {
            return;
        }
        if (selectedCourseId in state.courses) {
            commit(SELECT_COURSE, {
                course: state.courses[selectedCourseId],
            });
        } else {
            // fetchDataWrapper(commit, SELECT_COURSE, dataManager.getCourseInfo, 'course', selectedCourseId);
            commit(LOADING);
            dataManager.getCourseInfo(selectedCourseId, (response) => {
                const { course } = response.data;
                commit(SELECT_COURSE, { course, fresh: true });
                commit(FINISHED_LOADING);
            });
        }
    },
    [SELECT_VIDEO]({ commit, state }, payload) {
        const { selectedVideo } = payload;
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
        }
    },
    [UPDATE_CLICKS_FILTER]({ commit }, payload) {
        commit(UPDATE_CLICKS_FILTER, payload);
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
    [FETCH_FORUMSOCIALNETWORK]({ commit, state }, payload) {
        const courseId = state.selectedCourse.id;
        const { threshold } = payload;
        if (state.coursesSocialNetworkInfo[courseId] && state.coursesSocialNetworkInfo[courseId][threshold]) {
            commit(FETCH_FORUMSOCIALNETWORK, {
                socialNetworkInfo: state.coursesSocialNetworkInfo[courseId][threshold],
                fresh: false,
            });
        } else {
            commit(LOADING);
            dataManager.getSocialNetworkLayout(courseId, threshold, (response) => {
                const socialNetworkInfo = response.data;
                commit(FETCH_FORUMSOCIALNETWORK, { socialNetworkInfo, threshold, fresh: true });
                commit(FINISHED_LOADING);
            });
        }
        // dataManager.getSocialNetworkLayout(courseId, thresholdValue, (response) => {
        //     const socialNetworkData = response.data;
        //     commit(FETCH_FORUMSOCIALNETWORK, { socialNetworkData });
        // });
    },
    [FETCH_WORDCLOUD]({ commit, state }, payload) {
        const courseId = state.selectedCourse.id;
        const { wordCloudType, wordCloudArgs } = payload;
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
