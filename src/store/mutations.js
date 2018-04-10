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

function injectCountryInfoToClick(demographicInfo, denseLogsSet) {
    const userToCountry = {};
    for (const country of demographicInfo) {
        for (const userId of country.users) {
            userToCountry[userId] = country.code3 || 'UnKnown';
        }
    }
    for (const denseLogs of denseLogsSet) {
        for (const denseLog of denseLogs) {
            if (!denseLog.countryInjected) {
                for (const click of denseLog.clicks) {
                    click.country = userToCountry[click.userId] || 'UnKnown';
                }
                denseLog.countryInjected = true;
            }
        }
    }
}

function sortVideo(vA, vB) {
    let orderA = '';
    let orderB = '';
    const sectionsA = vA.section.split('>>');
    const sectionsB = vB.section.split('>>');
    for (let i = 0, len = sectionsA.length; i < len; i += 2) {
        orderA += sectionsA[i];
        orderB += sectionsB[i];
    }
    return +orderA - +orderB;
}

function sortCourse(cA, cB) {
    const aId = cA.year || '0';
    const bId = cB.year || '0';
    const orderA = `${aId.match(/[0-9]+/g).join('')}${cA.name}`;
    const orderB = `${bId.match(/[0-9]+/g).join('')}${cB.name}`;
    return orderB.localeCompare(orderA);
}

function calVideoDurationFromClicks(denseLogs) {
    let maxDuration = 0;
    for (const denseLog of denseLogs) {
        for (const click of denseLog.clicks) {
            const times = [maxDuration];
            const { oldTime, currentTime, newTime } = click;
            if (oldTime) {
                times.push(oldTime);
            }
            if (currentTime) {
                times.push(currentTime);
            }
            if (newTime) {
                times.push(newTime);
            }
            maxDuration = Math.max(...times);
        }
    }
    return maxDuration;
}

const mutations = {
    [TRIGGER_SIDEBAR](state, value) {
        if (typeof value === 'boolean') {
            state.sideBarIsCollapsed = value;
        } else {
            state.sideBarIsCollapsed = !state.sideBarIsCollapsed;
        }
    },
    [GET_COURSES_LIST](state, playload) {
        const { coursesList } = playload;
        if (coursesList) {
            coursesList.sort(sortCourse);
            Object.freeze(coursesList);
            state.coursesList = coursesList;
        }
    },
    [SELECT_COURSE](state, playload) {
        const { course, fresh } = playload;
        if (course) {
            course.videos.sort(sortVideo);
            if (fresh) {
                Object.freeze(course);
                state.courses[course.id] = course;
            }
            state.selectedCourse = course;
            state.selectedVideo = null;
            state.denseLogs = null;
        }
    },
    [SELECT_VIDEO](state, playload) {
        const { selectedVideo } = playload;
        if (selectedVideo) {
            if (!('clicksFilters' in selectedVideo)) {
                selectedVideo.clicksFilters = {
                    startDate: new Date(state.selectedCourse.startDate),
                    endDate: new Date(state.selectedCourse.endDate || Date.now()),
                    countries: [],
                };
            }
            state.selectedVideo = selectedVideo;
        }
    },
    [FETCH_CLICKS](state, playload) {
        const { denseLogs, fresh } = playload;
        if (!denseLogs) {
            return;
        }
        if (fresh) {
            if (state.demographicInfo) {
                // inject country info to each click
                injectCountryInfoToClick(state.demographicInfo, [denseLogs.denseLogs]);
            }
            Object.freeze(denseLogs.denseLogs);
            const video = state.courses[denseLogs.courseId].videos.find(v => v.id === denseLogs.videoId);
            video.denseLogs = denseLogs.denseLogs;
            // state.selectedVideo.denseLogs = denseLogs;
            // if duration of video does not exist or equal to zero, then calculate the duration
            // from the clicks.
            if (!video.duration) {
                video.duration = calVideoDurationFromClicks(denseLogs.denseLogs);
            }
            state.denseLogs = denseLogs.denseLogs;
        } else {
            // if is not fresh, the denseLogs is raw logs
            state.denseLogs = denseLogs;
        }
    },
    [FETCH_DEMOGRAPHICINFO](state, playload) {
        const { demographicInfo, fresh } = playload;
        if (!demographicInfo) {
            return;
        }
        if (fresh) {
            // inject country info to each click
            const { courseId } = demographicInfo;
            injectCountryInfoToClick(demographicInfo.demographicInfo,
                state.courses[courseId].videos.filter(v => v.denseLogs).map(v => v.denseLogs));
            Object.freeze(demographicInfo.demographicInfo);
            state.coursesDemographicInfo[courseId] = demographicInfo.demographicInfo;
            state.demographicInfo = demographicInfo.demographicInfo;
        } else {
            state.demographicInfo = demographicInfo;
        }
    },
    [UPDATE_CLICKS_FILTER](state, playload) {
        const { id, value } = playload;
        if (!id) {
            return;
        }
        const clicksFilters = state.selectedVideo.clicksFilters;
        if (value === undefined || value === null) {
            delete clicksFilters[id];
        } else {
            clicksFilters[id] = value;
        }
        state.selectedVideo.clicksFilters = {
            ...clicksFilters,
        };
    },
    [FETCH_SENTIMENT](state, playload) {
        const { sentimentInfo, fresh } = playload;
        const sentimentByDay = {};
        let minSentiment = 1000000000;
        let maxSentiment = -10000000000;
        for (const s of sentimentInfo) {
            const date = new Date(+s.timestamp);
            const dayTs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            if (!(dayTs in sentimentByDay)) {
                sentimentByDay[dayTs] = [];
            }
            minSentiment = Math.min(minSentiment, s.sentiment);
            maxSentiment = Math.max(maxSentiment, s.sentiment);
            sentimentByDay[dayTs].push(s);
        }
        // should not be rewrite and enumerate
        Object.defineProperties(sentimentByDay, {
            maxSentiment: {
                configurable: false,
                enumerable: false,
                value: maxSentiment,
                writable: false,
            },
            minSentiment: {
                configurable: false,
                enumerable: false,
                value: minSentiment,
                writable: false,
            },
        });

        if (fresh) {
            Object.freeze(sentimentByDay);
            state.coursesSentimentInfo[state.selectedCourse.id] = sentimentInfo;
        }
        state.sentimentInfo = sentimentByDay;
    },
    [FETCH_FORUMSOCIALNETWORK](state, playload) {
        const { socialNetworkInfo, fresh, threshold } = playload;
        if (fresh) {
            socialNetworkInfo.links.sort((a, b) => (b.weight - a.weight));
            Object.freeze(socialNetworkInfo);
            state.coursesSocialNetworkInfo[state.selectedCourse.id] = {};
            state.coursesSocialNetworkInfo[state.selectedCourse.id][threshold] = socialNetworkInfo;
        }
        state.socialNetworkInfo = socialNetworkInfo;
    },
    [FETCH_WORDCLOUD](state, playload) {
        const { wordCloudData } = playload;
        state.wordCloudData = wordCloudData;
    },
    [LOADING](state) {
        state.networkLoading = true;
    },
    [FINISHED_LOADING](state) {
        state.networkLoading = false;
    },
};

export default mutations;
