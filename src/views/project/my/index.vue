<template>
  <div class="app-container">
    <div class="form-container">
      <!-- 苹果级现代 SaaS 页面标题区域 -->
      <div class="project-header">
        <div class="header-left">
          <h1 class="page-title">我的项目</h1>
          <p class="page-subtitle">共 {{ total || 0 }} 个收集项目，实时数据随时掌握</p>
        </div>
        <div class="header-right">
          <el-button class="ai-create-btn" type="primary" @click="$refs.chatFormDialog.open()">
            <i class="el-icon-magic-stick ai-icon"></i>
            AI 智能建表
          </el-button>
          <el-button class="create-btn" type="primary" icon="el-icon-plus" @click="createFormVisible = true">
            新建表单
          </el-button>
        </div>
      </div>

      <!-- 精致悬浮一体化控制栏 (Toolbar) -->
      <div class="filter-view">
        <div class="toolbar-left">
          <!-- 药丸状状态筛选器 -->
          <div class="pill-group">
            <div
              v-for="status in projectStatusList"
              :key="status.code"
              class="pill-item"
              :class="{ active: queryParams.status === status.code }"
              @click="handleStatusChange(status.code)"
            >
              <span class="pill-dot" :style="{ backgroundColor: status.color }" />
              {{ status.name }}
            </div>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- 搜索框 -->
          <el-input
            v-model="queryParams.name"
            placeholder="搜索项目名称..."
            class="search-input"
            prefix-icon="el-icon-search"
            clearable
            @keyup.enter.native="queryProjectPage"
            @clear="queryProjectPage"
          />

          <!-- 极润时间选择悬浮面板 -->
          <el-popover placement="bottom-end" width="360" trigger="click" popper-class="date-filter-popover">
            <div class="date-filter-panel">
              <div class="panel-title">按更新时间筛选</div>
              <div class="date-picker-wrap">
                <el-date-picker
                  v-model="queryParams.beginDateTime"
                  placeholder="开始时间"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  size="small"
                  style="width: 100%"
                />
                <div class="date-to">至</div>
                <el-date-picker
                  v-model="queryParams.endDateTime"
                  :default-time="'23:59:59'"
                  placeholder="结束时间"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  size="small"
                  style="width: 100%"
                />
              </div>
              <div class="panel-actions">
                <el-button size="mini" class="reset-btn" @click="clearDateFilter">重置</el-button>
                <el-button size="mini" type="primary" class="apply-btn" @click="applyDateFilter">确定</el-button>
              </div>
            </div>
            <el-button
              slot="reference"
              icon="el-icon-date"
              class="date-btn"
              :class="{ active: queryParams.beginDateTime || queryParams.endDateTime }"
            >
              时间筛选
            </el-button>
          </el-popover>

          <!-- 模式切换 -->
          <div class="view-switch">
            <button
              class="switch-btn"
              :class="{ active: dataShowType == 'card' }"
              title="卡片视图"
              @click="dataShowType = 'card'"
            >
              <i class="el-icon-menu" />
            </button>
            <button
              class="switch-btn"
              :class="{ active: dataShowType == 'table' }"
              title="列表视图"
              @click="dataShowType = 'table'"
            >
              <i class="el-icon-tickets" />
            </button>
          </div>
        </div>
      </div>

      <!-- 数据内容区 -->
      <div class="content-view">
        <form-card-list
          v-if="dataShowType == 'card'"
          v-loading="projectListLoading"
          :project-list.sync="projectList"
          @refresh="queryProjectPage"
        />
        <my-form-table
          v-if="dataShowType == 'table'"
          v-loading="projectListLoading"
          :project-list.sync="projectList"
          @refresh="queryProjectPage"
        />
      </div>

      <!-- 分页组件 -->
      <div class="project-page-view">
        <el-pagination
          v-if="total > 0"
          :current-page.sync="queryParams.current"
          :page-size.sync="queryParams.size"
          :page-sizes="pageSizes"
          :total="total"
          background
          :layout="paginationLayout"
          @size-change="handleSizeChange"
          @current-change="queryProjectPage"
        />
      </div>
    </div>

    <!-- 苹果毛玻璃质感创建弹窗 -->
    <el-dialog
      custom-class="create-form-dialog"
      :visible.sync="createFormVisible"
      title="新建收集表单"
      width="460px"
      append-to-body
    >
      <div class="dialog-body">
        <el-form ref="createForm" :model="formData" label-position="top">
          <el-form-item :rules="[{ required: true, message: '名称不能为空' }]" label="表单名称" prop="name">
            <el-input v-model="formData.name" placeholder="例如：用户满意度调研问卷..." autocomplete="off" />
          </el-form-item>
          <el-form-item label="描述信息" prop="description">
            <el-input
              v-model="formData.description"
              :rows="3"
              placeholder="添加表单的补充说明（可选）"
              autocomplete="off"
              type="textarea"
            />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel-btn" @click="createFormVisible = false">取 消</el-button>
        <el-button type="primary" class="confirm-btn" :loading="requestLoading.pushFormData" @click="createFormHandle"
          >创 建</el-button
        >
      </span>
    </el-dialog>
    <!-- AI智能创建表单弹窗 -->
    <chat-form-dialog ref="chatFormDialog" />
  </div>
