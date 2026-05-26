<template>
  <div class="project-card-container">
    <div v-if="projectList.length" class="project-card-grid">
      <div v-for="p in projectList" :key="p.id" class="project-card-item">
        <!-- 精致卡片封面饰图，采用高雅 CSS 渐变与线条，富于科技感 -->
        <div class="card-cover" @click="toProjectHandle(p, 'editor')">
          <div class="cover-pattern">
            <!-- 抽象极简的表单线条装饰 -->
            <svg class="pattern-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="25" width="70" height="8" rx="2" fill="currentColor" fill-opacity="0.08" />
              <rect x="15" y="45" width="50" height="8" rx="2" fill="currentColor" fill-opacity="0.06" />
              <rect x="15" y="65" width="60" height="8" rx="2" fill="currentColor" fill-opacity="0.04" />
              <circle cx="75" cy="49" r="4" fill="currentColor" fill-opacity="0.1" />
              <circle cx="75" cy="69" r="4" fill="currentColor" fill-opacity="0.1" />
            </svg>
          </div>
          <!-- 悬浮类型标章 -->
          <span class="form-type-badge" :class="'type-' + p.type">
            {{ getType(p.type).name }}
          </span>
        </div>

        <!-- 卡片主要内容区 -->
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title" :title="p.textName" @click="toProjectHandle(p, 'editor')">
              {{ p.textName }}
            </h3>
          </div>

          <!-- 状态呼吸灯与创建时间 -->
          <div class="card-meta-row">
            <div class="card-status" :class="{ 'status-active': p.status == 2 }">
              <span class="status-indicator" :style="{ backgroundColor: getFormStatusName(p.status).color }" />
              <span class="status-name" :style="{ color: getFormStatusName(p.status).color }">
                {{ getFormStatusName(p.status).statusName }}
              </span>
            </div>
            <span class="card-time">创建于 {{ p.createTime | formatDate }}</span>
          </div>
        </div>

        <!-- 动作操作栏 -->
        <div class="card-actions">
          <div class="action-left-btns">
            <el-button
              size="mini"
              class="action-btn primary-action"
              icon="el-icon-edit"
              @click="toProjectHandle(p, 'editor')"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              class="action-btn secondary-action"
              icon="el-icon-data-analysis"
              @click="toProjectHandle(p, 'data')"
            >
              数据
            </el-button>
          </div>

          <div class="action-right-more">
            <el-dropdown trigger="click" placement="bottom-end">
              <span class="more-trigger">
                <i class="el-icon-more" />
              </span>
              <el-dropdown-menu slot="dropdown" class="card-more-menu">
                <el-dropdown-item icon="el-icon-pie-chart" @click.native="toProjectHandle(p, 'statistics')">
                  统计分析
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="p.status == 2"
                  icon="el-icon-video-pause"
                  class="text-warning"
                  @click.native="stopProject(p.formKey)"
                >
                  停止收集
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="p.status != 2"
                  icon="el-icon-delete"
                  class="text-danger"
                  @click.native="deleteFrom(p.formKey)"
                >
                  删除表单
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
    <div v-if="projectList.length == 0" class="empty-view">
      <el-empty slot="empty" description="暂无项目，开始新建一个吧！" />
    </div>
  </div>
</template>

<script>
import mixin from './mixin'

export default {
  name: 'FormCardList',
  components: {},
  mixins: [mixin],
  props: {
    projectList: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 我的表单页还是协作页区分 默认为表单页 协作页某些内容不显示
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    getStatusColorStyle() {
      return function (code) {
        let color = this.projectStatusList.find((item) => item.code == code).color
        return {
          backgroundColor: color,
          borderColor: color
        }
      }
    },
    getFormStatusName() {
      return function (code) {
        let name = this.projectStatusList.find((item) => item.code == code).name
        let statusColor = this.projectStatusList.find((item) => item.code == code).color
        return {
          statusName: name,
          color: statusColor
        }
      }
    }
  },
  methods: {
    deleteFrom(key) {
      this.$confirm('此操作将删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.logicDeleteForm(key)
        })
        .catch(() => {})
    },
    endEvent(event) {
      console.log(event)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.project-card-container {
  margin: 10px auto 30px;
}

/* 自适应 Apple 响应式网格 */
.project-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
}

/* 单个卡片重构 */
.project-card-item {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #eaebee;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(31, 35, 41, 0.02);
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(0, 122, 255, 0.25);
    box-shadow: 0 20px 35px rgba(31, 35, 41, 0.08);

    .card-cover {
      .cover-pattern {
        transform: scale(1.05);
        opacity: 0.85;
      }
    }

    .card-title {
      color: #007aff;
    }
  }
}

