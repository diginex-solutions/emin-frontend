<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Bar } from 'vue-chartjs'
import { dataRawToChart } from '@/utils/helpers'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ extends: Bar })
export default class TheChart extends Vue {
  @Prop(Object) data: Widgets.AggData
  @Prop(Boolean) isPercentage: boolean

  get chartdata() {
    // inverse colors for bar chart
    return dataRawToChart(this.data)
  }

  mounted() {
    const yAxesOptions: Types.ChartOptions = {
      ticks: {
        beginAtZero: true
      },

      scaleLabel: {
        display: true,
        labelString: 'Units'
      },

      gridLines: {
        display: false
      }
    }

    if (this.isPercentage) {
      // Set label title
      yAxesOptions.scaleLabel.labelString = 'Percentage'

      // Set ticks options
      yAxesOptions.ticks = {
        beginAtZero: true,

        // Set max/min values
        min: 0,
        max: 100,
        // Convert label to percentage
        callback: (value: number) => ((value / 100) * 100).toFixed(0) + '%'
      }
    }

    ;(this as Types.ChartComponent).renderChart(this.chartdata, {
      responsive: true,
      maintainAspectRatio: false,

      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false
            }
          }
        ],
        yAxes: [yAxesOptions]
      }
    })
  }
}
</script>
