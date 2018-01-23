import d3 from 'd3';
import { mapState, mapActions } from 'vuex';
import {
    FETCH_SENTIMENT,
} from '../../store';


export default {
    mounted() {
        // this.initSVG();
        const complexObj = {};
        complexObj.sentimentSvg = d3.select(this.$refs.sentimentSvg);
        complexObj.plotSvg = complexObj.sentimentSvg.select('g.plot');
        complexObj.xAxisSvg = complexObj.plotSvg.append('g').attr('class', 'x axis')
            .attr('transform', `translate(0,${this.plotHeight})`);
        complexObj.yAxisSvg = complexObj.plotSvg.append('g').attr('class', 'y axis');
        this.complexObj = complexObj;
    },
    complexObj: {},
    data() {
        return {
            lastCourse: null,
            isDetail: false,
            currentData: null,

            svgWidth: 1000,
            svgHeight: 500,
            plotPadding: {
                left: 50,
                right: 20,
                top: 50,
                bottom: 50,
            },
            nodeRadius: Math.sqrt(30),

            legendWidth: 140,
            legendHeight: 20,
            gradientId: 'gradient-sentiment-vis',
            gradientStopColor: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)',
                'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'],

            tooltipPos: {
                display: 'none',
                top: '0',
                left: '0',
            },
            tooltipContent: {
                time: '',
                sentiment: '',
            },
        };
    },
    watch: {
        course() {
            this.$nextTick(() => {
                this.updatePlot();
            });
            this.getSentimentInfo();
        },
    },
    computed: {
        bgRectHeight() {
            return (this.svgHeight - this.plotPadding.top - this.plotPadding.bottom) / 3;
        },
        plotWidth() {
            return this.svgWidth - this.plotPadding.left - this.plotPadding.right;
        },
        plotHeight() {
            return (this.svgHeight - this.plotPadding.top - this.plotPadding.bottom);
        },
        leftLegendTextX() {
            return this.svgWidth - this.legendWidth - this.plotPadding.right;
        },
        rightLegendTextX() {
            return this.svgWidth - this.plotPadding.right;
        },
        xScale() {
            return d3.scale.linear().range([this.nodeRadius, this.plotWidth])
                .domain(d3.extent(this.currentData, d => d.timestamp));
        },
        xAxis() {
            return d3.svg.axis().scale(this.xScale).tickFormat(this.formatMinutes).orient('bottom');
        },
        yScale() {
            return d3.scale.linear().range([this.nodeRadius, this.plotHeight - this.nodeRadius])
                .domain(d3.extent(this.currentData, d => d.sentiment).reverse());
        },
        yAxis() {
            return d3.svg.axis().scale(this.yScale).orient('left');
        },
        summaryColor() {
            return d3.scale.linear()
                .range(['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)',
                    'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'])
                .domain([-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4]);
        },
        ...mapState({
            course(state) {
                const course = state.selectedCourse;
                if (course && state.selectedCourse !== this.lastCourse) {
                    this.lastCourse = course;
                    this.getSentimentInfo();
                }
                return course;
            },
            sentimentInfo: 'sentimentInfo',
        }),
    },
    methods: {
        ...mapActions({
            getSentimentInfo: FETCH_SENTIMENT,
        }),
        extendColorScale(positive, neutral) {
            const tempScale = d3.scale.linear();
            if (neutral >= 0.5) {
                tempScale
                    .range(['#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a'])
                    .domain([-0.5, -0.25, 0, 0.25, 0.5]);
                return tempScale(positive);
            }
            return positive >= 0 ? `rgba(102,189,99,${1 - neutral})` : `rgba(244,109,67,${1 - neutral})`;
        },
        clearTooltip() {
            this.tooltipPos = { display: 'none' };
            this.tooltipContent = { time: '', sentiment: '' };
        },
        formatMinutes(d) {
            if (this.isDetail) {
                return d3.time.format('%H:%M')(new Date(+d));
            }
            return d3.time.format('%b %d')(new Date(+d));
        },
        mouseoverNode(event, node) {
            const bounds = this.$refs.sentimentSvg.getElementById('plot').getBoundingClientRect();
            const mouse = [event.clientX - bounds.left, event.clientY - bounds.top];
            const horizontalAnchor = mouse[0] > 0.5 * this.plotWidth ? 'right' : 'left';
            const horizontalPos = `${mouse[0] > 0.5 * this.plotWidth ? this.plotWidth - mouse[0] : mouse[0]}px`;

            this.tooltipPos = {
                top: `${mouse[1] - 10}px`,
                [horizontalAnchor]: horizontalPos,
            };
            this.tooltipContent = {
                time: `On ${this.formatMinutes(node.timestamp)},`,
                sentiment: this.isDetail ? `the sentiment is: ${node.sentiment.toFixed(2)}` :
                    `the average sentiment is: ${node.sentiment.toFixed(2)}`,
            };
        },
        mouseoutNode(e) {
            this.tooltipPos = {
                display: 'none',
            };
        },
        detailPlot(sentimentNode) {
            if (this.isDetail) {
                return;
            }
            this.currentData = this.sentimentInfo[sentimentNode.timestamp];
            if (!this.currentData) {
                return;
            }
            this.isDetail = true;
            this.clearTooltip();

            const { xAxisSvg, yAxisSvg } = this.complexObj;

            xAxisSvg
                .transition()
                .duration(500)
                .call(this.xAxis);

            yAxisSvg
                .transition()
                .duration(500)
                .call(this.yAxis);

            // const circles = circleG.selectAll('circle')
            //     .data(this.currentData, d => d.timestamp);

            // circles.exit()
            //     .transition().duration(500)
            //     .attr('r', 0)
            //     .remove();

            // circles.enter()
            //     .append('circle')
            //     .attr({
            //         class: 'node',
            //         r: '1',
            //         cx: d => this.xScale(d.timestamp),
            //         cy: d => this.yScale(d.sentiment),
            //         fill: d => this.summaryColor(d.sentiment),
            //     })
            //     .on('mouseover', mouseover)
            //     .on('mouseout', mouseout)
            //     .transition()
            //     .duration(500)
            //     .attr('r', this.nodeRadius);
        },
        updatePlot() {
            if (!this.sentimentInfo) {
                return;
            }
            this.clearTooltip();
            this.isDetail = false;
            this.currentData = Object.keys(this.sentimentInfo)
                .map((timestamp) => {
                    const threads = this.sentimentInfo[timestamp];
                    const avgSentiment = threads.reduce((sum, s) => sum + s.sentiment, 0) / threads.length;
                    return {
                        timestamp,
                        sentiment: avgSentiment,
                    };
                });
            const { xAxisSvg, yAxisSvg } = this.complexObj;

            xAxisSvg
                .transition()
                .duration(500)
                .call(this.xAxis);

            yAxisSvg
                .transition()
                .duration(500)
                .call(this.yAxis);

            // const circles = circleG.selectAll('circle')
            //     .data(this.currentData, d => d.timestamp);

            // circles.exit()
            //     .transition().duration(500)
            //     .attr('r', 0)
            //     .remove();

            // const self = this;
            // function mouseover(d) {
            //     const mouse = d3.mouse(this);
            //     const horizontalAnchor = mouse[0] > 0.5 * self.plotWidth ? 'right' : 'left';
            //     const horizontalPos = `${mouse[0] > 0.5 * self.plotWidth ? self.plotWidth - mouse[0] : mouse[0]}px`;

            //     self.tooltipPos = {
            //         top: `${mouse[1] - 10}px`,
            //         [horizontalAnchor]: horizontalPos,
            //     };
            //     self.tooltipContent = {
            //         time: `On ${this.formatMinutes(d.timestamp)},`,
            //         sentiment: `the average sentiment is: ${d.sentiment.toFixed(2)}`,
            //     };
            // }
            // function mouseout(d) {
            //     self.tooltipPos = {
            //         display: 'none',
            //     };
            // }
            // circles.enter()
            //     .append('circle')
            //     .attr({
            //         class: 'node',
            //         r: '1',
            //         cx: d => this.xScale(d.timestamp),
            //         cy: d => this.yScale(d.sentiment),
            //         fill: d => this.summaryColor(d.sentiment),
            //     })
            //     .on('mouseover', mouseover)
            //     .on('mouseout', mouseout)
            //     .on('click', this.detailPlot)
            //     .transition()
            //     .duration(500)
            //     .attr('r', this.nodeRadius);
        },
    },
};