</template>
<script>
import { createFormRequest, getUserFormFolderTreeRequest, pageFormRequest, updateFormRequest } from '@/api/project/form'
import FormCardList from './card'
import mixin from './mixin'
import MyFormTable from './table'
import ChatFormDialog from '@/views/ai/form/ChatFormDialog.vue'

export default {
  name: 'MyProject',
  components: {
    MyFormTable,
    FormCardList,
    ChatFormDialog
  },
  mixins: [mixin],
  data() {
    return {
      isMobile: false,
      initializedSize: false,
      pageSizes: [12, 24, 36, 48],
      createFormVisible: null,
      dataShowType: 'card',
      total: 0,
      queryParams: {
        current: 1,
        size: 12,
        name: '',
        beginDateTime: null,
        endDateTime: null,
        status: null,
        folderId: 0
      },
      formData: {
        description: '',
        name: '未命名问卷',
        type: 0
      },
      projectList: [],
      projectListLoading: true,
      pageCurrent: '',
      requestLoading: {
        // 请求加载中状态
        pushFormData: false,
        pushFolderData: false
      }
    }
  },
  computed: {
    paginationLayout() {
      return this.isMobile ? 'sizes, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
    }
  },
  created() {
    this.isMobile = window.innerWidth < 768
    this.queryParams.current = 1
  },
  mounted() {
    this.initResizeObserver()
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
  },
  methods: {
    initResizeObserver() {
      let timer = null
      const container = this.$el.querySelector('.form-container')
      if (container && window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver((entries) => {
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            for (let entry of entries) {
              const containerWidth = entry.contentRect.width
              this.updatePageSizeByWidth(containerWidth)
            }
          }, 200)
        })
        this.resizeObserver.observe(container)
      } else {
        this.checkScreenSize()
        this.resizeHandler = () => {
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            this.checkScreenSize()
          }, 200)
        }
        window.addEventListener('resize', this.resizeHandler)
      }
    },
    updatePageSizeByWidth(containerWidth) {
      this.isMobile = window.innerWidth < 768
      // 卡片最小宽度 280px，间距 24px
      // n * 280 + (n - 1) * 24 <= containerWidth
      // 304 * n - 24 <= containerWidth
      let cols = Math.floor((containerWidth + 24) / 304)
      if (cols < 1) cols = 1

      // 动态计算，固定 3 行
      const newSize = cols * 3

      if (this.queryParams.size !== newSize) {
        this.queryParams.size = newSize
        this.pageSizes = [newSize, newSize * 2, newSize * 3, newSize * 4]

        if (this.initializedSize) {
          this.queryParams.current = 1
          this.queryProjectPage()
        } else {
          this.initializedSize = true
          this.queryProjectPage()
        }
      } else if (!this.initializedSize) {
        this.initializedSize = true
        this.queryProjectPage()
      }
    },
    checkScreenSize() {
      const container = this.$el.querySelector('.form-container')
      if (container) {
        this.updatePageSizeByWidth(container.clientWidth)
      } else {
        this.updatePageSizeByWidth(window.innerWidth - 48) // fallback
      }
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.queryProjectPage()
    },
    createFormHandle() {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          // 默认创建到当前打开文件夹
          this.formData.folderId = this.queryParams.folderId || 0
          this.requestLoading.pushFormData = true
          // 给默认输入的标题加粗
          createFormRequest({
            ...this.formData,
            name: `<h2 style="text-align: center;">${this.formData.name}</h2>`
          })
            .then((res) => {
              this.toProjectHandle(res.data, 'editor')
              this.requestLoading.pushFormData = false
            })
            .catch(() => {
              this.requestLoading.pushFormData = false
            })
        } else {
          return false
        }
      })
    },
    queryProjectPage() {
      pageFormRequest(this.queryParams).then((res) => {
        let { records, total, size } = res.data
        this.projectList = records
        this.total = total
        this.queryParams.size = size
        this.projectListLoading = false
      })
    },
    handleStatusChange(statusCode) {
      this.queryParams.status = statusCode
      this.queryParams.current = 1
      this.queryProjectPage()
    },
    clearDateFilter() {
      this.queryParams.beginDateTime = null
      this.queryParams.endDateTime = null
      this.queryProjectPage()
    },
    applyDateFilter() {
      this.queryParams.current = 1
      this.queryProjectPage()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.app-container {
  width: 100%;
  box-sizing: border-box;
  padding: 38px;
}

.form-container {
  width: 100%;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2329;
    margin: 0 0 6px 0;
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    font-size: 13px;
    color: #646a73;
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ai-create-btn {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
    background-size: 200% auto;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 14px;
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.35);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: all 0.6s ease;
    }

    .ai-icon {
      font-size: 16px;
      font-weight: 700;
      animation: ai-pulse 2s infinite ease-in-out;
    }

    &:hover {
      background-position: right center;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5), 0 0 10px rgba(236, 72, 153, 0.2);
      color: #ffffff;

      &::before {
        left: 100%;
      }

      .ai-icon {
        transform: rotate(15deg) scale(1.1);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }

  .create-btn {
    background-color: #006eff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 110, 255, 0.15);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      background-color: #1a7eff;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 110, 255, 0.25);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@keyframes ai-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.15) rotate(-5deg);
  }
}

