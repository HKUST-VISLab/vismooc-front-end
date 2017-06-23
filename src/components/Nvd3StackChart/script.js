import 'nvd3/build/nv.d3.min.css';
import d3 from 'd3';
import nv from 'nvd3';
import { mapState } from 'vuex';
import { arrayAggregate } from 'src/service/util';

export default {
    props: ['clicks'],
    mounted() {
        this.complexObject = {};
    },
    data() {
        return {
            config: {
                height: 300,
                margin: {
                    // top: 60,
                    right: 0,
                    bottom: 40,
                    left: 40,
                },
                type: 'stackedAreaChart',
                x: d => d[0],
                y: d => d[1],
                xAxis: {
                    showMaxMin: false,
                    tickFormat(d) {
                        const trueD = d * 3; // hard code
                        let sec = trueD % 60;
                        const min = Math.floor(trueD / 60);
                        if (sec === 0) {
                            sec = '00';
                        }
                        return d3.time.format(`${min}'${sec}`);
                    },
                },
                yAxis: {
                    tickFormat: d => d,
                },
                useVoronoi: false,
                clipEdge: true,
                duration: 500,
                useInteractiveGuideline: true,
            },
        };
    },
    methods: {
        renderChart(data) {
            const config = this.config;
            if (!this.complexObject.chart) {
                this.complexObject.chart = nv.models.stackedAreaChart();
            }
            const chart = this.complexObject.chart;
            chart.height(config.height)
                .margin(config.margin)
                .x(config.x)
                .y(config.y)
                .useVoronoi(config.useVoronoi)
                .clipEdge(config.clipEdge)
                .duration(config.duration)
                .useInteractiveGuideline(config.useInteractiveGuideline)
                .controlLabels({ stacked: 'Stacked' });

            chart.xAxis
                .showMaxMin(config.xAxis.showMaxMin || false)
                .tickFormat(config.xAxis.tickFormat);
            chart.yAxis
                .tickFormat(config.yAxis.tickFormat);
            chart.legend.vers('furious');

            d3.select(this.$refs.svg).selectAll('*').remove();
            d3.select(this.$refs.svg)
                .datum(data)
                .transition()
                .duration(1000)
                .call(chart);

            nv.utils.windowResize(chart.update);
        },
    },
    complexObject: {
        chart: null,
    },
    computed: {
        ...mapState({
            selectedVideo: 'selectedVideo',
        }),
    },
    watch: {
        clicks(clicks) {
            if (clicks) {
                const videoLength = this.selectedVideo.duration ||
                    clicks.reduce((max, c) => Math.max(max, c.currentTime || c.oldTime || 0), 0);
                const clicksDist = {};
                for (const click of clicks) {
                    const time = Math.min(
                        Math.floor(click.currentTime || click.oldTime),
                        videoLength - 1,
                    );
                    const type = click.type;
                    if (type !== 'show_transcript' && type !== 'hide_transcript') {
                        if (!(type in clicksDist)) {
                            clicksDist[type] = Array(videoLength).fill(0);
                        }
                        clicksDist[type][time] += 1;
                    }
                }
                const colors = d3.scale.ordinal()
                    .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd', '#8c564b'])
                    .domain(['seeked', 'pause', 'play', 'stalled', 'error', 'ratechange']);

                this.renderChart(Object.keys(clicksDist)
                    // .filter(d => d !== 'show_transcript' && d !== 'hide_transcript')
                    .map(key => ({
                        key,
                        values: arrayAggregate(3, clicksDist[key]).map((d, i) => [i, d]),
                        color: colors(key),
                    }))
                    .sort((a, b) => a.key.localeCompare(b.key)));
            }
        },
    },
};
