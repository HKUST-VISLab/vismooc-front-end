import 'cal-heatmap/cal-heatmap.css';

import { mapActions, mapState } from 'vuex';
import { FETCH_CLICKS, UPDATE_CLICKS_FILTER, SELECT_VIDEO } from 'src/store';
import { UiCollapsible, UiDatepicker, UiSelect } from 'components/KeenUI';

// components
import SeekLine from 'components/SeekLineGraph';
import Nvd3StackChart from 'components/Nvd3StackChart';
import VideoPlayer from 'components/VideoPlayer';
import EventStatisticsChart from 'components/EventStatisticsChart';
import CalHeatmap from '../../thirdParty/cal-heatmap';

export default {
    components: {
        EventStatisticsChart,
        SeekLine,
        Nvd3StackChart,
        VideoPlayer,
        UiCollapsible,
        UiDatepicker,
        UiSelect,
    },
    mounted() {
        this.complexObject = {};
        const updateSidebarPosition = () => {
            const videoSideBar = document.getElementById('video-list');
            const content = document.getElementById('content');
            const scrollTop = document.scrollingElement.scrollTop;
            const headerHeight = 2 * document.getElementsByClassName('top-bar')[0].clientHeight;
            if (scrollTop > headerHeight) {
                videoSideBar.classList.add('fixed');
                content.classList.add('margin-left');
            } else {
                videoSideBar.classList.remove('fixed');
                content.classList.remove('margin-left');
            }
        };

        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(updateSidebarPosition);
        });

        updateSidebarPosition();
    },
    complexObject: {
        calendar: null,
    },
    methods: {
        playerTimeupdate(player) {
            const currentTime = player.currentTime();
            if (currentTime) {
                const inverseMaxDuration = 1 / player.duration();
                const maxWidth = 100 * this.videoWidth;
                const elId = '#content-video-progress-bar';
                this.$el.querySelector(elId).style.width = `${maxWidth * currentTime * inverseMaxDuration}%`;
            }
        },
        extractClicks(denseLogs, filters) {
            // the code here can ben improved
            const clickfilters = Object.keys(filters)
                .map((key) => {
                    const value = filters[key];
                    switch (key) {
                        case 'countries':
                            return c => (value.length > 0 ? (value.indexOf(c.country) !== -1) : true);
                        case 'startDate':
                            return c => +c.timestamp >= value.getTime();
                        case 'endDate':
                            return c => +c.timestamp <= value.getTime();
                        default:
                            return () => { };
                    }
                });
            let clicks = denseLogs
                .map((d) => {
                    for (const c of d.clicks) {
                        c.timestamp = new Date(+d.timestamp).setHours(0);
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
        renderCalendar(video, startDateTS, endDateTS) {
            if (!this.complexObject.calendar) {
                const start = new Date(+startDateTS);
                const end = endDateTS ? new Date(+endDateTS) : new Date(+startDateTS + 12960000000); // 5 months
                const range = 1 + (end.getMonth() - start.getMonth()) +
                            (12 * (end.getFullYear() - start.getFullYear()));

                this.complexObject.calendar = new CalHeatmap();
                this.complexObject.calendar.init({
                    itemSelector: '#cal-heatmap',
                    start,
                    range,
                    domain: 'month',
                    tooltip: true,
                    loadOnInit: false,
                    itemName: ['click', 'clicks'],
                    subDomain: 'day',
                    cellSize: 15,
                });
            }
            const { temporalHotness } = video;
            const data = Object.keys(temporalHotness)
                .reduce((o, dateStr) => {
                    // all timestamp in seconde
                    o[(+dateStr) * 0.001] = Object.keys(temporalHotness[dateStr])
                        .map(userId => temporalHotness[dateStr][userId])
                        .reduce((a, b) => a + b, 0);
                    return o;
                }, {});
            this.complexObject.calendar.update(data);
        },
        onSelect() {
            if (this.video) {
                this.$nextTick(() => {
                    this.$refs.stackedChart.renderChart();
                    this.$refs.seekGraph.renderChart();
                });
            }
        },
        ...mapActions({
            getDenseLogs: FETCH_CLICKS,
            selectVideo: SELECT_VIDEO,
            updateFilter: UPDATE_CLICKS_FILTER,
        }),
    },
    computed: {
        clicksFilterStartDate: {
            get() {
                if (!this.video) return null;
                return this.video.clicksFilters.startDate; // In Date type
            },
            set(value) {
                this.updateFilter({ id: 'startDate', value });
            },
        },
        clicksFilterEndDate: {
            get() {
                if (!this.video) return null;
                return this.video.clicksFilters.endDate; // In Date type
            },
            set(value) {
                this.updateFilter({ id: 'endDate', value });
            },
        },
        clicksFilterCountry: {
            get() {
                if (!this.video) return [];
                return this.video.clicksFilters.countries;
            },
            set(value) {
                this.updateFilter({ id: 'countries', value });
            },
        },
        ...mapState({
            course: 'selectedCourse',
            courseStartDate({ selectedCourse }) {
                if (selectedCourse) {
                    const { startDate } = selectedCourse;
                    return startDate ? new Date(startDate) : new Date();
                }
                return new Date();
            },
            courseEndDate({ selectedCourse }) {
                if (selectedCourse) {
                    const { endDate } = selectedCourse;
                    return endDate ? new Date(endDate) : new Date();
                }
                return new Date();
            },
            videosList(state) {
                const course = this.course;
                if (!course) {
                    return [];
                }
                const { videos } = course;
                if (!Array.isArray(videos)) {
                    return [];
                }
                const videoByFirstSection = {};
                for (const video of videos) {
                    const sections = video.section.split('>>');
                    const section = sections[1];
                    if (!(section in videoByFirstSection)) {
                        videoByFirstSection[section] = {
                            section,
                            order: +sections[0],
                            videos: [],
                        };
                    }
                    videoByFirstSection[section].videos.push(video);
                }

                const sortVideosList = Object.keys(videoByFirstSection)
                    .map(section => videoByFirstSection[section])
                    .sort((a, b) => a.order - b.order);
                return sortVideosList;
            },
            video: 'selectedVideo',
            chartData(state) {
                const denseLogs = state.denseLogs;
                if (denseLogs && this.video) {
                    const filters = this.video.clicksFilters;
                    return this.extractClicks(denseLogs, filters);
                }
                return null;
            },
            countryList(state) {
                const denseLogs = state.denseLogs;
                if (denseLogs && this.video) {
                    const countryList = new Set();
                    for (const denseLog of denseLogs) {
                        const clicks = denseLog.clicks;
                        for (const click of clicks) {
                            countryList.add(click.country);
                        }
                    }
                    return Array.from(countryList);
                }
                return [];
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
                height: 200,
            },
            ticksAggregation: 3,
            videoWidth: 0.9, // a ratio
            videoMarginRight: 30,
            seekLineHeight: 200,
            stackedChartHeight: 250,
        };
    },
    watch: {
        video(newVideo) {
            if (this.$el) {
                this.$el.querySelector('#content-video-progress-bar').style.width = '0%';
            }
            if (newVideo) {
                // this.currentTime = videoInfo.currentTime;
                const src = newVideo.url || 'no video';
                const source = { src, type: '' };
                if (typeof newVideo.url === 'string' && newVideo.url.indexOf('www.youtube.com') !== -1) {
                    source.type = 'video/youtube';
                } else {
                    source.type = 'video/mp4';
                }
                this.videoConfig.sources = [source];
                if (this.$refs.myPlayer.player) {
                    this.$refs.myPlayer.player.poster('');
                }
                this.getDenseLogs();

                const startDateTS = this.course.startDate;
                const endDateTS = this.course.endDate;
                this.renderCalendar(newVideo, startDateTS, endDateTS);
            }
        },
        course() {
            if (this.complexObject.calendar) {
                this.complexObject.calendar.destroy();
                this.$el.querySelector('.ch-tooltip').remove();
                this.complexObject.calendar = null;
            }
        },
    },
};
