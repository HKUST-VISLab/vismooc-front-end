import 'nvd3/build/nv.d3.min.css';
import d3 from 'd3';
import nv from 'nvd3';
import { mapState } from 'vuex';
import { arrayAggregate } from 'src/service/util';

export default {
    props: {
        clicks: {
            type: Array,
        },
        graphWidthRatio: {
            type: Number,
            default: 0.8,
        },
        height: {
            type: Number,
            default: 200,
        },
        marginRight: {
            type: Number,
            default: 20,
        },
        ticksAggregate: {
            type: Number,
            default: 1,
        },
    },
    mounted() {
        this.complexObject = {
            color: d3.scale.ordinal()
                .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd', '#8c564b'])
                .domain(['play_video', 'pause_video', 'seek_video', 'speed_change_video', 'stop_video', 'null']),
        };
    },
    data() {
        return {
            // graphMarginRightRatio: 0.05,
            legendOrder: {
                play_video: 0,
                seek_video: 1,
                pause_video: 2,
                stop_video: 3,
                speed_change_video: 4,
            },
        };
    },
    methods: {
        renderChart() {
            const data = this.eventDict;
            if (!data) return;

            if (!this.complexObject.chart && this.video) {
                this.complexObject.chart = nv.models.stackedAreaChart();
                // set the width and height
                const rect = this.$refs.svg.getBoundingClientRect();
                const margin = {
                    right: this.marginRight,
                    left: (rect.width * (1 - this.graphWidthRatio)) - this.marginRight,
                };
                // config.margin.right = rect.width * this.graphMarginRightRatio;
                this.complexObject.chart
                    // .width(config.width)
                    .height(this.height)
                    .margin(margin)
                    .x(d => d[0])
                    .xDomain([0, Math.ceil(this.video.duration / this.ticksAggregate)])
                    .y(d => d[1])
                    .useVoronoi(false)
                    .clipEdge(true)
                    .duration(500)
                    .controlOptions(['Stacked', 'Expanded'])
                    .useInteractiveGuideline(true);

                // xAxis
                this.complexObject.chart.xAxis
                    .showMaxMin(false)
                    .tickFormat((d) => {
                        const trueD = d * this.ticksAggregate; // hard code
                        let sec = trueD % 60;
                        const min = Math.floor(trueD / 60);
                        if (sec === 0) {
                            sec = '00';
                        }
                        return `${min}'${sec}`;
                    });
                // yAxis
                this.complexObject.chart.yAxis
                    .tickFormat(d => d);
                // legend
                this.complexObject.chart.legend.vers('furious');

                d3.select(this.$refs.svg)
                    .datum(data)
                    .call(this.complexObject.chart);

                // responsive
                window.addEventListener('resize', () => {
                    const newRect = this.$refs.svg.getBoundingClientRect();
                    const newMargin = {
                        right: this.marginRight,
                        left: (newRect.width * (1 - this.graphWidthRatio)) - this.marginRight,
                    };
                    this.complexObject.chart
                        .margin(newMargin)
                        .update();
                });
            } else {
                // update data and size
                d3.select(this.$refs.svg)
                    .datum(data);

                const newRect = this.$refs.svg.getBoundingClientRect();
                const newMargin = {
                    right: this.marginRight,
                    left: (newRect.width * (1 - this.graphWidthRatio)) - this.marginRight,
                };
                this.complexObject.chart
                    .margin(newMargin)
                    .xDomain([0, Math.ceil(this.video.duration / this.ticksAggregate)])
                    .update();
            }
        },
    },
    complexObject: {
        chart: null,
        color: null,
    },
    computed: {
        ...mapState({
            video: 'selectedVideo',
        }),
        eventDict() {
            if (!this.clicks || !this.video) return [];
            const videoLength = this.video.duration;
            const clicksDist = {};
            for (const click of this.clicks) {
                const time = Math.min(
                    Math.floor(click.currentTime || click.oldTime),
                    videoLength - 1,
                );
                const type = click.type;
                if (!(type in clicksDist)) {
                    clicksDist[type] = Array(videoLength).fill(0);
                }
                clicksDist[type][time] += 1;
            }
            return Object.keys(clicksDist)
                // .filter(d => d !== 'show_transcript' && d !== 'hide_transcript')
                .map(key => ({
                    key, // : key.replace('_video', ''),
                    values: arrayAggregate(this.ticksAggregate, clicksDist[key]).map((d, i) => [i, d]),
                    color: this.complexObject.color(key),
                }))
                .sort((a, b) => this.legendOrder[a.key] - this.legendOrder[b.key]);
        },
    },
    watch: {
        eventDict() {
            this.renderChart();
        },
    },
};
