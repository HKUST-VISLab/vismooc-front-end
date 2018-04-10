import { courseList, clicks, courseInfo, demographicInfo } from './mock-data';


function getCourseList(callback) {
    setTimeout(() => {
        callback({ data: courseList });
    }, 1000);
}

function getCourseInfo(courseId, callback) {
    setTimeout(() => {
        callback({ data: courseInfo });
    }, 1000);
}

function getDemographicData(courseId, callback) {
    setTimeout(() => {
        callback({ data: demographicInfo });
    }, 1000);
}

function getClicks(courseId, videoId, paramters = {}, callback) {
    setTimeout(() => {
        callback({ data: clicks });
    }, 1000);
}

export const NO_PERMISSION_1 = 'No Permission_1';
export const NO_PERMISSION_2 = 'No Permission_2';

// Public API
export default {
    getClicks,
    getDemographicData,
    getCourseInfo,
    getCourseList,
};