/* 悬浮控制栏 Toolbar */
.filter-view {
  background: #ffffff;
  border: 1px solid #eaebee;
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(31, 35, 41, 0.02);
}

/* 药丸状态组 */
.pill-group {
  display: flex;
  background-color: #f1f2f5;
  padding: 3px;
  border-radius: 8px;
}

.pill-item {
  display: flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #646a73;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  .pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    opacity: 0.65;
    transition: all 0.25s ease;
  }

  &:hover {
    color: #1f2329;
    .pill-dot {
      opacity: 1;
    }
  }

  &.active {
    background-color: #ffffff;
    color: #006eff;
    box-shadow: 0 2px 6px rgba(31, 35, 41, 0.08);
    font-weight: 600;

    .pill-dot {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

/* Toolbar 右侧 */
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;

  /* 搜索框美化 */
  .search-input {
    width: 220px;

    ::v-deep .el-input__inner {
      background-color: #f1f2f5;
      border: 1px solid transparent;
      border-radius: 8px;
      padding-left: 32px;
      font-size: 13px;
      height: 34px;
      line-height: 34px;
      color: #1f2329;
      transition: all 0.25s ease;

      &:focus {
        background-color: #ffffff;
        border-color: rgba(0, 110, 255, 0.3);
        box-shadow: 0 0 0 3px rgba(0, 110, 255, 0.08);
      }

      &::placeholder {
        color: #8f959e;
      }
    }

    ::v-deep .el-input__prefix {
      left: 8px;
      color: #8f959e;
      font-size: 13px;
      line-height: 36px;
    }
  }

  /* 时间筛选按钮 */
  .date-btn {
    background-color: #f1f2f5;
    border: 1px solid transparent;
    color: #646a73;
    border-radius: 8px;
    padding: 0 14px;
    height: 34px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.25s ease;

    &:hover {
      background-color: #e8ebf0;
      color: #1f2329;
    }

    &.active {
      background-color: rgba(0, 110, 255, 0.08);
      border-color: rgba(0, 110, 255, 0.15);
      color: #006eff;
    }
  }

  /* 视图切换按钮 */
  .view-switch {
    display: flex;
    background-color: #f1f2f5;
    padding: 3px;
    border-radius: 8px;

    .switch-btn {
      border: none;
      background: none;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #646a73;
      font-size: 14px;
      transition: all 0.25s ease;

      &:hover {
        color: #1f2329;
      }

      &.active {
        background-color: #ffffff;
        color: #006eff;
        box-shadow: 0 2px 4px rgba(31, 35, 41, 0.06);
      }
    }
  }
}

/* 分页 */
.project-page-view {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}
</style>

<style lang="scss">
/* 极高雅时间过滤悬浮面板 */
.date-filter-popover {
  border-radius: 12px !important;
  padding: 16px !important;
  box-shadow: 0 8px 24px rgba(31, 35, 41, 0.08) !important;
  border: 1px solid #eaebee !important;

  .date-filter-panel {
    .panel-title {
      font-size: 13px;
      font-weight: 700;
      color: #1f2329;
      margin-bottom: 10px;
    }

    .date-picker-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .date-to {
        text-align: center;
        font-size: 11px;
        color: #8f959e;
        margin: 2px 0;
      }
    }

    .panel-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
      border-top: 1px solid #f1f2f5;
      padding-top: 10px;

      .reset-btn {
        border-radius: 4px;
        border: 1px solid #e8e8e8;
      }

      .apply-btn {
        border-radius: 4px;
        background: #006eff;
        border: none;

        &:hover {
          background: #1a7eff;
        }
      }
    }
  }
}

