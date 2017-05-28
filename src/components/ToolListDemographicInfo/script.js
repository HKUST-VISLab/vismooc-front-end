// thrid party
import { mapState, mapActions } from 'vuex';

import d3 from 'd3';
import Datamap from 'datamaps';
import { UiModal } from '../KeenUI';
import {
    FETCH_DEMOGRAPHICINFO,
    UPDATE_CLICKS_FILTER,
} from '../../store';

export default {
    components: {
        UiModal,
    },
    mounted() {
        this.complexObject = {};
    },
    data() {
        return {
            modalBodyWidth: 800,
            modalBodyHeight: 400,
        };
    },
    // map data
    complexObject: {
        map: null,
    },
    methods: {
        ...mapActions({
            getDemographicInfo: FETCH_DEMOGRAPHICINFO,
            filterByCountry: UPDATE_CLICKS_FILTER,
        }),
        openModal() {
            const data = this.demographicInfo;
            if (!data) return;
            const color = d3.scale.linear()
                .range(['#edf8b1', '#2c7fb8'])
                .domain([0, Math.log(d3.max(data.map(d => d.count)))]);

            const geoData = {};
            data.forEach((d) => {
                if (d.code3.length !== 3) return;
                geoData[d.code3] = {
                    id: d.code3,
                    count: d.count,
                    fillColor: color(Math.log(d.count)),
                };
            });

            if (!this.complexObject.map) {
                const element = this.$refs.geomap;
                const width = this.modalBodyWidth;
                const height = this.modalBodyHeight;
                this.complexObject.map = new Datamap({
                    element,
                    height,
                    width,
                    fills: {
                        defaultFill: '#edf8b1',
                    },
                    data: geoData,
                    geographyConfig: {
                        borderColor: '#dddddd',
                        popupTemplate(geo, d) {
                            return ['<div class="hoverinfo"><strong>',
                                `${d.count} users come from ${geo.properties.name}`,
                                '</strong></div>',
                            ].join('');
                        },
                    },
                    done: (datamap) => {
                        datamap.svg.selectAll('.datamaps-subunit')
                            .on('click', (d) => {
                                this.filterByCountry({
                                    id: 'country',
                                    value: d.id,
                                });
                            });
                    },
                });
            } else {
                this.complexObject.map.updateChoropleth(geoData);
            }
            this.$refs.modalDemographicInfo.open();
        },
    },
    computed: {
        ...mapState({
            course: 'selectedCourse',
            demographicInfo: 'demographicInfo',
        }),
    },
    watch: {
        course(course) {
            if (course) {
                this.getDemographicInfo();
            }
        },
    },
};
