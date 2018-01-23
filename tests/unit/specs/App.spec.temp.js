import Vue from 'vue';
import Vuex from 'vuex';
import App from 'src/components/App';
import store from '../../mock/store';

Vue.use(Vuex);

describe('App.vue', () => {
    it('should render correct contents', () => {
        const vm = new Vue({
            el: document.createElement('div'),
            store,
            render: h => h(App),
        });
        expect(vm.$el.querySelector('.sidebar .header').textContent.trim())
      .to.equal('VisMooc');
    });
});
