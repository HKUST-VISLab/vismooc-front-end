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

function injectCountryInfoToClick(demographicInfo, denseLogs) {
    const userToCountry = {};
    for (const country of demographicInfo) {
        for (const userId of country.users) {
            userToCountry[userId] = country.code3;
        }
    }
    for (const denseLog of denseLogs) {
        for (const click of denseLog.clicks) {
            click.country = userToCountry[click.userId];
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

const mutations = {
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
            state.clicksFilters = {};
        }
    },
    [SELECT_VIDEO](state, playload) {
        const { selectedVideo } = playload;
        if (selectedVideo) {
            state.selectedVideo = selectedVideo;
        }
    },
    [FETCH_CLICKS](state, playload) {
        const { denseLogs, fresh } = playload;
        // inject country info to each click
        if (fresh) {
            if (state.demographicInfo) {
                injectCountryInfoToClick(state.demographicInfo, denseLogs);
            }
            Object.freeze(denseLogs);
            state.selectedVideo.denseLogs = denseLogs;
        }
        state.denseLogs = denseLogs;
        state.clicksFilters = {};
    },
    [FETCH_DEMOGRAPHICINFO](state, playload) {
        const { demographicInfo, fresh } = playload;
        if (fresh) {
            // inject country info to each click
            if (state.denseLogs) {
                injectCountryInfoToClick(demographicInfo, state.denseLogs);
            }
            Object.freeze(demographicInfo);
            state.coursesDemographicInfo[state.selectedCourse.id] = demographicInfo;
        }
        state.demographicInfo = demographicInfo;
    },
    [UPDATE_CLICKS_FILTER](state, playload) {
        const { id, value } = playload;
        const clicksFilters = state.clicksFilters;
        if (!value) {
            delete clicksFilters[id];
        } else {
            clicksFilters[id] = value;
        }
        state.clicksFilters = {
            ...clicksFilters,
        };
    },
    [FETCH_SENTIMENT](state, playload) {
        const { sentimentInfo, fresh } = playload;
        const sentimentByDay = {};
        let minSentiment = 1000000000;
        let maxSentiment = -10000000000;
        for (const s of sentimentInfo) {
            const date = new Date(s.timestamp);
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
    [LOGINED](state) {
        state.username = 'logined';
    },
    [LOGOUTED](state) {
        state.username = null;
    },
};

export default mutations;
