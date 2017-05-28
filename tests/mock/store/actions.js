import { isAuthenticated } from 'src/service/auth';
import {
    GET_COURSES_LIST,
    SELECT_COURSE,
    SELECT_VIDEO,
    FETCH_CLICKS,
    FETCH_DEMOGRAPHICINFO,
    UPDATE_CLICKS_FILTER,
    LOADING,
    FINISHED_LOADING,
    LOGINED,
    LOGOUTED,
} from 'src/store/types';
import dataManager from '../service/datamanager';

function fetchDataWrapper(commit, mutationType, func, target, ...params) {
    commit(LOADING);
    params.push((response) => {
        const data = response.data;
        if (isAuthenticated(data)) {
            commit(mutationType, { [target]: data, fresh: true });
            commit(LOGINED);
        } else {
            commit(LOGOUTED);
        }
        commit(FINISHED_LOADING);
    });
    func(...params);
}

const actions = {
    [GET_COURSES_LIST]({ commit }) {
        fetchDataWrapper(commit, GET_COURSES_LIST, dataManager.getCourseList, 'coursesList');
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
        }
    },
    [SELECT_VIDEO]({ commit, state }, playload) {
        const { selectedVideo } = playload;
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
            fetchDataWrapper(commit, FETCH_DEMOGRAPHICINFO, dataManager.getDemographicData, 'demographicInfo',
                courseId);
        }
    },
    [UPDATE_CLICKS_FILTER]({ commit }, playload) {
        commit(UPDATE_CLICKS_FILTER, playload);
    },
};

export default actions;
