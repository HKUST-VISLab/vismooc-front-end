<template>
    <div class="event-statistics">
        <h4> Click Type Statistics </h4>
        <div class="chart-part" :style="{'padding-left':`calc(${(1 - graphWidthRatio) * 100}% - ${marginRight}px)`}">
            <svg ref="svg" :style="{height:graphHeight+'px'}"></svg>
            <table>
                <tr :key="item.label" v-for="item in renderData" :style="{'background-color': item.color}">
                    <td width="30%">{{item.label}}</td>
                    <td width="70%">{{item.value}}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script src="./script.js"></script>

<style lang="scss">
@import "src/styles/import";
.event-statistics {
    width: 100%;
    text-align: center;
    .chart-part {
        display: flex;
        align-items: center;
        svg {
            width: 70%
        }
        table {
            width: 30%;
        }
    }
}
</style>
