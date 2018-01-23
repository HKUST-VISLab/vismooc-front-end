// thrid party
import d3 from 'd3';
import { mapState, mapActions } from 'vuex';
import { UiSlider } from '../KeenUI';
import {
    FETCH_FORUMSOCIALNETWORK,
    FETCH_WORDCLOUD,
} from '../../store';
// import WordCloud from "wordcloud";

export default {
    components: {
        UiSlider,
    },
    data() {
        return {
            threshold: 10,
            showInfo: 'No selection',
            hoveredNodeId: null,
            // countrycode: '',
            wordCloudData: [],
            wordcloud: null,

            geoData: null,
            svgWidth: 800,
            svgHeight: 600,
            svgPadding: {
                left: 30,
                right: 30,
                top: 100,
                bottom: 0,
            },
            legendWidth: 200,
            legendHeight: 20,
            legendPadding: 100,
            legendMargin: {
                left: 180,
                top: 50,
                right: 30,
                buttom: 20,
            },

            gradientId: 'gradient-sentiment-vis',
            gradientData: [],
            lastCourse: null,

        };
    },
    mounted() {
        // Calculate the data of LinearGradient
        const hueStart = 160;
        const hueEnd = 0;
        const numberHues = 35;
        const opacityStart = 1.0;
        const opacityEnd = 1.0;
        const deltaPercent = 1 / (numberHues - 1);
        const deltaHue = (hueEnd - hueStart) / (numberHues - 1);
        const deltaOpacity = (opacityEnd - opacityStart) / (numberHues - 1);

        for (let i = 0; i < numberHues; ++i) {
            const theHue = hueStart + (deltaHue * i);
            // the second parameter, set to 1 here, is the saturation
            // the third parameter is "lightness"
            const rgbString = d3.hsl(theHue, 1, 0.6).toString();
            const opacityValue = opacityStart + (deltaOpacity * i);
            const p = 0 + (deltaPercent * i);
            this.gradientData.push({
                rgb: rgbString,
                opacity: opacityValue,
                percent: p,
            });
        }
    },
    computed: {
        activenessRange() {
            return this.socialNetworkInfo ? this.socialNetworkInfo.activenessRange : [0, 100];
        },
        links() {
            return this.socialNetworkInfo ? this.socialNetworkInfo.links : [];
        },
        nodes() {
            return this.socialNetworkInfo ? this.socialNetworkInfo.nodes : [];
        },
        xScale() {
            return d3.scale.linear()
                .domain(d3.extent(this.nodes, d => d.x))
                .range([this.svgPadding.left, this.svgWidth - this.svgPadding.right]);
        },
        yScale() {
            return d3.scale.linear()
                .domain(d3.extent(this.nodes, d => d.y))
                .range([this.svgPadding.top, this.svgHeight - this.svgPadding.bottom]);
        },
        rScale() {
            return d3.scale.pow()
                .domain(this.activenessRange)
                .range([2, 11]);
        },
        widthScale() {
            return d3.scale.log()
                .domain(d3.extent(this.links, d => d.weight))
                .range([0.1, 4]);
        },
        gradeScale() {
            return d3.scale.linear()
                .domain(d3.extent(this.nodes, d => d.grade))
                .range([0, this.gradientData.length - 1]);
        },
        nodeDict() {
            return this.nodes.reduce((o, d) => {
                o[d.id] = d;
                return o;
            }, {});
        },
        nodeDegree() {
            const tmpnodeDegree = {};
            for (const link of this.links) {
                if (!tmpnodeDegree[link.source]) {
                    tmpnodeDegree[link.source] = 0;
                }
                tmpnodeDegree[link.source] += 1;

                if (!tmpnodeDegree[link.target]) {
                    tmpnodeDegree[link.target] = 0;
                }
                tmpnodeDegree[link.target] += 1;
            }
            return tmpnodeDegree;
        },
        ...mapState({
            course(state) {
                const course = state.selectedCourse;
                if (course) {
                    if (this.lastCourse !== course) {
                        this.getSocialNetwork({ threshold: this.threshold });
                        this.lastCourse = course;
                    }
                }
                return course;
            },
            wordCloud(state) {
                this.wordCloudData = state.wordCloudData;
                this.createWordcloud();
            },
            socialNetworkInfo: 'socialNetworkInfo',
        }),
    },
    methods: {
        ...mapActions({
            getSocialNetwork: FETCH_FORUMSOCIALNETWORK,
            getWordCloud: FETCH_WORDCLOUD,
        }),
        filterUsersByThreshold() {
            // const min = +this.socialNetworkInfo.activenessRange[0] || 1;
            // const max = +this.socialNetworkInfo.activenessRange[1] || 10;
            // const threshold = Math.ceil((max - min) * this.threshold * 0.01);
            this.getSocialNetwork({ threshold: this.threshold });
        },
        initialize() {
            this.$nextTick(() => {
                if (this.$refs.uiSlider.trackLength === 0) {
                    this.$refs.uiSlider.initializeSlider();
                }
                this.filterUsersByThreshold();
            });
        },
        calLinkPath(d) {
            const nodeDict = this.nodeDict;
            const dx = this.xScale(nodeDict[d.target].x) - this.xScale(nodeDict[d.source].x);
            const dy = this.yScale(nodeDict[d.target].y) - this.yScale(nodeDict[d.source].y);
            const r = Math.sqrt((dx * dx) + (dy * dy)) * 2;
            return `M${this.xScale(nodeDict[d.source].x)},` +
                `${this.yScale(nodeDict[d.source].y)}A${r},` +
                `${r} 0 0 1${this.xScale(nodeDict[d.target].x)},` +
                `${this.yScale(nodeDict[d.target].y)}`;
        },
        hoverNode(node) {
            this.hoveredNodeId = node ? node.id : null;
        },
        // changeThreshold() {
        //     this.getSocialNetwork(this.threshold.value);
        // },
        clearSelection() {
            this.showInfo = 'No selection';
        },
    },
    watch: {
        course() {
            this.getSocialNetwork({ threshold: this.threshold });
        },
        /*
        countrycode: (newVal, oldVal) => {
            if (newVal !== oldVal) {
                const nodeDict = this.nodeDict;
                this.$refs.socialNetworkSVG.selectAll('path.edge')
                    .attr('class', (d) => {
                        const code = newVal;
                        if (code === '-') {
                            return 'edge';
                        }
                        if (code) {
                            if (nodeDict[d.source].code3 === code && nodeDict[d.target].code3 === code) {
                                return 'edge';
                            }
                            return 'edge opacityedge';
                        }
                        return 'edge';
                    });

                this.$refs.socialNetworkSVG.selectAll('circle.node')
                    .attr('class', (d) => {
                        const code = newVal;
                        if (code === '-') {
                            return 'node';
                        }
                        if (code) {
                            if (d.code3 === code) {
                                return 'node';
                            }
                            return 'node opacitynode';
                        }
                        return 'node';
                    });
            }
        },
        */
    },
};
