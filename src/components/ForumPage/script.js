
import { mapState, mapActions } from 'vuex';
import { FETCH_SENTIMENT, FETCH_FORUMSOCIALNETWORK } from 'store';
import SentimentInfo from '../SentimentInfo';
import SocialNetwork from '../SocialNetwork';

export default {
    components: {
        sentimentInfo: SentimentInfo,
        socialNetwork: SocialNetwork,
    },
    methods: {
        onSelect () {
            this.$nextTick(() => {
                this.$refs.sentimentInfo.updatePlot();
                this.$refs.socialNetwork.initialize();
            })
        }
    }
};
