import { mapActions, mapState } from 'vuex';
import { FETCH_CLICKS, UPDATE_CLICKS_FILTER } from 'src/store';

// components
import TagsInput from 'vue-tagsinput';
import SeekLine from 'components/SeekLineGraph';
import ToolList from 'components/ToolList';
import Nvd3StackChart from 'components/Nvd3StackChart';
import VideoPlayer from 'components/VideoPlayer';
import { UiToolbar } from '../KeenUI';

export default {
    components: {
        UiToolbar,
        TagsInput,
        SeekLine,
        Nvd3StackChart,
        ToolList,
        VideoPlayer,
    },
    mounted() {
        // init colors
    },
    methods: {
        playerTimeupdate(player) {
            const currentTime = player.currentTime();
            if (currentTime) {
                const inverseMaxDuration = 1 / player.duration();
                const elId = '#content-video-progress-bar';
                this.$el.querySelector(elId).style.width = `${100 * currentTime * inverseMaxDuration}%`;
            }
        },
        removeFilter(index) {
            const id = this.filters[index].split('=').shift();
            this.$store.dispatch(UPDATE_CLICKS_FILTER, { id, value: null });
        },
        extractClicks(denseLogs, filters) {
            // the code here can ben improved
            const clickfilters = Object.keys(filters).map((key) => {
                const value = filters[key];
                switch (key) {
                    case 'country':
                        return c => c.country === value;
                    case 'timestamp':
                        return c => c.timestamp === value;
                    default:
                        return () => { };
                }
            });
            let clicks = denseLogs
                .map((d) => {
                    for (const c of d.clicks) {
                        c.timestamp = new Date(d.timestamp).setHours(0);
                    }
                    return d.clicks;
                })
                .reduce((a, b) => a.concat(b), []);
            for (const filterFunc of clickfilters) {
                clicks = clicks.filter(filterFunc);
            }
            return clicks;
        },
        onClickSeekLineGraph(evt) {
            const player = this.$refs.myPlayer.player;
            if (player) {
                player.currentTime((evt.offsetX * player.duration()) / evt.width);
            }
        },
        ...mapActions({
            getDenseLogs: FETCH_CLICKS,
        }),
    },
    computed: {
        ...mapState({
            selectedCourse: 'selectedCourse',
            selectedVideo: 'selectedVideo',
            networkLoading: 'networkLoading',
            filters(state) {
                const clicksFilters = state.clicksFilters;
                return Object.keys(clicksFilters)
                    .map(filterId => `${filterId}=${clicksFilters[filterId]}`);
            },
            seekData(state) {
                let clicks = state.denseLogs;
                const filters = state.clicksFilters;
                let seekData = null;
                if (clicks) {
                    clicks = this.extractClicks(clicks, filters);
                    seekData = clicks.filter(c => c.type === 'seek_video');
                }
                return seekData;
            },
            chartData(state) {
                const clicks = state.denseLogs;
                const filters = state.clicksFilters;
                let chartData = null;
                if (clicks) {
                    chartData = this.extractClicks(clicks, filters);
                }
                return chartData;
            },
        }),
    },
    data() {
        return {
            videoConfig: {
                techOrder: ['youtube', 'html5'],
                sources: [{
                    src: '',
                    type: 'video/mp4',
                }],
                playsinline: false,
                playbackRates: [1, 1.5, 2],
                controls: true,
                preload: 'none',
                poster: '',
                autoplay: false,
                controlBar: {
                    currentTimeDisplay: true,
                    durationDisplay: true,
                    timeDivider: true,
                    remainingTimeDisplay: false,
                },
            },
            chartAggregation: 3,
            colors: null,
        };
    },
    watch: {
        selectedVideo(video) {
            if (this.$el) {
                this.$el.querySelector('#content-video-progress-bar').style.width = '0%';
            }
            if (video) {
                // this.currentTime = videoInfo.currentTime;
                const src = video.url || 'no video';
                const source = { src, type: '' };
                if (typeof video.url === 'string' && video.url.indexOf('www.youtube.com') !== -1) {
                    source.type = 'video/youtube';
                } else {
                    source.type = 'video/mp4';
                }
                this.videoConfig.sources = [source];
                if (this.$refs.myPlayer.player) {
                    this.$refs.myPlayer.player.poster('');
                }
                this.getDenseLogs();
            }
        },
    },
};
