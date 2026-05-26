<template>
  <div class="app-container">
    <div class="table-card">
      <div class="action-bar-wrapper">
        <el-row :gutter="10" class="mb8 action-bar">
          <el-col :span="1.5">
            <el-button icon="el-icon-plus" type="primary" class="modern-btn" @click="handleAdd"> 新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              :disabled="single"
              icon="el-icon-edit"
              type="success"
              class="modern-btn success"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              :disabled="multiple"
              icon="el-icon-delete"
              type="danger"
              class="modern-btn danger"
              @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>
        </el-row>
      </div>

      <el-table
        v-loading="loading"
        :data="categoryList"
        class="modern-table mt10"
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="Id" prop="id" width="80" />
        <el-table-column align="center" label="分类名称" prop="name" />
        <el-table-column align="center" label="排序" prop="sort" />
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="190">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="text" class="action-btn" @click="handleUpdate(scope.row)">
              修改
            </el-button>
            <el-button icon="el-icon-delete" type="text" class="action-btn delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加或修改单主题分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body width="500px" custom-class="modern-dialog">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="modern-dialog-form">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" class="modern-input" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" class="modern-input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="modern-btn plain" @click="cancel"> 取 消</el-button>
        <el-button type="primary" class="modern-btn" @click="submitForm"> 确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addCategory, delCategory, getCategory, listCategory, updateCategory } from '@/api/project/theme'

export default {
  name: 'ThemeCategory',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 单主题分类表格数据
      categoryList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: null,
        sort: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [{ required: true, message: '主题名称不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询单主题分类列表 */
    getList() {
      this.loading = true
      listCategory(this.queryParams).then((response) => {
        this.categoryList = response.data
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        sort: null,
        createTime: null,
        updateTime: null
      }
      this.resetForm('form')
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加表单主题分类'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getCategory(id).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改表单主题分类'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateCategory(this.form).then((response) => {
              this.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addCategory(this.form).then((response) => {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除表单主题分类编号为"' + ids + '"的数据项？')
        .then(function () {
          return delCategory(ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  padding: 24px;
  min-height: calc(100vh - 84px);
  overflow-y: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  .table-card {
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
    }

    .action-bar-wrapper {
      margin-bottom: 20px;

      .action-bar {
        margin: 0 !important;
      }
    }

    .modern-table {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;

      ::v-deep th {
        background-color: #f8fafc;
        color: #64748b;
        font-weight: 600;
        font-size: 14px;
        padding: 12px 0;
        border-bottom: 1px solid #e2e8f0;
      }

      ::v-deep td {
        padding: 14px 0;
        font-size: 14px;
        color: #334155;
        border-bottom: 1px solid #f1f5f9;
        transition: background-color 0.2s ease;
      }

      ::v-deep tr:hover td {
        background-color: #f8fafc;
      }

      .action-btn {
        font-weight: 500;
        padding: 6px 12px;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          background-color: #eff6ff;
        }

        &.delete {
          color: #ef4444;
          &:hover {
            background-color: #fef2f2;
          }
        }
      }
    }

    .pagination-wrapper {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .modern-btn {
    border-radius: 8px;
    font-weight: 500;
    padding: 9px 20px;
    transition: all 0.2s;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.el-button--primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

      &:hover {
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
      }

      &:active {
        transform: translateY(1px);
      }
    }

    &.success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

      &:hover {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        transform: translateY(-1px);
      }
    }

    &.danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

      &:hover {
        background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
        transform: translateY(-1px);
      }
    }

    &.plain {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;

      &:hover {
        background: #e2e8f0;
        color: #1e293b;
      }
    }

    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }

  .modern-input {
    ::v-deep .el-input__inner {
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      padding: 0 16px;
      height: 36px;
      line-height: 36px;
      transition: all 0.2s ease;

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }
}
</style>

<style lang="scss">
.modern-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);

  .el-dialog__header {
    background-color: #f8fafc;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;

    .el-dialog__title {
      font-weight: 600;
      color: #1e293b;
      font-size: 16px;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 24px;

      .el-dialog__close {
        color: #94a3b8;
        font-size: 18px;
        transition: color 0.2s;

        &:hover {
          color: #ef4444;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 30px 24px;

    .modern-dialog-form {
      .el-form-item__label {
        font-weight: 500;
        color: #475569;
      }

      .modern-input {
        .el-input__inner {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 0 16px;
          height: 40px;
          line-height: 40px;
          transition: all 0.2s ease;

          &:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
    background-color: #fafafa;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        margin: 0;
      }
    }
  }
}
</style>
