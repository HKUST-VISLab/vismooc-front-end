<template>
    <ui-toolbar class="top-bar" :title="courseName" brand="Vismooc" text-color="white" type="colored" :loading="networkLoading" @nav-icon-click="redirectToHome()">
        <div slot="actions">
            <ui-button v-if="username" key="logined" color="primary" icon="account_circle" size="normal" has-dropdown>
                <ui-menu contain-focus has-icons slot="dropdown" :options="menuOptions" @select="selectMenu"></ui-menu>
                {{username}}
            </ui-button>
            <ui-button v-else key="login" color="primary" size="normal" @click="login">Login</ui-button>
        </div>
    </ui-toolbar>
</template>

<script>
import { mapState } from 'vuex';
import { UiToolbar, UiIconButton, UiButton, UiMenu } from '../KeenUI';
import { logout, login } from '../../service/datamanager';

export default {
    components: {
        UiMenu,
        UiButton,
        UiToolbar,
        UiIconButton,
    },
    data() {
        return {
            menuOptions: [{ label: 'Logout' }],
        };
    },
    computed: {
        ...mapState({
            networkLoading: 'networkLoading',
            username: 'username',
            courseName(state) {
                if (!this.$route.params.courseId) {
                    return '';
                }
                return state.selectedCourse ? state.selectedCourse.name : '';
            },
        }),
    },
    methods: {
        selectMenu(option) {
            if (option.label === 'Logout') {
                logout();
            }
        },
        login() {
            login();
        },
        redirectToHome() {
            this.$router.push('/');
        },
    },
};
</script>

<style lang="scss" scoped>
@import "src/styles/import";
.top-bar {
    font-size: 1.5rem;
    height: $toolbar-height;
    background-color: $toolbar-color;
    flex-shrink: 0;
}
a {
    color: white;
    text-decoration: none;
}
</style>
