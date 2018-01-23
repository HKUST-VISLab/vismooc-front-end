<template>
    <div class="main">
        <top-bar class="header" />
        <ui-tabs class="contain" background-color="primary" fullwidth indicator-color="white" text-color-active="white" text-color="white" type="text">
            <ui-tab title="Home" icon="book" @select="()=>this.$refs.coursePage.onSelect()">
                <course-page ref="coursePage" />
            </ui-tab>
            <ui-tab title="Videos" icon="people" style="margin: -1rem;" @select="()=>this.$refs.videosPage.onSelect()" >
                <videos-page ref="videosPage"/>
            </ui-tab>
            <ui-tab title="Forum" icon="book" @select="()=>this.$refs.forumPage.onSelect()">
                <forum-page ref="forumPage" />
            </ui-tab>
        </ui-tabs>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { SELECT_COURSE } from 'store/types';
import { UiTab, UiTabs } from 'components/KeenUI';
import TopBar from 'components/TopBar';
import VideosPage from 'components/VideosPage';
import CoursePage from 'components/CoursePage';
import ForumPage from 'components/ForumPage';

export default {
    components: {
        UiTabs,
        UiTab,
        TopBar,
        VideosPage,
        CoursePage,
        ForumPage,
    },
    mounted() {
        this.selectCourse({ selectedCourseId: this.$route.params.courseId });
    },
    methods: {
        ...mapActions({
            selectCourse: SELECT_COURSE,
        }),
    },
};
</script>

<style lang="scss">
@import "src/styles/import";
.main {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    .contain{
        margin-bottom: 0;
        .ui-tab-header-item {
            height: $toolbar-height;
        }
    }
}
</style>
