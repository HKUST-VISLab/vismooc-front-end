import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);
// TODO chang the path when released
const mainPath = process.env.NODE_ENV === 'development' ? 'http://localhost:9999' : location.origin;
const $http = Vue.http;
const api = `${mainPath}/api`;

function getClicks(courseId, videoId, paramters = {}, callback) {
    let tmpURL = `${api}/getClicks?courseId=${courseId}&videoId=${videoId}`;
    Object.keys(paramters).forEach((p) => { tmpURL += `&${p}=${paramters[p]}`; });
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getCourseList(callback) {
    const tmpURL = `${api}/getCourseList`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getCourseInfo(courseId, callback) {
    const tmpURL = `${api}/getCourseInfo?courseId=${courseId}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getDemographicData(courseId, callback) {
    const tmpURL = `${api}/getDemographicInfo?courseId=${courseId}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getSentimentData(courseId, callback) {
    const tmpURL = `${api}/getSentiment?courseId=${courseId}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getSocialNetworkLayout(courseId, threshold, callback) {
    const tmpURL = `${api}/getSocialNetworkLayout?courseId=${courseId}&activenessThreshold=${threshold}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

export function logout() {
    location.href = `${mainPath}/logout`;
}

export function login() {
    location.href = `${mainPath}/login`;
}

// Public API
export default {
    logout,
    login,
    getClicks,
    getDemographicData,
    getCourseInfo,
    getCourseList,
    getSentimentData,
    getSocialNetworkLayout,
};
