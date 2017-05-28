/* eslint-disable no-mixed-operators */
import d3 from 'd3';
import { mapState } from 'vuex';
import { UiModal } from '../KeenUI';
import { DBSCAN } from '../../utils/DBSCAN';
import javaData from '../../assets/javaData.json';

export default {
    components: {
        UiModal,
    },
    data() {
        return {
            svgWidth: 800,
            svgHeight: 800,
            eventTypes: ['play', 'pause', 'rewatch', 'skip'],
            legendMargin: 100,
            isInited: false,
            // Cluster view
            plotMargin: {
                top: 30,
            },
            boxHeight: 0,
            boxMargin: 20,
            mainMargin: 20,
            clusterWidth: 0,
            mainWidth: 0,
            // main view
            threadHeight: 0,
        };
    },
    complexObject: {
        svgMainview: null,
    },
    mounted() {
        // cluster view
        this.boxHeight = (this.svgHeight - this.plotMargin.top) / 4;
        this.boxHeight -= this.boxMargin;
        this.clusterWidth = this.svgWidth / 4;
        this.clusterMargin = this.svgWidth / 43;

        this.mainWidth = this.svgWidth * 0.6;
        this.threadHeight = this.boxHeight / 4;
        // this.threadWidth = this.boxWidth * 0.1;
        this.mainStart = this.clusterWidth + (this.clusterMargin * 2);
        this.complexObject = {};
        this.complexObject.svgMainview = d3.select(this.$refs.svgMainview);
    },
    computed: {
        pieColor() {
            return d3.scale.ordinal()
                .range(['#8dd3c7', '#FFF66C', '#fb8072', '#377eb8']);
        },
        ...mapState({
            course: 'selectedCourse',
        }),
    },
    methods: {
        openModal() {
            this.$refs.modalDropoutInfo.open();
            this.$nextTick(() => {
                if (!this.isInited) {
                    this.clusterPlot(javaData.cluster);
                    this.mainPlot(javaData.c);
                    this.isInited = true;
                }
            });
        },
        clusterPlot(data) {
            const svgMainview = this.complexObject.svgMainview;
            // cluster
            const dataTemp = [[], [], [], []];
            const clustered = [[], [], [], []];

            for (let j = 0, lenj = data.length; j < lenj; j++) {
                let t = 0;

                if (data[j].classId === 0) t = 2;
                else if (data[j].classId === 1) t = 3;
                else if (data[j].classId === 2) t = 0;
                else if (data[j].classId === 3) t = 1;

                dataTemp[t].push([data[j].x, data[j].y]);
            }

            // DBSCAN
            const dbscan = new DBSCAN();
            for (let i = 0; i < 4; i++) {
                const clusters = dbscan.run(dataTemp[i], 5, 2);
                clusters.sort((a, b) => b.length - a.length);

                for (let j = 0; j < 4; j++) {
                    for (let k = 0; k < clusters[j].length; k++) {
                        dataTemp[i][clusters[j][k]].clusterId = j;
                        clustered[i].push(dataTemp[i][clusters[j][k]]);
                    }
                }
            }

            const textLegend = ['active students - predicted',
                'active students - missed',
                'drop students - predicted',
                'drop students - missed'];

            for (let i = 0; i < 4; i++) {
                const xdomainCluster = d3.extent(clustered[i], d => d[0]);
                const ydomainCluster = d3.extent(clustered[i], d => d[1]);
                const xCluster = d3.scale.linear().range([0, this.clusterWidth]).domain(xdomainCluster);
                const yCluster = d3.scale.linear().range([this.boxHeight, 0]).domain(ydomainCluster);

                const circleG = svgMainview.append('g')
                    .attr('class', `cluster cluster_${i}`)
                    .attr('transform', `translate(0, ${i * (this.boxMargin + this.boxHeight) + this.plotMargin.top})`);

                circleG.append('text')
                    .attr('x', this.clusterWidth * 0.5)
                    .text(textLegend[i]);

                const cluster = clustered[i];
                circleG.selectAll('circle')
                    .data(cluster).enter()
                    .append('circle')
                    .attr('cx', d => xCluster(d[0]))
                    .attr('cy', d => yCluster(d[1]))
                    .attr('r', 2)
                    .attr('class', 'cluster')
                    .style('fill', d => this.pieColor(d.clusterId))
                    .attr('opacity', 0.4);
            }
        },
        mainPlot(c) {
            const svgMainview = this.complexObject.svgMainview;
            const cCount = [1408, 351, 310, 11, 1574, 599, 7, 7, 921, 655, 20, 7, 134, 117, 81, 33];
            const pieType = ['play', 'pause', 'bseeked', 'fseeked'];
            // draw student number bar (optional)
            const middleWidth = 50;
            const middleHeight = 28;
            const xdomainMiddleBar = [0, d3.max(cCount)];
            const xscaleMiddleBar = d3.scale.pow().exponent(0.5).range([1, middleWidth]).domain(xdomainMiddleBar);

            // draw legend
            const xAxisMain = d3.svg.axis()
                .scale(xscaleMiddleBar)
                .orient('top')
                .tickValues(xdomainMiddleBar[1] === 1 ? [0, 1] : [0, xdomainMiddleBar[1]]);

            svgMainview.append('g')
                .attr('class', 'x axis')
                .attr('transform', `translate(${this.mainMargin * 2 + this.clusterWidth + this.mainWidth}, ${this.plotMargin.top - 5})`)
                .call(xAxisMain);
            for (let i = 0; i < 4; ++i) {
                const g = svgMainview.append('g')
                    .attr('class', `main-plot mainPlot_${i}`)
                    .attr('transform', `translate(${this.mainMargin}, ${i * (this.boxMargin + this.boxHeight) + this.plotMargin.top})`);

                for (let j = 0; j < 4; ++j) {
                    g.append('line')
                        .attr('class', 'stem')
                        .attr('id', `stem_${i}_${j}`)
                        .attr('x1', this.clusterWidth)
                        .attr('y1', (j + 0.5) * this.threadHeight)
                        .attr('x2', this.clusterWidth + this.mainWidth)
                        .attr('y2', (j + 0.5) * this.threadHeight);

                    g.append('rect')
                        .attr('class', 'horizontal-bar')
                        .attr('x', this.mainMargin + this.clusterWidth + this.mainWidth)
                        .attr('y', (j + 0.25) * this.threadHeight)
                        .attr('width', xscaleMiddleBar(cCount[i * 4 + j]))
                        .attr('height', middleHeight);

                    for (let k = 0; k < 10; k++) {
                        const ccc = c[i * 4 + j];
                        const totalClick = ccc[`play${k}`] + ccc[`pause${k}`] + ccc[`bseeked${k}`] + ccc[`fseeked${k}`];

                        const cx = this.clusterWidth + k * 0.11111111 * this.mainWidth;
                        const cy = (j + 0.5) * this.threadHeight;

                        if (ccc[`total_video${k}`] === 0) {
                            g.append('circle')
                                .attr('class', 'empty-circle')
                                .attr('cy', cy)
                                .attr('cx', cx);
                        } else {
                            if (totalClick > 0) {
                                let curAngle = 0;
                                for (let h = 0; h < 4; h++) {
                                    const innerArc = d3.svg.arc()
                                        .innerRadius(0)
                                        .outerRadius(() => Math.min(ccc[`total_video${k}`] / 10 * 5 + 6, 11))
                                        .startAngle(2 * Math.PI * curAngle)
                                        .endAngle(2 * Math.PI * (curAngle + ccc[pieType[h] + k] / totalClick));
                                    g.append('path')
                                        .attr('d', innerArc)
                                        .style('fill', this.pieColor(h))
                                        .attr('class', 'inner-circle')
                                        .attr('expend', false)
                                        .attr('transform', `translate(${cx}, ${cy})`)
                                        .append('title')
                                        .text(ccc[`total_video${k}`]);
                                    curAngle += ccc[pieType[h] + k] / totalClick;
                                }
                            }

                            // draw outer circle
                            if (ccc[`problem${k}`] > 0) {
                                const outArc = d3.svg.arc()
                                    .innerRadius(() => Math.min(ccc[`total_video${k}`] / 10 * 5 + 6, 11) + 2)
                                    .outerRadius(() => Math.min(ccc[`total_video${k}`] / 10 * 5 + 6, 11) + 3)
                                    .startAngle(0)
                                    .endAngle(() => Math.max(0.2 * Math.PI, 2 * Math.PI * ccc[`problem${k}`]));
                                g.append('path')
                                    .attr('class', 'outter-circle')
                                    .attr('d', outArc)
                                    .attr('transform', `translate(${cx}, ${cy})`);
                            }
                        }
                    }
                }

                g.append('line')
                    .attr('class', 'vertical-seperator')
                    .attr('x1', this.mainMargin + this.clusterWidth + this.mainWidth)
                    .attr('x2', this.mainMargin + this.clusterWidth + this.mainWidth)
                    .attr('y1', 0)
                    .attr('y2', this.boxHeight);
            }
        },
    },
};
