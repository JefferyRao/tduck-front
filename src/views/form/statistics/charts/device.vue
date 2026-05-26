<template>
  <div class="branch">
    <el-card class="branch-card" shadow="hover">
      <template #header>
        <font-icon class="fa fa-pie-chart" />
        <span> 常用设备 </span>
      </template>
      <t-chart class="device-echart" :init-options="initOptions" :option="option" theme="tduck-echarts-theme" />
    </el-card>
  </div>
</template>

<script>
import TChart from '@/views/components/TChart'
import { getFormDeviceRequest } from '@/api/project/report'

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
        color: ['#1890FF', '#2FC25B', '#FACC14', '#223273', '#8543E0', '#13C2C2'],
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
          extraCssText: 'box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: '常用设备',
            type: 'pie',
            radius: ['50%', '70%'],
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              color: '#666',
              formatter: '{b}\n{c} ({d}%)'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: []
          }
        ]
      }
    }
  },
  created() {
    this.getProjectSubmitDevice()
  },
  methods: {
    getProjectSubmitDevice() {
      getFormDeviceRequest({ formKey: this.formKey }).then((res) => {
        if (res.data && res.data.length) {
          this.option.series[0].data = res.data.map((item) => {
            return { value: item.count, name: item.osName ? item.osName : '其他' }
          })
        }
      })
    }
  }
}
</script>
