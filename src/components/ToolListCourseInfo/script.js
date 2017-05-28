import { mapState } from 'vuex';
import { UiModal } from '../KeenUI';
// service
export default {
    components: {
        UiModal,
    },
    filters: {
        formatTimestamp(value) {
            if (!value) return '';
            return new Date(value).toLocaleDateString();
        },
    },
    computed: {
        ...mapState({
            course: 'selectedCourse',
        }),
    },
    methods: {
        openModal() {
            this.$refs.modalCourseInfo.open();
        },
    },
};
