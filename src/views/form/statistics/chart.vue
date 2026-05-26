<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-blue">
            <i class="el-icon-s-claim card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">有效回收量</div>
            <count-to :end-val="projectStats.completeCount" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-green">
            <i class="el-icon-view card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">总浏览量</div>
            <count-to :end-val="projectStats.viewCount" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-orange">
            <i class="el-icon-data-line card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">回收率</div>
            <div class="card-panel-num"><count-to :end-val="projectStats.completeRate" /> %</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-purple">
            <i class="el-icon-time card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">平均完成时间</div>
            <div class="card-panel-num">{{ projectStats.avgCompleteFormatStr }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" style="margin-bottom: 20px">
        <situation :form-key="formKey" />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24" style="margin-bottom: 20px">
        <position-map :form-key="formKey" />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :span="12" style="margin-bottom: 20px">
        <device :form-key="formKey" />
      </el-col>
      <el-col :xs="24" :sm="12" :span="12" style="margin-bottom: 20px">
        <submit-source :form-key="formKey" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getFormReportRequest } from '@/api/project/report'
import { timeFormat } from '@/utils'
import situation from './charts/situation'
import PositionMap from './charts/PositionMap'
import device from './charts/device'
import SubmitSource from './charts/source'

export default {
  name: 'StatisticsChart',
  components: {
    situation,
    PositionMap,
    device,
    SubmitSource
  },
  data() {
    return {
      formKey: '',
      projectStats: {
        avgCompleteTime: 0,
        avgCompleteFormatStr: 0,
        viewCount: 0,
        completeCount: 0,
        completeRate: 0
      }
    }
  },
  created() {
    this.formKey = this.$route.query.key
    this.getProjectStats()
  },
  methods: {
    getProjectStats() {
      getFormReportRequest({ formKey: this.formKey }).then((res) => {
        this.projectStats = res.data
        if (this.projectStats.completeCount) {
          let rate = this.projectStats.completeCount / this.projectStats.viewCount
          this.projectStats.completeRate = rate > 1 ? 100 : rate * 100
          this.projectStats.avgCompleteFormatStr = timeFormat(this.projectStats.avgCompleteTime)
        } else {
          this.projectStats.completeRate = 0
          this.projectStats.avgCompleteFormatStr = 0
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f0f2f5;
  height: calc(100vh - 120px);
  overflow-y: auto !important;
  overflow-x: hidden !important;

  .panel-group {
    .card-panel-col {
      margin-bottom: 32px;
    }

    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #fff;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        .card-panel-icon-wrapper {
          color: #fff;
        }
        .icon-blue {
          background: #40c9c6;
        }
        .icon-green {
          background: #36a3f7;
        }
        .icon-orange {
          background: #f4516c;
        }
        .icon-purple {
          background: #34bfa3;
        }
      }

      .icon-blue {
        color: #40c9c6;
      }

      .icon-green {
        color: #36a3f7;
      }

      .icon-orange {
        color: #f4516c;
      }

      .icon-purple {
        color: #34bfa3;
      }

      .card-panel-icon-wrapper {
        padding: 16px;
        transition: all 0.3s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        font-size: 48px;
      }

      .card-panel-description {
        font-weight: bold;
        text-align: right;

        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }

        .card-panel-num {
          font-size: 24px;
          color: #333;
        }
      }
    }
  }
}

::v-deep .el-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
}

::v-deep .el-card__header {
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
  color: #333;
  padding: 16px 20px;

  .fa,
  [class^='el-icon-'] {
    margin-right: 8px;
    color: #1890ff;
  }
}
</style>
