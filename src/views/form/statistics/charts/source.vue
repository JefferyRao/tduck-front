<template>
  <div class="source">
    <el-card class="source-card" shadow="hover">
      <template #header>
        <span>
          <font-icon class="fa fa-bar-chart" />
          提交来源
        </span>
      </template>
      <t-chart class="source-echart" :init-options="initOptions" :option="option" theme="tduck-echarts-theme" />
    </el-card>
  </div>
</template>

<script>
import TChart from '@/views/components/TChart'
import { getFormSourceRequest } from '@/api/project/report'

export default {
  components: { TChart },
  props: {
    formKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      initOptions: {
        renderer: 'svg'
      },
      option: {
        legend: {
          show: true,
          top: 0,
          right: 40,
          textStyle: { color: '#666' }
        },
        toolbox: {
          show: true,
          top: -5,
          right: 0,
          feature: {
            saveAsImage: { show: true, title: '保存为图片' }
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#fff',
          padding: [10, 15],
          textStyle: { color: '#333' },
          extraCssText: 'box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); z-index:1'
        },
        grid: {
          top: '5%',
          left: '5%',
          right: '10%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            splitLine: {
              lineStyle: { type: 'dashed', color: '#E8E8E8' }
            },
            axisLabel: { color: '#666' },
            axisLine: { show: false },
            axisTick: { show: false }
          }
        ],
        yAxis: [
          {
            type: 'category',
            axisLine: { lineStyle: { color: '#D9D9D9' } },
            axisTick: { show: false },
            axisLabel: { color: '#666' },
            data: []
          }
        ],
        series: [
          {
            name: '数量',
            type: 'bar',
            barWidth: 16,
            label: {
              show: true,
              position: 'right',
              color: '#666',
              fontSize: 12,
              formatter: ({ data }) => {
                return `${data}`
              }
            },
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              color: '#1890FF'
            },
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.1)',
              borderRadius: [0, 4, 4, 0]
            },
            data: []
          }
        ]
      }
    }
  },
  created() {
    this.getProjectSubmitSource()
  },
  methods: {
    getProjectSubmitSource() {
      getFormSourceRequest({ formKey: this.formKey }).then((res) => {
        if (res.data && res.data.length) {
          this.option.yAxis[0].data = res.data.map((item) => {
            return item.browserName ? item.browserName : '其他'
          })
          this.option.series[0].data = res.data.map((item) => {
            return item.count
          })
        }
      })
    }
  }
}
</script>
