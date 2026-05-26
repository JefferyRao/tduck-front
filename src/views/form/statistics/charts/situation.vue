<template>
  <el-card class="situation" shadow="hover">
    <template #header>
      <font-icon class="fa fa-line-chart" />
      周收集趋势
    </template>
    <t-chart style="width: 100%" :init-options="initOptions" :option="option" theme="tduck-echarts-theme" />
  </el-card>
</template>

<script>
import TChart from '@/views/components/TChart'
import { getFormSituationRequest } from '@/api/project/report'

export default {
  components: {
    TChart
  },
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
        color: ['#1890FF'],
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
          backgroundColor: '#fff',
          padding: [10, 15],
          textStyle: { color: '#333' },
          extraCssText: 'box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); z-index:1'
        },
        grid: {
          top: '8%',
          left: '2%',
          right: '4%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: [],
            axisLine: { lineStyle: { color: '#D9D9D9' } },
            axisLabel: { color: '#666' },
            axisTick: { alignWithLabel: true, lineStyle: { color: '#D9D9D9' } }
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#666' },
            splitLine: { lineStyle: { type: 'dashed', color: '#E8E8E8' } }
          }
        ],
        series: [
          {
            name: '回收量',
            type: 'line',
            data: [],
            label: {
              show: true,
              position: 'top',
              color: '#666',
              fontSize: 12
            },
            smooth: true,
            symbolSize: 6,
            lineStyle: { width: 3 },
            areaStyle: {
              color: new TChart.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
              ])
            },
            itemStyle: {
              color: '#1890FF',
              borderWidth: 2,
              borderColor: '#fff'
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.getProjectSituation()
  },
  methods: {
    getProjectSituation() {
      getFormSituationRequest({ formKey: this.formKey }).then((res) => {
        this.option.xAxis[0].data = res.data.map((item) => {
          return item.createTime
        })
        this.option.series[0].data = res.data.map((item) => {
          return item.count
        })
      })
    }
  }
}
</script>
