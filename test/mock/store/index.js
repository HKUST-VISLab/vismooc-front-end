import Vue from 'vue';
import Vuex from 'vuex';
import mutations from 'src/store/mutations';
import actions from './actions';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        selectedCourse: null,
        selectedVideo: null,
        clicksFilters: {},
        courses: {},
        coursesDemographicInfo: {},
        coursesList: [],        // frozen
        denseLogs: null,        // frozen
        demographicInfo: null,  // frozen
        networkLoading: false,
    },
    mutations,
    actions,
    strict: process.env.NODE_ENV !== 'production',
});

export default store;
