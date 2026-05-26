<template>
  <el-card shadow="hover">
    <template #header>
      <font-icon class="fa fa-map" />
      表单提交地域分布图
    </template>
    <t-chart
      :init-options="initOptions"
      :option="option"
      style="height: 430px; margin: 0 auto"
      theme="tduck-echarts-theme"
    />
  </el-card>
</template>

<script>
import axios from 'axios'
import TChart from '@/views/components/TChart'
import { getFormPositionRequest } from '@/api/project/report'

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
      // 中国地图
      option: {}
    }
  },
  created() {
    this.getMap()
  },
  methods: {
    getProjectSubmitPosition() {
      getFormPositionRequest({ formKey: this.formKey }).then((res) => {
        const dataArr = Object.keys(res.data).map((key) => {
          return { name: key.replace(/省(s?)|市(s?)|\//gi, ''), value: res.data[key] }
        })
        this.option.series[0].data = dataArr

        // 动态设置最大值以适应颜色映射
        const values = Object.values(res.data)
        if (values.length > 0) {
          this.option.visualMap.max = Math.max(...values) || 100
        } else {
          this.option.visualMap.max = 100
        }
      })
    },
    async getMap() {
      const { data } = await axios({
        url: location.origin + '/china.json',
        method: 'get'
      })
      TChart.registerMap('china', data)
      this.option = {
        title: {
          text: '',
          subtext: ''
        },
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
          trigger: 'item',
          backgroundColor: '#fff',
          padding: [10, 15],
          textStyle: { color: '#333' },
          extraCssText: 'box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);'
        },
        visualMap: {
          min: 0,
          max: 55000,
          text: ['高', '低'],
          realtime: false,
          calculable: true,
          inRange: {
            color: ['#e6f7ff', '#1890ff', '#0050b3']
          },
          textStyle: { color: '#666' }
        },
        series: [
          {
            name: '提交数',
            type: 'map',
            roam: false,
            map: 'china',
            selectedMode: 'multiple',
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1,
              areaColor: '#f5f5f5'
            },
            label: {
              show: true,
              color: '#666',
              fontSize: 10,
              formatter: function (params) {
                if (params.value) {
                  return params.name + '\n' + params.value
                }
                return params.name
              }
            },
            emphasis: {
              label: { show: true, color: '#333' },
              itemStyle: {
                areaColor: '#bae7ff',
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            },
            data: []
          }
        ]
      }
      this.getProjectSubmitPosition()
    }
  }
}
</script>
