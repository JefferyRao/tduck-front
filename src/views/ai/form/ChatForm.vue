<template>
  <div class="chat-form-container">
    <!-- 左侧：AI 控制面板 (40% 占比，支持局部滚动) -->
    <div class="control-section">
      <!-- 固定头部 -->
      <div class="fixed-top">
        <div class="section-title-box">
          <h2>AI 智能构建表单</h2>
        </div>

        <!-- 操作面板 -->
        <div class="input-card">
          <div class="field-label">
            <i class="el-icon-chat-dot-round"></i>
            输入提示词
          </div>
          <el-input
            v-model="promptText"
            :rows="8"
            placeholder="例如：写一份关于远程办公体验的调查问卷，关注工作效率、沟通方式等"
            class="custom-textarea"
            resize="none"
            type="textarea"
          />

          <div class="model-row">
            <div class="model-info"></div>
            <span class="word-indicator">{{ promptText.length }} 字</span>
          </div>

          <el-button
            :disabled="isConnected || !promptText.trim()"
            :loading="isConnected"
            class="ai-generate-btn"
            type="primary"
            @click="generateSurvey"
          >
            <i v-if="!isConnected" class="el-icon-magic-stick mr10"></i>
            {{ isConnected ? 'AI 正在输出内容...' : '开始生成' }}
          </el-button>
        </div>
      </div>

      <!-- 可滚动的使用指南与示例 -->
      <div class="scrollable-content">
        <div class="guide-card">
          <h4>
            <i class="el-icon-info"></i>
            使用指南
          </h4>
          <ol>
            <li>1. 在提示词框中输入您的具体需求（如：关于大学生日常学习习惯的调查问卷）。</li>
            <li>2. 点击“开始生成”按钮，AI 将实时为您构建表单并生成预览。</li>
            <li>3. 检查生成内容，确认无误后点击“保存表单”存入您的项目。</li>
          </ol>
          <div class="examples">
            <div
              v-for="(example, index) in examples"
              :key="index"
              class="example-item"
              @click="fillPrompt(example.content)"
            >
              <div class="example-content">
                {{ example.content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：实时预览区 -->
    <div class="preview-section">
      <div class="preview-toolbar">
        <div class="toolbar-left">
          <span :class="{ 'is-active': isConnected }" class="status-dot"></span>
          <span class="status-text">{{ isConnected ? 'AI 正在输出内容...' : '预览已就绪' }}</span>
        </div>
        <div class="toolbar-right">
          <el-button :disabled="!fields.length" class="save-form-btn" type="primary" @click="saveForm">
            <i class="el-icon-circle-check mr5"></i>
            保存表单
          </el-button>
          <el-divider direction="vertical" />
          <!-- 新增关闭按钮 -->
          <el-button class="close-toolbar-btn" @click="$emit('close')"> 关闭 </el-button>
        </div>
      </div>

      <div id="survey-content" class="preview-canvas">
        <!-- 当有内容时显示手机模型 -->
        <div v-if="fields.length" class="phone-mockup">
          <div class="mockup-content">
            <FormPreview :fields="fields" :form-info="formInfo" />
          </div>
        </div>

        <!-- 缺省状态：全屏绝对居中 -->
        <div v-else class="empty-preview">
          <div v-if="!isConnected" class="waiting-box">
            <p>请输入您的需求，点击开始生成表单</p>
          </div>
          <div v-else class="generating-box">
            <div class="ai-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>AI 正在为您构建表单...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJsonToFields } from './convertToFields.js'
import FormPreview from './FormPreview.vue'
import _, { throttle } from 'lodash'
import { jsonrepair } from 'jsonrepair'
import { createFormRequest, batchCreateProjectItem } from '@/api/project/form'
import { getToken } from '@/utils/auth'

function removeHtmlTag(str) {
  if (!str) return ''
  return str
    .replace(/<formvariable[^<]*<\/formvariable>/g, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, '')
}

function formItemConvertData(item, formKey) {
  const data = {
    type: item.typeId,
    formItemId: item.config.formId,
    label: item.config.label,
    // 转换字符串 防止报错
    defaultValue: _.isObject(item.config.defaultValue)
      ? JSON.stringify(item.config.defaultValue)
      : item.config.defaultValue,
    required: item.config.required,
    placeholder: removeHtmlTag(item.placeholder),
    regList: item.config.regList,
    showLabel: item.config.showLabel,
    span: item.config.span,
    displayType: item.config.displayType,
    hideType: item.config.hideType,
    scheme: item,
    formKey
  }
  return data
}

export default {
  name: 'ChatForm',
  components: {
    FormPreview
  },
  data() {
    return {
      promptText: '',
      selectedModel: 'deepseek-chat',
      fields: [],
      formInfo: { title: '', description: '', type: 1 },
      isConnected: false,
      finalAnswer: '',
      isInThinkTag: false,
      eventSource: null,
      examples: [
        { content: '写一份关于远程办公体验的调查问卷，共 5 个问题，关注工作效率、沟通方式、居家环境等。' },
        {
          content:
            '请生成一份针对大学生日常学习习惯的调查问卷，包含 10 个问题，涵盖学习时间安排、学习方法使用、学习环境选择等方面，问题类型包括单选和多选。'
        },
        {
          content:
            '需要一份关于职场人士工作压力的调查问卷，包含 5 个问题，主要调查工作强度、加班频率、压力来源、压力应对方式等内容。'
        },
        {
          content:
            '创建一份关于消费者网购行为的调查问卷，包含 5 个问题，调查网购频率、选择平台考虑因素、支付方式偏好等方面。'
        },
        { content: '创建一份关于消费者对健康食品认知的调查问卷，共 10 个问题，关注购买习惯、标签认知、品牌信任等。' }
      ]
    }
  },
  watch: {
    finalAnswer(newVal) {
      console.log(newVal)
      this.handleFinalAnswerChange(newVal)
    }
  },
  beforeDestroy() {
    this.disconnect()
  },
  methods: {
    fillPrompt(content) {
      this.promptText = content
    },
    async generateSurvey() {
      if (!this.promptText.trim()) {
        console.warn('输入为空，拦截生成')
        return
      }

      if (this.fields.length > 0) {
        try {
          await this.$confirm('确认重新生成？重新生成将覆盖当前预览内容', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        } catch (e) {
          console.log('用户取消了重新生成')
          return
        }
      }

      this.openSendUserMsg(this.promptText, this.selectedModel)
    },
    openSendUserMsg(msg, model) {
      this.disconnect()
      this.finalAnswer = ''
      this.isInThinkTag = false

      const sseUrl = (process.env.VUE_APP_API_ROOT || '') + '/ai/gen-form-chat'

      try {
        const fullUrl =
          sseUrl + '?msg=' + encodeURIComponent(msg) + '&model=' + encodeURIComponent(model) + '&token=' + getToken()
        this.eventSource = new EventSource(fullUrl)
        this.isConnected = true

        this.eventSource.onopen = (e) => {
          console.log('SSE 连接已成功打开 (onopen)', e)
        }

        this.eventSource.onmessage = (event) => {
          const parsed = this.parseSSEData(event.data)
          console.log(parsed)
          if (parsed && parsed.content) {
            this.finalAnswer += parsed.content
          }
        }

        this.eventSource.onerror = (error) => {
          console.error('SSE Error (连接错误或结束):', error)
          this.disconnect()
        }
      } catch (error) {
        console.error('Connection Error (无法创建 EventSource):', error)
        this.disconnect()
      }
    },
    disconnect() {
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }
      this.isConnected = false
    },
    parseSSEData(data) {
      try {
        const parsed = JSON.parse(data)

        // 判断是否结束
        if (parsed.choices?.[0]?.finish_reason === 'stop') {
          this.disconnect()
        }

        // 一个字一个字输出
        const content = parsed.choices?.[0]?.delta?.content || ''

        // 处理 think 标签包裹的情况
        if (content.includes('<think>')) {
          this.isInThinkTag = true
          const startIndex = content.indexOf('<think>') + '<think>'.length
          return {
            content: content.substring(0, content.indexOf('<think>'))
          }
        }

        if (content.includes('</think>')) {
          this.isInThinkTag = false
          const endIndex = content.indexOf('</think>')
          return {
            content: content.substring(endIndex + '</think>'.length)
          }
        }

        return {
          content: this.isInThinkTag ? '' : content
        }
      } catch (e) {
        console.error('解析JSON失败:', e)
        return null
      }
    },
    handleFinalAnswerChange: throttle(function (newVal) {
      console.log('--- handleFinalAnswerChange ---')
      console.log('Raw finalAnswer length:', newVal.length)
      console.log('Raw finalAnswer content:', newVal)
      try {
        const container = document.getElementById('survey-content')
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }

        let repaired = newVal
        try {
          repaired = jsonrepair(newVal)
          console.log('Repaired JSON successfully:', repaired)
        } catch (repairError) {
          console.warn('jsonrepair 失败 (可能JSON尚不完整):', repairError.message)
          return
        }

        const { fields: parseFields, formInfo: parseFormInfo } = parseJsonToFields(repaired)
        console.log('Parsed result - fields:', parseFields, 'formInfo:', parseFormInfo)

        if (parseFields && parseFields.length > 0) {
          this.fields = parseFields
        }
        if (parseFormInfo && (parseFormInfo.title || parseFormInfo.description)) {
          this.formInfo = {
            ...this.formInfo,
            ...parseFormInfo
          }
        }
        console.log('Current Vue data - fields:', this.fields, 'formInfo:', this.formInfo)
        if (this.formInfo) {
          this.formInfo.type = 1
        }
      } catch (error) {
        console.error('解析JSON或更新组件数据失败:', error)
      }
    }, 500),
    async saveForm() {
      const loading = this.$loading({
        lock: true,
        text: '正在保存并导入表单...',
        background: 'rgba(255, 255, 255, 0.7)'
      })

      try {
        const res = await createFormRequest({
          name: this.formInfo?.title,
          type: this.formInfo?.type || 1,
          description: this.formInfo?.description,
          fields: this.fields
        })

        const itemList = this.fields.map((item) => formItemConvertData(item, res.data.formKey))
        await batchCreateProjectItem(itemList)

        loading.close()

        await this.$confirm('表单保存成功，是否立即前往编辑？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.$router.push({
          path: `/project/form/editor`,
          query: { key: res.data.formKey, active: 'editor/index', type: 1 }
        })
      } catch (error) {
        loading.close()
        this.$message.error('保存表单失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-form-container {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;

  // 左侧控制区 40% 占比
  .control-section {
    width: 40%;
    min-width: 450px;
    background: #fff;
    border-right: 1px solid #e5e9ef;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.02);
    z-index: 10;

    .fixed-top {
      padding: 32px 32px 0 32px;
      flex-shrink: 0;
    }

    .scrollable-content {
      flex: 1;
      padding: 0 32px 32px 32px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 2px;
      }
    }

    .section-title-box {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;

      .ai-logo-icon {
        font-size: 28px;
        color: #3b82f6;
        animation: ai-float-rotate 6s infinite linear;
      }

      h2 {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }
    }

    .input-card {
      background: #f1f5f9;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;

      .field-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 12px;

        i {
          color: #3b82f6;
        }
      }

      .custom-textarea {
        ::v-deep .el-textarea__inner {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          line-height: 1.6;

          &:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
          }
        }
      }

      .model-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 16px 0;

        .model-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .label {
            font-size: 12px;
            color: #64748b;
          }

          .custom-select {
            width: 130px;
          }
        }

        .word-indicator {
          font-size: 12px;
          color: #94a3b8;
        }
      }

      .ai-generate-btn {
        width: 100%;
        height: 44px;
        border-radius: 10px;
        font-weight: 600;
        border: none;
        box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
        }
      }
    }

    .guide-card {
      background: #fff;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      padding: 15px;

      h4 {
        color: #334155;
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;

        i {
          color: #f59e0b;
        }
      }

      ol {
        color: #64748b;
        font-size: 13px;
        line-height: 1.8;
        padding-left: 20px;
        margin-bottom: 16px;

        li {
          margin-bottom: 8px;
        }
      }

      .examples {
        .example-item {
          background: #f8fafc;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;

          &:hover {
            background: #fff;
            border-color: #3b82f6;
            transform: translateX(2px);

            .example-content {
              color: #3b82f6;
            }
          }

          .example-content {
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
          }
        }
      }
    }
  }

  // 右侧预览区
  .preview-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;

    .preview-toolbar {
      height: 60px;
      padding: 0 24px;
      background: #fff;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e0;

          &.is-active {
            background: #10b981;
            animation: pulse 2s infinite;
          }
        }

        .status-text {
          font-size: 12px;
          color: #94a3b8;
        }
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .save-form-btn {
        height: 36px;
        border-radius: 8px;
        font-weight: 600;
        padding: 0 20px;
      }
    }

    .preview-canvas {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
      display: flex;
      justify-content: center;
      align-items: center; // 确保整体垂直居中（在没有滚动条时）
      position: relative;

      .phone-mockup {
        width: 100%;
        max-width: 850px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        padding: 32px;
        box-sizing: border-box;
        border: 1px solid #f1f5f9;
        margin: auto 0; // 确保在 Canvas 中垂直居中
      }
    }
  }
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;

  .waiting-box {
    .waiting-icon {
      font-size: 80px;
      color: #3b82f6;
      display: inline-block;
      margin-bottom: 24px;
      animation: ai-float-rotate 6s infinite linear;
      filter: drop-shadow(0 10px 20px rgba(59, 130, 246, 0.2));
    }

    p {
      font-size: 15px;
      font-weight: 400;
      color: #616161;
      margin-bottom: 6px;
    }
  }

  .generating-box {
    p {
      font-size: 14px;
      color: #3b82f6;
      font-weight: 500;
    }

    .ai-wave {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-bottom: 12px;

      span {
        width: 3px;
        height: 12px;
        background: #3b82f6;
        border-radius: 2px;
        animation: wave 1s ease-in-out infinite;

        &:nth-child(2) {
          animation-delay: 0.1s;
        }

        &:nth-child(3) {
          animation-delay: 0.2s;
        }

        &:nth-child(4) {
          animation-delay: 0.3s;
        }
      }
    }
  }
}

@keyframes ai-float-rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(90deg) scale(1.1);
  }
  50% {
    transform: rotate(180deg) scale(0.95);
  }
  75% {
    transform: rotate(270deg) scale(1.15);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes wave {
  0%,
  100% {
    height: 6px;
  }
  50% {
    height: 18px;
  }
}
</style>
