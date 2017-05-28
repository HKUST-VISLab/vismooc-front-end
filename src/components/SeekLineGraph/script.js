import { mapState } from 'vuex';

export default {
    props: ['seekData'],
    data() {
        return {
            height: 200,
            width: 0,
            videoLength: 0,
        };
    },
    methods: {
        renderChart(data) {
            const toUse = {
                forward: [],
                backward: [],
            };
            // classify data
            for (let i = 0, len = data.length; i < len; ++i) {
                const temp = data[i];
                if (temp.newTime > temp.oldTime) {
                    toUse.forward.push(temp);
                } else {
                    toUse.backward.push(temp);
                }
            }

            this.$refs.canvas.width = this.width;
            this.$refs.canvas.height = this.height;
            const ctx = this.$refs.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.width, this.height);
            const widthPerVideoLength = this.width / this.videoLength;
            const halfHeight = this.height * 0.5;
            Object.keys(toUse).forEach((key) => {
                const lineToDraw = toUse[key];
                const forward = key === 'forward';
                ctx.beginPath();
                ctx.lineWidth = forward ? 0.6 : 1;
                ctx.strokeStyle = forward ? 'rgba(255,120,0,0.2)' : 'rgba(19,60,172,0.2)';
                for (let i = 0, len = lineToDraw.length; i < len; ++i) {
                    const temp = lineToDraw[i];
                    const x1 = (temp.oldTime * widthPerVideoLength);
                    const y1 = forward ? 0 : halfHeight;
                    const x2 = (temp.newTime * widthPerVideoLength);
                    const y2 = forward ? halfHeight : this.height;
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.stroke();
            });
        },
        onClick(evt) {
            const target = evt.target || evt.srcElement;
            const rect = target.getBoundingClientRect();
            const offsetX = evt.clientX - rect.left;
            this.$emit('seeklinegraph-click', { offsetX, width: this.width });
        },
    },
    computed: {
        ...mapState({
            video: 'selectedVideo',
        }),
    },
    watch: {
        seekData(seekData) {
            if (!this.video) return;
            if (!this.seekData) return;
            const rect = this.$refs.canvas.getBoundingClientRect();
            if (this.height === 0) {
                this.height = rect.height;
            }
            this.width = rect.width;
            this.videoLength = this.video.duration || this.seekData.reduce((max, c) => c.oldTime || 0, 0);
            this.renderChart(this.seekData);
        },
    },
};
