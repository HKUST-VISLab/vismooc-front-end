import d3 from 'd3';
import { mapState } from 'vuex';

export default {
    props: {
        seekData: {
            type: Array,
        },
        graphWidthRatio: {
            type: Number,
            default: 200,
        },
        height: {
            type: Number,
            default: 20,
        },
        marginRight: {
            type: Number,
            default: 20,
        },
        // only used for ticks
        ticksAggregate: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            width: 0,
            graphHeight: 0, // the focusHeight
            graphWidth: 100,
        };
    },
    mounted() {
        window.addEventListener('resize', () => {
            this.renderChart();
        });
    },
    methods: {
        renderChart() {
            if (!this.video || !this.seekData) return;
            const data = this.seekData;
            // set the video length
            const videoLength = this.video.duration;
            // set the height & width
            const rect = this.$refs.canvas.getBoundingClientRect();
            this.width = rect.width;
            this.graphWidth = this.width * this.graphWidthRatio;
            this.graphHeight = this.height - 20;

            // setting the size of canvas
            this.$refs.canvas.width = this.width;
            this.$refs.canvas.height = this.height;

            // get context
            const ctx = this.$refs.canvas.getContext('2d');
            // clear context
            ctx.clearRect(0, 0, this.width, this.height);
            // draw graph
            const widthPerVideoLength = this.graphWidth / videoLength;
            const paddingLeft = this.width - this.graphWidth - this.marginRight;
            const halfHeight = this.graphHeight * 0.5;

            // classify data
            const toUse = { forward: [], backward: [] };
            for (let i = 0, len = data.length; i < len; ++i) {
                const temp = data[i];
                if (temp.newTime > temp.oldTime) {
                    toUse.forward.push(temp);
                } else {
                    toUse.backward.push(temp);
                }
            }
            // draw seek line
            Object.keys(toUse).forEach((key) => {
                const lineToDraw = toUse[key];
                const forward = key === 'forward';
                ctx.beginPath();
                ctx.lineWidth = forward ? 0.6 : 1;
                ctx.strokeStyle = forward ? 'rgba(255,120,0,0.2)' : 'rgba(19,60,172,0.2)';
                for (let i = 0, len = lineToDraw.length; i < len; ++i) {
                    const temp = lineToDraw[i];
                    const x1 = paddingLeft + (temp.oldTime * widthPerVideoLength);
                    const y1 = forward ? 0 : halfHeight;
                    const x2 = paddingLeft + (temp.newTime * widthPerVideoLength);
                    const y2 = forward ? halfHeight : this.graphHeight;
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.stroke();
            });
            // draw legend
            const legendMargin = 3;
            ctx.font = `${paddingLeft * 0.125}px Roboto`;
            ctx.fillStyle = 'red';
            ctx.textAlign = 'end';
            ctx.fillText('Forward', paddingLeft - legendMargin, this.graphHeight * 0.25);
            ctx.fillText('Backward', paddingLeft - legendMargin, this.graphHeight * 0.75);
            // axis
            const scale = d3.scale.linear()
                .range([0, this.graphWidth])
                .domain([0, Math.ceil(this.video.duration / this.ticksAggregate)]);
            const ticksFormat = (d) => {
                const trueD = d * this.ticksAggregate;
                let sec = trueD % 60;
                const min = Math.floor(trueD / 60);
                if (sec === 0) {
                    sec = '00';
                }
                return `${min}'${sec}`;
            };
            const ticks = scale.ticks(this.calcTicksX(this.video.duration));
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.font = '12px Roboto';
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            // draw begin line
            ctx.moveTo(paddingLeft, 0);
            ctx.lineTo(paddingLeft, this.graphHeight);
            // ctx.moveTo(this.width, 0);
            // ctx.lineTo(this.width, this.graphHeight);
            // draw axis line
            ctx.moveTo(paddingLeft, this.graphHeight);
            ctx.lineTo(this.width, this.graphHeight);
            // draw tickText
            const tickTextY = 0.5 * (this.height - this.graphHeight);
            for (const tick of ticks) {
                const x = paddingLeft + scale(tick);
                const tickText = ticksFormat(tick);
                ctx.fillText(tickText, x, this.graphHeight + tickTextY);
            }
            ctx.stroke();
        },
        onClick(evt) {
            const target = evt.target || evt.srcElement;
            const rect = target.getBoundingClientRect();
            const paddingLeft = this.width - this.graphWidth - this.marginRight;
            const offsetX = evt.clientX - rect.left - paddingLeft;
            this.$emit('seeklinegraph-click', { offsetX, width: this.graphWidth });
        },
        calcTicksX(numValues) {
            let numTicks = this.graphWidth / 100;
            // console.log('Requested number of ticks: ', numTicks);
            // console.log('Calculated max values to be: ', numValues);
            // make sure we don't have more ticks than values to avoid duplicates
            numTicks = numTicks > numValues ? numTicks = numValues - 1 : numTicks;
            // make sure we have at least one tick
            numTicks = numTicks < 1 ? 1 : numTicks;
            // make sure it's an integer
            numTicks = Math.floor(numTicks);
            // console.log('Calculating tick count as: ', numTicks);
            return numTicks;
        },
    },
    computed: {
        ...mapState({
            video: 'selectedVideo',
        }),
    },
    watch: {
        seekData() {
            this.renderChart();
        },
    },
};
