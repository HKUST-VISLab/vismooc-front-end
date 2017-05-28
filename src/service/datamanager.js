import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);
// TODO chang the path when released
const mainPath = 'http://localhost:9999/';
const $http = Vue.http;

function getClicks(courseId, videoId, paramters = {}, callback) {
    let tmpURL = `${mainPath}getClicks?courseId=${courseId}&videoId=${videoId}`;
    Object.keys(paramters).forEach((p) => { tmpURL += `&${p}=${paramters[p]}`; });
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getCourseList(callback) {
    const tmpURL = `${mainPath}getCourseList`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getCourseInfo(courseId, callback) {
    const tmpURL = `${mainPath}getCourseInfo?courseId=${courseId}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getDemographicData(courseId, callback) {
    const tmpURL = `${mainPath}getDemographicInfo?courseId=${courseId}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getSentimentData(courseId, callback) {
    const tmpURL = `${mainPath}getSentiment?courseId=${courseId}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getSocialNetworkLayout(courseId, threshold, callback) {
    const tmpURL = `${mainPath}getSocialNetworkLayout?courseId=${courseId}&activenessThreshold=${threshold}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getWordCloudDataByUser(courseId, userId, callback) {
    const tmpURL = `${mainPath}getWordList?courseId=${courseId}&userId=${userId}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

function getWordCloudDataByGeo(courseId, countrycode, callback) {
    const tmpURL = `${mainPath}getWordList?courseId=${courseId}&countrycode=${countrycode}`;
    $http.get(tmpURL).then((response) => {
        callback(response);
    });
}

export const NO_PERMISSION_1 = 'No Permission_1';
export const NO_PERMISSION_2 = 'No Permission_2';

// Public API
export default {
    getClicks,
    getDemographicData,
    getCourseInfo,
    getCourseList,
    getSentimentData,
    getSocialNetworkLayout,
    getWordCloudDataByUser,
    getWordCloudDataByGeo,
};
