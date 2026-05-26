<template>
  <div class="project-table-view">
    <el-table
      :data="projectList"
      empty-text="暂无数据"
      highlight-current-row
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column align="left" min-width="250" label="项目名称" prop="name">
        <template slot-scope="scope">
          <div class="table-title-cell">
            <i class="el-icon-document title-icon" />
            <span class="title-text" :title="scope.row.textName">
              {{ scope.row.textName }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column align="center" width="120" label="状态">
        <template slot-scope="scope">
          <span v-if="scope.row.type == '3'" class="status-badge folder">文件夹</span>
          <span v-else>
            <span v-for="status in projectStatusList" :key="status.code">
              <span
                v-if="status.code == scope.row.status"
                class="status-badge"
                :style="{ backgroundColor: status.color + '12', color: status.color }"
              >
                <span class="status-dot" :style="{ backgroundColor: status.color }" />
                {{ status.name }}
              </span>
            </span>
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="类型" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.type == '3'" class="type-badge folder">文件夹</span>
          <span v-else>
            <span class="type-badge" :class="'type-' + scope.row.type">
              {{ getType(scope.row.type).name }}
            </span>
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
      <el-table-column align="center" label="更新时间" prop="updateTime" width="180" />

      <el-table-column width="200" align="center" label="操作">
        <template slot-scope="scope">
          <div class="table-actions">
            <el-button type="text" class="action-btn-text" @click="toProjectHandle(scope.row, 'editor')">
              <i class="el-icon-edit" />
              编辑
            </el-button>

            <el-button type="text" class="action-btn-text" @click="toProjectHandle(scope.row, 'statistics')">
              <i class="el-icon-data-analysis" />
              统计
            </el-button>

            <el-popconfirm
              v-if="scope.row.status == 2"
              title="确定停止收集该项目吗？"
              @confirm="stopProject(scope.row.formKey)"
            >
              <el-button slot="reference" class="action-btn-text warning-action" type="text">
                <i class="el-icon-video-pause" />
                停止
              </el-button>
            </el-popconfirm>

            <el-popconfirm
              v-if="scope.row.status != 2"
              title="确定删除该项目吗？"
              @confirm="logicDeleteForm(scope.row.formKey)"
            >
              <el-button slot="reference" class="action-btn-text danger-action" type="text">
                <i class="el-icon-delete" />
                删除
              </el-button>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import mixin from './mixin'

export default {
  name: 'MyFormTable',
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
      dialogVisible: false
    }
  },
  methods: {
    handleRowClick(row, column, event) {}
  }
}
</script>

<style lang="scss" scoped>
.project-table-view {
  margin-top: 10px;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #eaebee;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(31, 35, 41, 0.02);
}

::v-deep .el-table {
  background-color: transparent;

  &::before {
    display: none;
  }

  tr {
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.25s ease;

    &:hover > td {
      background-color: #f7f9fc !important;
    }
  }

  th {
    background-color: #fcfdfe !important;
    color: #1f2329;
    font-weight: 700;
    font-size: 13px;
    border-bottom: 1px solid #eaebee;
    padding: 14px 0;
  }

  td {
    border-bottom: 1px solid #f1f2f5;
    color: #1f2329;
    font-size: 13px;
    padding: 14px 0;
  }
}

/* 单元格美化 */
.table-title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 10px;

  .title-icon {
    font-size: 16px;
    color: #006eff;
    background-color: rgba(0, 110, 255, 0.08);
    padding: 6px;
    border-radius: 8px;
  }

  .title-text {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 320px;
  }
}

/* 状态徽标 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.folder {
    background-color: rgba(144, 147, 153, 0.08);
    color: #7f828a;
  }
}

/* 类型徽标 */
.type-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;

  &.type-1 {
    background-color: rgba(0, 110, 255, 0.08);
    color: #006eff;
  }

  &.type-2 {
    background-color: rgba(255, 119, 15, 0.08);
    color: #ff770f;
  }

  &.type-4 {
    background-color: rgba(89, 192, 117, 0.08);
    color: #4db368;
  }

  &.folder {
    background-color: rgba(144, 147, 153, 0.08);
    color: #7f828a;
  }
}

/* 操作动作 */
.table-actions {
  display: flex;
  justify-content: center;
  gap: 12px;

  .action-btn-text {
    font-size: 13px;
    font-weight: 600;
    color: #646a73;
    padding: 0;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 14px;
    }

    &:hover {
      color: #006eff;
    }

    &.warning-action:hover {
      color: #ff770f;
    }

    &.danger-action:hover {
      color: #f56c6c;
    }
  }
}
</style>
