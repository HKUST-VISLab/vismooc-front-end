import Vue from 'vue';
import Vuex from 'vuex';
import VueResource from 'vue-resource';

// CSS
import App from './components/App';
import store from './store';

/* eslint-disable no-new */
Vue.use(Vuex);
Vue.use(VueResource);

new Vue({
    el: '#app',
    store,
    render: h => h(App),
});