/* 弹框重构 */
.create-form-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12) !important;

  .el-dialog__header {
    padding: 20px 20px 12px;
    background-color: #ffffff;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 700;
      color: #1f2329;
    }
    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      font-size: 14px;
    }
  }

  .el-dialog__body {
    padding: 0 20px 16px;
  }

  .el-dialog__footer {
    padding: 12px 20px 20px;
    background-color: #f7f9fc;
    border-top: 1px solid #f1f2f5;
  }

  .el-form-item__label {
    font-size: 13px;
    font-weight: 600;
    color: #1f2329;
    padding-bottom: 4px;
  }

  .el-input__inner,
  .el-textarea__inner {
    background-color: #f1f2f5;
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.25s ease;

    &:focus {
      background-color: #ffffff;
      border-color: rgba(0, 110, 255, 0.3);
      box-shadow: 0 0 0 3px rgba(0, 110, 255, 0.08);
    }
  }

  .cancel-btn {
    border-radius: 6px;
    font-weight: 500;
    border: 1px solid #e8e8e8;
  }

  .confirm-btn {
    border-radius: 6px;
    font-weight: 600;
    background: #006eff;
    border: none;
    box-shadow: 0 4px 10px rgba(0, 110, 255, 0.12);

    &:hover {
      background: #1a7eff;
      box-shadow: 0 6px 12px rgba(0, 110, 255, 0.2);
    }
  }
}
</style>
