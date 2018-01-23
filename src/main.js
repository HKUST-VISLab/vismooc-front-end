import Vue from 'vue';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import VueGoodTable from 'vue-good-table';

// CSS
import App from './containers/App';
import Main from './containers/Main';
import store from './store';

/* eslint-disable no-new */
Vue.use(Vuex);
Vue.use(VueResource);
Vue.use(VueRouter);
Vue.use(VueGoodTable);

const router = new VueRouter({
    routes: [
        { path: '/', component: App },
        { path: '/course/:courseId', component: Main },
    ],
});

new Vue({
    router,
    el: '#app',
    store,
});
