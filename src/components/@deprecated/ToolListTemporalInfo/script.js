import 'cal-heatmap/cal-heatmap.css';
import { mapState, mapActions } from 'vuex';
import CalHeatmap from 'cal-heatmap';
import { UPDATE_CLICKS_FILTER } from 'src/store';
import { UiModal } from '../KeenUI';

// const DAYMS = 86400000;
// const WEEKMS = 604800000;
export default {
    components: {
        UiModal,
    },
    mounted() {
        this.complexObject = {};
    },
    data() {
        return {
            shouldUpdate: false,
            lastVideo: null,
        };
    },
    complexObject: {
        cal: null,
    },
    computed: {
        ...mapState({
            video(state) {
                if (state.selectedVideo !== this.lastVideo) {
                    this.lastVideo = state.selectedVideo;
                    this.shouldUpdate = true;
                }
                return state.selectedVideo;
            },
            course: 'selectedCourse',
            startDate: state => state.selectedCourse && state.selectedCourse.startDate,
            endDate: state => state.selectedCourse && state.selectedCourse.endDate,
        }),
    },
    methods: {
        ...mapActions({
            filterByDate: UPDATE_CLICKS_FILTER,
        }),
        renderCalendar(video, startDateTS, endDateTS) {
            const start = new Date(+startDateTS);
            const end = endDateTS ? new Date(+endDateTS) : start;
            const range = (end.getMonth() - start.getMonth()) + (12 * (end.getFullYear() - start.getFullYear()));

            const temporalHotness = video.temporalHotness;
            const data = Object.keys(temporalHotness)
                .reduce((o, dateStr) => {
                    // all timestamp in seconde
                    o[(+dateStr) * 0.001] = temporalHotness[dateStr];
                    return o;
                }, {});

            if (this.complexObject.cal) this.complexObject.cal.destroy();
            this.complexObject.cal = new CalHeatmap();
            this.complexObject.cal.init({
                itemSelector: '#cal-heatmap',
                data,
                start,
                range,
                domain: 'month',
                tooltip: true,
                itemName: ['click', 'clicks'],
                subDomain: 'day',
                cellSize: 19.2,
                onClick: (date, count) => {
                    this.filterByDate({ id: 'timestamp', value: date.getTime() });
                },
            });
        },
        openModal() {
            const video = this.video;
            const startDateTS = this.startDate;
            const endDateTS = this.endDate;
            if (video && this.shouldUpdate) {
                this.renderCalendar(video, startDateTS, endDateTS);
                this.shouldUpdate = false;
            }
            this.$refs.modalTemporalInfo.open();
        },
    },
};