/* 卡片封面饰图 */
.card-cover {
  height: 110px;
  background: linear-gradient(135deg, rgba(235, 243, 255, 0.8) 0%, rgba(244, 248, 255, 0.4) 100%);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-bottom: 1px solid #f1f2f5;

  .cover-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #006eff;
    opacity: 0.6;
    transition: all 0.5s ease;

    .pattern-svg {
      width: 70px;
      height: 70px;
    }
  }
}

/* 精致半透明表单类型 Badge */
.form-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.2px;
  backdrop-filter: blur(4px);

  /* 根据不同类型定制温润透亮色 */
  &.type-1 {
    /* 表单 */
    background-color: rgba(0, 110, 255, 0.08);
    color: #006eff;
  }

  &.type-2 {
    /* 流程 */
    background-color: rgba(255, 119, 15, 0.08);
    color: #ff770f;
  }

  &.type-4 {
    /* 考试 */
    background-color: rgba(89, 192, 117, 0.08);
    color: #4db368;
  }

  &.type-3 {
    /* 默认其他 */
    background-color: rgba(144, 147, 153, 0.08);
    color: #7f828a;
  }
}

/* 卡片内容体 */
.card-body {
  padding: 16px 18px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-title-row {
  margin-bottom: 12px;

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2329;
    margin: 0;
    line-height: 1.4;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.25s ease;

    &:hover {
      color: #006eff;
    }
  }
}

/* 呼吸灯状态与时间 */
.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-status {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }

    .status-name {
      font-size: 12px;
      font-weight: 500;
    }

    /* 收集中状态添加呼吸高光动效 */
    &.status-active {
      .status-indicator {
        animation: pulse 2s infinite;
      }
    }
  }

  .card-time {
    font-size: 12px;
    color: #8f959e;
  }
}

/* 动作操作栏 */
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background-color: #fcfdfe;
  border-top: 1px solid #f1f2f5;

  .action-left-btns {
    display: flex;
    gap: 8px;
    flex-grow: 1;

    .action-btn {
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      height: 30px;
      transition: all 0.25s ease;

      &.primary-action {
        background-color: rgba(0, 110, 255, 0.05);
        color: #006eff;
        border: 1px solid transparent;

        &:hover {
          background-color: #006eff;
          color: #ffffff;
        }
      }

      &.secondary-action {
        background-color: transparent;
        color: #646a73;
        border: 1px solid #eaebee;

        &:hover {
          background-color: #f1f2f5;
          color: #1f2329;
          border-color: #d1d5db;
        }
      }
    }
  }

  .action-right-more {
    .more-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      cursor: pointer;
      color: #8f959e;
      transition: all 0.25s ease;

      &:hover {
        background-color: #f1f2f5;
        color: #1f2329;
      }
    }
  }
}

/* 状态圆点呼吸灯动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

.empty-view {
  padding: 80px 0;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #eaebee;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style lang="scss">
/* 更多下拉菜单美化 */
.card-more-menu.el-dropdown-menu {
  border-radius: 10px !important;
  padding: 6px !important;
  box-shadow: 0 10px 25px rgba(31, 35, 41, 0.08) !important;
  border: 1px solid #eaebee !important;

  .el-dropdown-menu__item {
    font-size: 13px;
    font-weight: 500;
    color: #1f2329;
    padding: 8px 14px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;

    i {
      font-size: 14px;
      margin: 0;
    }

    &:hover {
      background-color: #f1f2f5 !important;
      color: #007aff !important;
    }

    &.text-warning {
      color: #e6a23c;
      &:hover {
        background-color: rgba(230, 162, 60, 0.08) !important;
        color: #e6a23c !important;
      }
    }

    &.text-danger {
      color: #f56c6c;
      &:hover {
        background-color: rgba(245, 108, 108, 0.08) !important;
        color: #f56c6c !important;
      }
    }
  }
}
</style>
