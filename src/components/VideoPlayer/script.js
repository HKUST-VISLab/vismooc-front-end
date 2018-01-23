import 'video.js/dist/video-js.css';
import videojs from 'thirdParty/videojs-youtube';

export default {
    name: 'video-player',
    props: {
        options: {
            type: Object,
            required: true,
        },
    },
    mounted() {
        if (!this.player) {
            this.initialize();
        }
    },
    beforeDestroy() {
        if (this.player) {
            this.dispose();
        }
    },
    methods: {
        initialize() {
            // init
            const self = this;
            this.player = null;

            // options
            const videoOptions = Object.assign({

                // component options
                start: 0,
                playsinline: false,
                customEventName: 'statechanged',

                // videojs options
                autoplay: false,
                controls: true,
                preload: 'auto',
                fluid: false,
                muted: false,
                width: '100%',
                height: '360',
                language: 'en',
                controlBar: {
                    remainingTimeDisplay: false,
                    playToggle: {},
                    progressControl: {},
                    fullscreenToggle: {},
                    volumeMenuButton: {
                        inline: false,
                        vertical: true,
                    },
                },
                techOrder: ['html5', 'flash'],
                playbackRates: [],
                plugins: {},
            }, this.options);

            // check sources
            /*
            if (!videoOptions.sources || !videoOptions.sources.length) {
              console.warn('Missing required option: "sources".')
              return false
            }
            */

            // emit event
            const emitPlayerState = function (event, value) {
                if (event) {
                    self.$emit(event, self.player);
                }
                if (value) {
                    const values = {};
                    values[event] = value;
                    self.$emit(videoOptions.customEventName, values);
                }
            };

            // videoOptions
            // console.log(videoOptions)

            // avoid error "VIDEOJS: ERROR: Unable to find plugin: __ob__"
            delete videoOptions.plugins.__ob__;
            this.player = videojs(this.$el.children[0], videoOptions, function () {
                // player readied
                self.$emit('ready', self.player);

                this.on('loadeddata', function () {
                    this.muted(videoOptions.muted);
                    if (videoOptions.start) {
                        this.currentTime(videoOptions.start);
                    }
                    emitPlayerState('loadeddata', true);
                });

                this.on('canplay', () => {
                    emitPlayerState('canplay', true);
                });

                this.on('canplaythrough', () => {
                    emitPlayerState('canplaythrough', true);
                });

                this.on('play', () => {
                    emitPlayerState('play', true);
                });

                this.on('pause', () => {
                    emitPlayerState('pause', true);
                });

                this.on('waiting', () => {
                    emitPlayerState('waiting', true);
                });

                this.on('playing', () => {
                    emitPlayerState('playing', true);
                });

                this.on('ended', () => {
                    emitPlayerState('ended', true);
                });

                this.on('timeupdate', function () {
                    emitPlayerState('timeupdate', this.currentTime());
                });
            });
        },
        dispose() {
            if (this.player && videojs) {
                this.player.pause();
                videojs(this.$el.children[0]).dispose();
                if (!this.$el.children.length) {
                    const video = document.createElement('video');
                    video.className = 'video-js vjs-custom-skin';
                    this.$el.appendChild(video);
                }
                this.player = null;
            }
        },
    },
    watch: {
        options: {
            deep: true,
            handler(options, oldOptions) {
                this.dispose();
                if (options && options.sources && options.sources.length) {
                    this.initialize();
                }
            },
        },
    },
};
