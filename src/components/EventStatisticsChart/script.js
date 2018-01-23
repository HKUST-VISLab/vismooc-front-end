import 'nvd3/build/nv.d3.min.css';
import d3 from 'd3';
import nv from 'nvd3';

export default {
    props: {
        clicks: {
            type: Array,
        },
        graphHeight: {
            type: Number,
            default: 250,
        },
        graphWidthRatio: {
            type: Number,
            default: 0.8,
        },
        marginRight: {
            type: Number,
            default: 20,
        },
    },
    mounted() {
        this.complexObject = {
            color: d3.scale.ordinal()
                .range(['#1f77b4', '#fdae6b', 'rgba(255,120,0,0.2)',
                    'rgba(19,60,172,0.2)', '#d62728', '#9467bd', '#8c564b'])
                .domain(['play_video', 'pause_video', 'forward_seek',
                    'backward_seek', 'speed_change_video', 'stop_video', 'null']),
        };
    },
    complexObject: {
        chart: null,
        color: null,
    },
    data() {
        return {
            graphWidth: 200,
        };
    },
    methods: {
        renderChart(data) {
            if (!data) return;
            if (!this.complexObject.chart) {
                this.complexObject.chart = nv.models.pieChart()
                    .x(d => d.label)
                    .y(d => d.value)
                    .showLabels(true) // Display pie labels
                    .labelThreshold(0.05) // Configure the minimum slice size for labels to show up
                    .labelType('percent')
                    .donut(true) // Turn on Donut mode. Makes pie chart look tasty!
                    .donutRatio(0.35) // Configure how big you want the donut hole size to be.
                ;
            }
            const { chart } = this.complexObject;

            d3.select(this.$refs.svg)
                .datum(data)
                .transition()
                .duration(350)
                .call(chart);
        },
    },
    computed: {
        renderData() {
            if (!this.clicks) return [];
            const data = {
                play_video: 0,
                forward_seek: 0,
                backward_seek: 0,
                pause_video: 0,
                stop_video: 0,
                speed_change_video: 0,
            };
            for (const click of this.clicks) {
                const { type } = click;
                if (type !== 'seek_video') {
                    data[type] += 1;
                } else if (click.newTime > click.oldTime) {
                    data.forward_seek += 1;
                } else {
                    data.backward_seek += 1;
                }
            }
            const renderData = Object.keys(data)
                .map(label => ({
                    label,
                    value: data[label],
                    color: this.complexObject.color(label),
                }));
            this.renderChart(renderData);
            return renderData;
        },
    },
};
