<template>
  <div class="analysis-container">
    <div v-if="list && list.length > 0">
      <el-row :gutter="24">
        <el-col :span="24" v-for="(item, index) in list" :key="index" style="margin-bottom: 24px">
          <el-card shadow="hover" class="analysis-card">
            <div slot="header" class="card-header">
              <span class="title">
                <i class="el-icon-data-analysis"></i>
                <span class="title-text">{{ item.label || item.title || '题目分析' }}</span>
              </span>
              <div class="select">
                <span class="select-label">图表类型</span>
                <el-select v-model="item.chartType" placeholder="请选择" size="small" style="width: 120px">
                  <el-option
                    v-for="option in options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>
            </div>

            <div class="card-body">
              <el-row :gutter="40" type="flex" align="top" style="flex-wrap: wrap">
                <el-col :xs="24" :sm="24" :md="12" :lg="10">
                  <div class="chart-wrapper">
                    <t-chart :option="getCharData(item)" :init-options="initOptions" theme="tduck-echarts-theme" />
                  </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="14">
                  <div class="table-wrapper">
                    <el-table
                      :data="getTableData(item)"
                      style="width: 100%"
                      stripe
                      size="medium"
                      :header-cell-style="{ background: '#f7f9fc', color: '#333', fontWeight: 'bold' }"
                    >
                      <el-table-column prop="fieldName" label="选项内容" min-width="150" show-overflow-tooltip>
                        <template slot-scope="scope">
                          <span class="field-name">{{ scope.row.fieldName }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="data" label="数量" width="140" align="center">
                        <template slot-scope="scope">
                          <span class="data-num">{{ scope.row.data }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="proportion" label="占比" width="120" align="center">
                        <template slot-scope="scope">
                          <el-tag
                            size="small"
                            :type="getProportionType(scope.row.proportion)"
                            effect="light"
                            class="proportion-tag"
                          >
                            {{ scope.row.proportion }}
                          </el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <el-empty v-else description="暂无分析数据，只有单选、多选、下拉框等组件可生成图表分析" class="custom-empty">
      <template slot="image">
        <i class="el-icon-data-board empty-icon"></i>
      </template>
    </el-empty>
  </div>
</template>

<script>
import TChart from '@/views/components/TChart'
import { getFormAnalysisRequest } from '@/api/project/report'

export default {
  components: {
    TChart
  },
  data() {
    return {
      initOptions: {
        renderer: 'png'
      },
      list: [],
      options: [
        {
          value: 'pie',
          label: '饼状图'
        },
        {
          value: 'bar',
          label: '柱状图'
        },
        {
          value: 'line',
          label: '折线图'
        }
      ]
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      getFormAnalysisRequest({ formKey: this.$route.query.key }).then((res) => {
        this.list = res.data
      })
    },
    getCharData(data) {
      const config = {
        color: [
          '#3370ff',
          '#36a3f7',
          '#34bfa3',
          '#f4516c',
          '#fada5e',
          '#8a2be2',
          '#1890ff',
          '#2fc25b',
          '#facc14',
          '#223273',
          '#8543e0',
          '#13c2c2',
          '#3436c7',
          '#f04864'
        ],
        legend: {
          orient: 'horizontal',
          right: '5%',
          top: '0',
          textStyle: {
            color: '#666'
          }
        },
        toolbox: {
          show: true,
          showTitle: false,
          feature: {
            saveAsImage: {
              show: true,
              title: '保存为图片',
              iconStyle: {
                borderColor: '#666'
              }
            }
          },
          tooltip: {
            show: true,
            formatter: function (param) {
              return '<div>' + param.title + '</div>'
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            textStyle: {
              fontSize: 12,
              color: '#333'
            },
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 4px;'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b} <br/> 数量: {c}',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          textStyle: {
            color: '#333'
          },
          extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 4px;'
        },
        grid: {
          top: '15%',
          left: '2%',
          right: '4%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [
          {
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#e5e6eb'
              }
            },
            axisLabel: {
              color: '#666'
            },
            type: 'category',
            axisTick: {
              show: false,
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#e5e6eb'
              }
            },
            axisLine: {
              show: false
            },
            axisLabel: {
              color: '#666'
            }
          }
        ],
        series: [
          {
            name: '数量',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            barWidth: '35%',
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            data: []
          }
        ]
      }

      if (['bar', 'line'].includes(data.chartType)) {
        config.tooltip.axisPointer = {
          type: 'shadow'
        }
        config.tooltip.trigger = 'axis'
        config.xAxis[0].data = data.fieldName
        config.series[0].data = data.data
        config.series[0].type = data.chartType
        config.series[0].label = {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: '#666',
          fontSize: 12
        }

        if (data.chartType === 'line') {
          config.series[0].smooth = true
          config.series[0].symbolSize = 8
          config.series[0].areaStyle = {
            opacity: 0.1
          }
          config.tooltip.axisPointer.type = 'line'
        }
      } else {
        config.tooltip = {
          trigger: 'item',
          formatter: '{b} <br/> 数量: {c} ({d}%)'
        }
        config.series[0].type = 'pie'
        config.series[0].label = {
          show: true,
          formatter: function (params) {
            return params.name + '\\n' + params.value + ' (' + params.percent + '%)'
          },
          color: '#666',
          fontSize: 13
        }
        config.series[0].data = []
        Object.keys(data.map).forEach((key) => {
          config.series[0].data.push({ name: key, value: data.map[key] })
        })
      }
      return config
    },
    getTableData(data) {
      let fieldName = data.fieldName
      let dataNum = data.data
      let sum = dataNum.reduce((a, b) => a + b, 0)
      return fieldName.map((field, index) => ({
        fieldName: field,
        data: dataNum[index],
        proportion: sum === 0 ? '0.00%' : ((dataNum[index] / sum) * 100).toFixed(2) + '%'
      }))
    },
    getProportionType(proportion) {
      const val = parseFloat(proportion)
      if (val >= 50) return 'danger'
      if (val >= 30) return 'warning'
      if (val >= 10) return 'success'
      return 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.analysis-container {
  padding: 10px;
  height: calc(100vh - 140px);
  overflow-y: auto !important;
  overflow-x: hidden !important;

  .analysis-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
      transform: translateY(-2px);
    }

    ::v-deep .el-card__header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      padding: 16px 24px;
      background-color: #fafbfc;
      border-radius: 12px 12px 0 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        display: flex;
        align-items: center;

        i {
          margin-right: 10px;
          color: #3370ff;
          font-size: 20px;
        }

        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #1d2129;
        }
      }

      .select {
        display: flex;
        align-items: center;

        .select-label {
          font-size: 14px;
          color: #86909c;
          margin-right: 12px;
        }

        ::v-deep .el-input__inner {
          border-radius: 6px;
        }
      }
    }

    .card-body {
      padding: 16px;

      .chart-wrapper {
        height: 380px;
        width: 100%;
        padding: 10px;
        background: #fff;
        border-radius: 8px;
      }

      .table-wrapper {
        padding: 10px;

        ::v-deep .el-table {
          border-radius: 8px;
          border: 1px solid #e5e6eb;
          overflow: hidden;

          th.el-table__cell {
            background-color: #f7f8fa !important;
            border-bottom: 1px solid #e5e6eb;
          }

          td.el-table__cell {
            border-bottom: 1px solid #f2f3f5;
          }
        }

        .field-name {
          color: #1d2129;
          font-weight: 500;
        }

        .data-num {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 15px;
          color: #3370ff;
          font-weight: 600;
        }

        .proportion-tag {
          border-radius: 4px;
          font-weight: 500;
        }
      }
    }
  }

  .custom-empty {
    padding: 60px 0;

    .empty-icon {
      font-size: 64px;
      color: #c9cdd4;
    }

    ::v-deep .el-empty__description p {
      color: #86909c;
      font-size: 14px;
      margin-top: 16px;
    }
  }
}
</style>
