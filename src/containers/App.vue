<template>
    <div class="app">
        <top-bar class="header" />
        <course-list />
    </div>
</template>

<script>
import 'material-design-icons/iconfont/material-icons.css';

import { mapActions } from 'vuex';
import { GET_COURSES_LIST } from 'store/types';

// Component
import TopBar from 'components/TopBar';
import CourseList from 'components/CourseList';

export default {
    components: {
        TopBar,
        CourseList,
    },
    mounted() {
        // Get the course list when App is ready
        this.getCoursesList();
    },
    methods: {
        ...mapActions({
            getCoursesList: GET_COURSES_LIST,
        }),
    },
};
</script>

<style lang="scss">
@import 'src/styles/index.scss';
</style>
