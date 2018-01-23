import d3 from 'd3';
import nv from 'nvd3';
import Datamap from 'datamaps';
import { mapState, mapActions } from 'vuex';
import { FETCH_DEMOGRAPHICINFO } from 'store';

export default {
    filters: {
        formatTimestamp(value) {
            if (!value) return 'the end of this world!';
            return new Date(value).toLocaleDateString();
        },
    },
    mounted() {
        this.complexObject = {};
    },
    data() {
        return {
            videoPopChartConfig: {
                height: 300,
                margin: {
                    left: 100,
                },
                // showValues: true,
            },
            demographicMapConfig: {
                width: 800,
                height: 400,
            },
        };
    },
    watch: {
        course() {
            this.$nextTick(() => {
                this.renderBarChart();
            });
            this.getDemographicInfo();
        },
        demographicInfo() {
            this.$nextTick(() => {
                this.renderGeoMap(this.demographicMapConfig);
            });
        },
    },
    computed: {
        ...mapState({
            course(state) {
                return state.selectedCourse;
            },
            username: 'username',
            videoPopInfo(state) {
                if (!this.course) {
                    return [];
                }

                const { videos } = this.course;
                if (!videos) {
                    return [];
                }
                for (const video of videos) {
                    if (!video.pop) {
                        const { temporalHotness } = video;
                        const pop = Object.keys(temporalHotness)
                            .map(date => temporalHotness[date]) // {[userId:string]:number}
                            .reduce((a, b) => a + Object.keys(b).length, 0);
                        video.pop = pop;
                    }
                }

                const chartData = [{
                    key: 'Hotness',
                    values: videos
                        .map(v => ({
                            // section: v.section,
                            label: `${v.section.split('>>')[1]},${v.name}`,
                            value: v.pop,
                            color: '#428bca',
                            // name: v.name,
                        })),
                }];
                return chartData;
            },
            demographicInfo: 'demographicInfo',
        }),
    },
    complexObject: {
        videoPopChart: null,
        demographicMap: null,
    },
    methods: {
        getChartWidth() {
            return this.$el.getBoundingClientRect().width;
        },
        renderBarChart() {
            if (!this.videoPopInfo || !this.videoPopInfo[0]) return;
            const data = this.videoPopInfo;
            if (!this.complexObject.videoPopChart) {
                this.complexObject.videoPopChart = nv.models.discreteBarChart();
                const config = this.videoPopChartConfig;
                // chart
                this.complexObject.videoPopChart
                    .width(this.getChartWidth())
                    .height(config.height)
                    .margin(config.margin)
                    .x(d => d.label) // Specify the data accessors.
                    .y(d => d.value)
                    .valueFormat(d => `${d3.format(',.1f')(d / 1000)}k`)
                    .duration(500);
                // tooltip
                this.complexObject.videoPopChart.tooltip.keyFormatter(d => d || 'No name');
                // xAxis
                this.complexObject.videoPopChart.xAxis.axisLabel('Videos')
                    .axisLabelDistance(1)
                    .tickFormat(d => null)
                    .rotateLabels(0);
                // yAxis
                this.complexObject.videoPopChart.yAxis.axisLabel('Popularity (number of users)')
                    .axisLabelDistance(20);
                // draw
                d3.select(this.$refs.barchart)
                    .datum(data)
                    .transition()
                    .duration(1000)
                    .call(this.complexObject.videoPopChart);
                // responsive
                window.addEventListener('resize', () => {
                    this.complexObject.videoPopChart
                        .width(this.getChartWidth())
                        .update();
                });
            } else {
                // update data and size
                d3.select(this.$refs.barchart)
                    .datum(data);
                this.complexObject.videoPopChart
                    .width(this.getChartWidth())
                    .update();
            }
        },
        renderGeoMap(config) {
            if (!this.demographicInfo) return;
            const data = this.demographicInfo;
            const color = d3.scale.linear()
                .range(['#edf8b1', '#2c7fb8'])
                .domain([0, Math.log(d3.max(data.map(d => d.count)))]);

            const geoData = {};
            for (const d of data) {
                if (d.code3.length === 3) {
                    geoData[d.code3] = {
                        id: d.code3,
                        count: d.count,
                        fillColor: color(Math.log(d.count)),
                    };
                }
            }

            if (!this.complexObject.demographicMap) {
                const element = this.$refs.geomap;
                this.complexObject.demographicMap = new Datamap({
                    element,
                    fills: {
                        defaultFill: '#edf8b1',
                    },
                    data: geoData,
                    geographyConfig: {
                        borderColor: '#dddddd',
                        popupTemplate(geo, d) {
                            return ['<div class="hoverinfo"><strong>',
                                `${d.count} students come from ${geo.properties.name}`,
                                '</strong></div>',
                            ].join('');
                        },
                    },
                    responsive: true,
                    // done: (datamap) => {
                    //     datamap.svg.selectAll('.datamaps-subunit')
                    //         .on('click', (d) => {
                    //             this.filterByCountry({
                    //                 id: 'country',
                    //                 value: d.id,
                    //             });
                    //         });
                    // },
                });
                // responsive
                window.addEventListener('resize', () => {
                    this.complexObject.demographicMap.resize();
                });
            } else {
                // update data and size
                this.complexObject.demographicMap.updateChoropleth(geoData);
                this.complexObject.demographicMap.resize();
            }
        },
        onSelect() {
            this.$nextTick(() => {
                this.renderBarChart();
                this.renderGeoMap();
            });
        },
        ...mapActions({
            getDemographicInfo: FETCH_DEMOGRAPHICINFO,
        }),
    },
};
