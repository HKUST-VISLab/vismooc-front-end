import { mapActions, mapState } from 'vuex';
import { UiCollapsible, UiSelect } from '../KeenUI';
import {
    GET_COURSES_LIST,
    SELECT_COURSE,
    SELECT_VIDEO,
} from '../../store/types';

export default {
    components: {
        UiSelect,
        UiCollapsible,
    },
    mounted() {
        // Get the course list when component is ready
        this.getCoursesList();
    },
    data() {
        return {
            hashVideo: null,
            videosList: [],
        };
    },
    methods: {
        ...mapActions({
            getCoursesList: GET_COURSES_LIST,
            selectCourse: SELECT_COURSE,
            selectVideo: SELECT_VIDEO,
        }),
    },
    computed: {
        courseId: {
            get() {
                const course = this.$store.state.selectedCourse;
                if (!course) {
                    return '';
                }
                const videosList = course.videos;
                const videoByFirsetSection = {};
                videosList.forEach((video) => {
                    const sections = video.section.split('>>');
                    const section = sections[1];
                    if (!(section in videoByFirsetSection)) {
                        videoByFirsetSection[section] = {
                            section,
                            order: +sections[0],
                            videos: [],
                        };
                    }
                    videoByFirsetSection[section].videos.push(video);
                });

                const sortVideosList = Object.keys(videoByFirsetSection)
                    .map(section => videoByFirsetSection[section])
                    .sort((a, b) => a.order - b.order);
                const hashVideo = {};
                sortVideosList.forEach((group, groupIndex) => {
                    group.videos.forEach((video) => {
                        hashVideo[video.id] = `#v_group${groupIndex}`;
                    });
                });
                this.hashVideo = hashVideo;
                this.videosList = sortVideosList;
                return { label: `${course.year || ''} ${course.name}`, value: course.id };
            },
            set(value) {
                this.selectCourse({
                    selectedCourseId: value.value,
                });
            },
        },
        ...mapState({
            videoId(state) {
                if (!this.hashVideo || !state.selectedVideo) {
                    return null;
                }
                const videoId = state.selectedVideo.id;
                return videoId;
            },
            coursesList(state) {
                const coursesList = state.coursesList;
                if (!Array.isArray(coursesList)) {
                    return [];
                }
                return coursesList.map(d => ({ label: `${d.year} ${d.name}`, value: d.id }));
            },
        }),
    },
};
