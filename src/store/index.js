import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        username: null,
        selectedCourse: null,
        selectedVideo: null,
        clicksFilters: {},
        coursesList: [], // frozen
        courses: {},
        denseLogs: null, // frozen

        demographicInfo: null, // frozen
        coursesDemographicInfo: {},

        // Sentiment && SocialNetwork  by xuanwu
        sentimentInfo: null,  // frozon
        coursesSentimentInfo: {},

        socialNetworkInfo: null, // frozen
        coursesSocialNetworkInfo: {},

        wordCloudData: null,

        // manifest
        networkLoading: false,
    },
    mutations,
    actions,
    strict: process.env.NODE_ENV !== 'production',
});

export {
    GET_COURSES_LIST,
    SELECT_COURSE,
    SELECT_VIDEO,
    FETCH_CLICKS,
    FETCH_DEMOGRAPHICINFO,
    UPDATE_CLICKS_FILTER,

    FETCH_SENTIMENT,
    FETCH_SENTIMENT_DETAIL,
    FETCH_FORUMSOCIALNETWORK,
    FETCH_WORDCLOUD,
} from './types';

export default store;
