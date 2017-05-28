import d3 from 'd3';
import nv from 'nvd3';
import { mapState } from 'vuex';
import { UiModal } from '../KeenUI';

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
            lastCourse: null,
            chartConfig: {
                width: 800,
                height: 300,
                margin: {
                    // top: 20,
                    // right: 20,
                    // bottom: 60,
                    left: 100,
                },
                x: d => d.label,
                y: d => d.value,
                // showValues: true,
                valueFormat: d => `${d3.format(',.1f')(d / 1000)}k`,
                duration: 500,
                tooltip: {
                    keyFormatter: (d) => {
                        if (!d) {
                            return '';
                        }
                        const tempLabel = d.split('>>').filter((l, i) => i % 2 === 1);
                        tempLabel.pop();
                        return tempLabel.join(',');
                    },
                },
                xAxis: {
                    axisLabel: 'Videos',
                    axisLabelDistance: 1,
                    tickFormat: d => null,
                    rotateLabels: 0,
                },
                yAxis: {
                    axisLabel: 'Popularity (number of clicks)',
                    axisLabelDistance: 20,
                },
            },
        };
    },
    computed: {
        ...mapState({
            course(state) {
                if (state.selectedCourse !== this.lastCourse) {
                    this.lastCourse = state.selectedCourse;
                    this.shouldUpdate = true;
                }
                return state.selectedCourse;
            },
            chartData(state) {
                const course = state.selectedCourse;
                let chartData = [];
                if (course) {
                    const videos = course.videos;
                    videos.forEach((v) => {
                        if (!v.pop) {
                            const pop = Object.keys(v.temporalHotness)
                                .map(key => +v.temporalHotness[key])
                                .reduce((a, b) => a + b, 0);
                            v.pop = pop;
                        }
                    });

                    chartData = [{
                        key: 'Hotness',
                        values: videos
                            .map(v => ({
                                section: v.section,
                                label: v.section,
                                value: v.pop,
                                color: '#428bca',
                                name: v.name,
                            })),
                    }];
                }
                return chartData;
            },
        }),
    },
    complexObject: {
        chart: null,
    },
    methods: {
        openModal() {
            // TODO Could be more elegent
            this.$refs.modalVideopopInfo.open();
            this.$nextTick(() => {
                if (this.shouldUpdate) {
                    this.renderBarChart(this.chartData, this.chartConfig, this.$refs.barchart);
                    this.shouldUpdate = false;
                }
            });
        },
        renderBarChart(data, config, el) {
            if (!data || !data[0]) return;
            if (!config) return;

            if (!this.complexObject.chart) {
                this.complexObject.chart = nv.models.discreteBarChart();
            }
            const chart = this.complexObject.chart;
            chart
                .width(config.width)
                .height(config.height)
                .margin(config.margin)
                .x(config.x) // Specify the data accessors.
                .y(config.y)
                .valueFormat(config.valueFormat)
                .duration(config.duration);

            chart.tooltip.keyFormatter(config.tooltip.keyFormatter);
            chart.xAxis.axisLabel(config.xAxis.axisLabel)
                .axisLabelDistance(config.xAxis.axisLabelDistance)
                .tickFormat(config.xAxis.tickFormat)
                .rotateLabels(config.xAxis.rotateLabels);
            chart.yAxis.axisLabel(config.yAxis.axisLabel)
                .axisLabelDistance(config.yAxis.axisLabelDistance);

            d3.select(el)
                .selectAll('*')
                .remove();

            d3.select(el)
                .datum(data)
                .transition()
                .duration(1000)
                .call(chart);

            nv.utils.windowResize(chart.update);
        },
    },
};
