<template>
    <div class="course-list">
        <vue-good-table title="Courses" :columns="columns" :rows="coursesList" />
    </div>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';

export default {
    data() {
        return {
            columns: [
                {
                    label: 'Course ID',
                    field: 'linkedId',
                    html: true,
                },
                {
                    label: 'Course Name',
                    field: 'name',
                },
                {
                    label: 'Start',
                    field: 'startDate',
                },
                {
                    label: 'End',
                    field: 'endDate',
                },
            ],
        };
    },
    computed: {
        ...mapState({
            coursesList(state) {
                if (!state.coursesList) {
                    return [];
                }
                return state.coursesList.map(course => ({
                    ...course,
                    startDate: course.startDate ? moment(+course.startDate).format('YYYY-MM-DD') : 'N/A',
                    endDate: course.endDate ? moment(+course.endDate).format('YYYY-MM-DD') : 'N/A',
                    linkedId: `<a href="/#/course/${course.id}">${course.originalId}</a>`,
                }));
            },
        }),
    },
};
</script>

<style>
.course-list {
    margin: 20px auto;
    width: 80%;
}
a {
    color: black;
    text-decoration: none;
}
</style>
