<template>
    <ui-toolbar class="top-bar" :title="courseName" brand="Vismooc" text-color="white" type="colored" :loading="networkLoading" @nav-icon-click="redirectToHome()">
    </ui-toolbar>
</template>

<script>
import { mapState } from 'vuex';
import { UiToolbar, UiIconButton, UiButton, UiMenu } from '../KeenUI';

export default {
    components: {
        UiMenu,
        UiButton,
        UiToolbar,
        UiIconButton,
    },
    data() {
        return {
        };
    },
    computed: {
        ...mapState({
            networkLoading: 'networkLoading',
            courseName(state) {
                if (!this.$route.params.courseId) {
                    return '';
                }
                return state.selectedCourse ? state.selectedCourse.name : '';
            },
        }),
    },
    methods: {
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
