<script lang="ts">
import _ from 'lodash'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Doughnut } from 'vue-chartjs'
import { dataRawToChart } from '@/utils/helpers'

@Component({ extends: Doughnut })
export default class TheChart extends Vue {
  @Prop(Object) data: Widgets.AggData

  get chartdata() {
    const rv = dataRawToChart(this.data)

    if (rv.labels && rv.datasets && rv.datasets[0]) {
      rv.labels = _.zip(rv.labels, rv.datasets[0].data).map(
        ([x, y]) => `${x} ${y}%`
      )
    }

    return rv
  }

  mounted() {
    ;(this as Types.ChartComponent).renderChart(this.chartdata, {
      responsive: true,
      maintainAspectRatio: false,
      cutoutPercentage: 80
    })
  }
}
</script>
