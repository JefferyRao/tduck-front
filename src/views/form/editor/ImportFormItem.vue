<template>
  <el-dialog
    title="导入题目"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    append-to-body
    width="70%"
    :class="fullscreen ? 't-dialog--fullscreen' : 't-dialog'"
    :fullscreen="fullscreen"
  >
    <div slot="title" class="t__dialog__header">
      <span class="el-dialog__title">导入题目</span>
      <div class="t__dialog__menu">
        <i
          :class="fullscreen ? 'el-icon-news' : 'el-icon-full-screen'"
          class="el-dialog__close"
          @click="fullscreen = !fullscreen"
        />
      </div>
    </div>

    <el-tabs v-model="activeName">
      <el-tab-pane label="文本导入" name="textImport">
        <div class="import-toolbar">
          <el-upload
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="onUploadSuccess"
            :on-error="onUploadError"
            accept=".pdf,.docx,.md,.txt"
          >
            <el-button size="small" icon="el-icon-upload2" :loading="uploading">
              {{ uploading ? '解析中...' : '上传文档' }}
            </el-button>
          </el-upload>
          <el-button
            size="small"
            icon="el-icon-magic-stick"
            :loading="optimizing"
            :disabled="!content.trim()"
            @click="handleAiOptimize"
          >
            {{ optimizing ? '优化中...' : 'AI 优化' }}
          </el-button>
          <el-button size="small" icon="el-icon-delete" @click="content = ''">
            清空
          </el-button>
          <div v-if="statusText" class="import-status">
            <i :class="statusIcon" /> {{ statusText }}
          </div>
        </div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-input
              v-model="content"
              type="textarea"
              :autosize="{ minRows: 20, maxRows: 20 }"
              placeholder="请将准备好的内容按格式粘贴到这里，或上传文档自动解析"
              @change="handleSplitContent"
            />
          </el-col>
          <el-col :span="12">
            <el-scrollbar class="preview-scrollbar">
              <div v-if="previewFields.length" class="preview-list">
                <div v-for="(field, index) in previewFields" :key="index" class="preview-item">
                  <div class="preview-item-type">{{ field.typeName }}</div>
                  <div class="preview-item-label">{{ field.label }}{{ field.required ? ' [必填]' : '' }}</div>
                  <div v-if="field.options && field.options.length" class="preview-item-options">
                    <div v-for="(opt, oi) in field.options" :key="oi" class="preview-option">{{ opt.label }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="preview-empty">
                <i class="el-icon-document" />
                <p>预览区域</p>
                <p class="preview-hint">在左侧输入内容后，这里会显示解析预览</p>
              </div>
            </el-scrollbar>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="导入帮助" name="importHelp">
        <div class="help-content">
          <h4>支持的格式</h4>
          <p>每道题使用以下格式：</p>
          <pre>类型。题目标题
选项1
选项2
选项3</pre>
          <h4>支持的题型</h4>
          <ul>
            <li><b>单行文本</b> - 短文本输入</li>
            <li><b>多行文本</b> - 长文本输入</li>
            <li><b>数字</b> - 数字输入</li>
            <li><b>单选</b> - 单选题（需提供选项）</li>
            <li><b>多选</b> - 多选题（需提供选项）</li>
            <li><b>下拉</b> - 下拉选择（需提供选项）</li>
            <li><b>日期</b> - 日期选择</li>
            <li><b>文字描述</b> - 纯文字说明</li>
          </ul>
          <h4>示例</h4>
          <pre>单行文本。您的姓名
单选。您的性别
男
女
多选。您的兴趣爱好
阅读
运动
音乐
旅行
数字。您的年龄
日期。您的出生日期</pre>
          <h4>文档上传</h4>
          <p>支持上传 PDF、Word (.docx)、Markdown (.md)、纯文本 (.txt) 文件，系统会自动解析文档内容。</p>
          <h4>AI 优化</h4>
          <p>点击"AI 优化"按钮，AI 会自动优化问卷的格式和科学性，包括题目措辞、选项设计、逻辑顺序等。</p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" :loading="importing" @click="handleImport">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getToken } from '@/utils/auth'
import { parseDocument, aiOptimizeRequest } from '@/api/project/import'
import { batchCreateProjectItem } from '@/api/project/form'

export default {
  name: 'ImportFormItem',
  props: {
    formKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeName: 'textImport',
      content: '',
      dialogVisible: false,
      fullscreen: false,
      previewFields: [],
      uploading: false,
      optimizing: false,
      importing: false,
      statusText: '',
      statusIcon: ''
    }
  },
  computed: {
    uploadUrl() {
      return process.env.VUE_APP_API_ROOT + '/user/form/import/parse-doc'
    },
    uploadHeaders() {
      return { token: getToken() }
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },

    handleSplitContent() {
      const lines = this.content.split('\n').filter(l => l.trim())
      const fields = []
      let currentField = null

      const typeMap = {
        '单行文本': 'INPUT',
        '多行文本': 'TEXTAREA',
        '数字': 'NUMBER',
        '单选': 'RADIO',
        '多选': 'CHECKBOX',
        '下拉': 'SELECT',
        '日期': 'DATE',
        '文字描述': 'DESC_TEXT'
      }

      for (const line of lines) {
        const match = line.match(/^(单行文本|多行文本|数字|单选|多选|下拉|日期|文字描述)[。.](.+)/)
        if (match) {
          if (currentField) {
            fields.push(currentField)
          }
          currentField = {
            type: typeMap[match[1]] || 'INPUT',
            typeName: match[1],
            label: match[2].replace(/\[必填\]/, '').trim(),
            required: match[2].includes('[必填]'),
            options: []
          }
        } else if (currentField) {
          currentField.options.push({ label: line.trim(), value: line.trim() })
        }
      }
      if (currentField) {
        fields.push(currentField)
      }

      this.previewFields = fields
    },

    beforeUpload(file) {
      const allowedExts = ['.pdf', '.docx', '.md', '.txt']
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

      if (!allowedExts.includes(ext)) {
        this.$message.error('仅支持 PDF/Word/Markdown/文本文件')
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        this.$message.error('文件大小不能超过 10MB')
        return false
      }

      this.uploading = true
      this.statusText = '正在解析文档...'
      this.statusIcon = 'el-icon-loading'
      return true
    },

    onUploadSuccess(response) {
      this.uploading = false
      if (response.code === 200 && response.data) {
        this.content = response.data
        this.handleSplitContent()
        this.statusText = '文档解析完成'
        this.statusIcon = 'el-icon-success'
        this.$message.success('文档解析成功')
      } else {
        this.statusText = '解析失败: ' + (response.msg || '未知错误')
        this.statusIcon = 'el-icon-error'
        this.$message.error(response.msg || '文档解析失败')
      }
    },

    onUploadError() {
      this.uploading = false
      this.statusText = '上传失败'
      this.statusIcon = 'el-icon-error'
      this.$message.error('文档上传失败，请重试')
    },

    async handleAiOptimize() {
      if (!this.content.trim()) {
        this.$message.warning('请先输入或上传问卷内容')
        return
      }

      this.optimizing = true
      this.statusText = 'AI 正在优化问卷...'
      this.statusIcon = 'el-icon-loading'

      try {
        const res = await aiOptimizeRequest({
          content: this.content,
          formKey: this.formKey
        })
        if (res.code === 200 && res.data) {
          this.content = res.data
          this.handleSplitContent()
          this.statusText = 'AI 优化完成'
          this.statusIcon = 'el-icon-success'
          this.$message.success('问卷优化完成')
        } else {
          this.statusText = '优化失败: ' + (res.msg || '未知错误')
          this.statusIcon = 'el-icon-error'
          this.$message.error(res.msg || 'AI 优化失败')
        }
      } catch (e) {
        this.statusText = '优化失败'
        this.statusIcon = 'el-icon-error'
        this.$message.error('AI 服务响应异常，请稍后重试')
      } finally {
        this.optimizing = false
      }
    },

    async handleImport() {
      if (!this.previewFields.length) {
        this.$message.warning('请先输入或上传问卷内容')
        return
      }

      this.importing = true

      const items = this.previewFields.map((f, i) => ({
        type: f.type,
        formItemId: f.type.toLowerCase() + '-' + Date.now() + '-' + i,
        label: f.label,
        required: f.required,
        formKey: this.formKey,
        scheme: {
          typeId: f.type,
          config: {
            formId: f.type.toLowerCase() + '-' + Date.now() + '-' + i,
            label: f.label,
            required: f.required,
            options: f.options.length > 0 ? f.options : undefined
          },
          vModel: f.type.toLowerCase() + '-' + Date.now() + '-' + i
        }
      }))

      try {
        await batchCreateProjectItem(items)
        this.$message.success('导入成功')
        this.$emit('success')
        this.dialogVisible = false
      } catch (e) {
        this.$message.error('导入失败，请重试')
      } finally {
        this.importing = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.import-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.import-status {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
}

.preview-scrollbar {
  height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
}

.preview-list {
  .preview-item {
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .preview-item-type {
    display: inline-block;
    background: #ecf5ff;
    color: #409eff;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
    margin-right: 8px;
  }

  .preview-item-label {
    display: inline;
    font-size: 14px;
    color: #303133;
  }

  .preview-item-options {
    margin-top: 4px;
    padding-left: 16px;

    .preview-option {
      font-size: 13px;
      color: #606266;
      margin: 2px 0;
    }
  }
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #c0c4cc;

  i {
    font-size: 48px;
    margin-bottom: 12px;
  }

  p {
    margin: 4px 0;
  }

  .preview-hint {
    font-size: 12px;
  }
}

.help-content {
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;

  h4 {
    margin: 16px 0 8px;
    color: #303133;
  }

  pre {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
  }

  ul {
    padding-left: 20px;

    li {
      margin: 4px 0;
    }
  }
}

.t__dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.t__dialog__menu {
  i {
    cursor: pointer;
    font-size: 16px;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
