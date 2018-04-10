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

// Public API
export default {
    getClicks,
    getDemographicData,
    getCourseInfo,
    getCourseList,
};
