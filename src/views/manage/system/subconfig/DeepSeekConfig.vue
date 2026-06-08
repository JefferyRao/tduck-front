<template>
  <div class="config-form-wrapper">
    <el-form ref="aiProviderConfig" :model="form" label-position="top" class="modern-form">
      <el-form-item label="启用 AI 服务" prop="enabled">
        <el-switch v-model="form.enabled" class="modern-switch" @change="handleEnabledChange" />
        <div class="form-hint">开启后，系统将启用 AI 大语言模型相关功能（问卷优化等）</div>
      </el-form-item>

      <template v-if="form.enabled">
        <el-form-item
          label="AI Provider"
          prop="providerType"
          :rules="form.enabled ? [{ required: true, message: '请选择 AI Provider', trigger: 'change' }] : []"
        >
          <el-select v-model="form.providerType" placeholder="请选择 AI Provider" class="modern-input" style="width: 100%">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="自定义 (OpenAI 兼容)" value="custom" />
          </el-select>
          <div class="form-hint">选择 AI 服务提供商，或选择"自定义"接入 OpenAI 兼容的第三方服务</div>
        </el-form-item>

        <el-form-item
          label="API Key"
          prop="apiKey"
          :rules="form.enabled ? [{ required: true, message: '请输入 API Key', trigger: 'blur' }] : []"
        >
          <el-input v-model="form.apiKey" placeholder="例如：sk-..." show-password class="modern-input" />
          <div class="form-hint">从对应 AI 服务商开放平台获取的 API Key</div>
        </el-form-item>

        <el-form-item
          label="Base URL"
          prop="baseUrl"
          :rules="form.enabled ? [{ required: true, message: '请输入 Base URL', trigger: 'blur' }] : []"
        >
          <el-input v-model="form.baseUrl" :placeholder="baseUrlPlaceholder" class="modern-input" />
          <div class="form-hint">API 终结点地址</div>
        </el-form-item>

        <el-form-item
          label="模型名称"
          prop="modelName"
          :rules="form.enabled ? [{ required: true, message: '请输入模型名称', trigger: 'blur' }] : []"
        >
          <el-input v-model="form.modelName" :placeholder="modelNamePlaceholder" class="modern-input" />
          <div class="form-hint">大语言模型名称</div>
        </el-form-item>

        <el-form-item label="请求超时时间 (秒)" prop="timeout">
          <el-input-number v-model="form.timeout" :min="10" :max="300" class="modern-input" style="width: 100%" />
          <div class="form-hint">接口请求的超时限制，默认 60 秒，范围 10-300 秒</div>
        </el-form-item>
      </template>

      <el-form-item class="form-action">
        <el-button v-if="form.enabled" class="modern-btn" :loading="testing" @click="handleTest">
          测试连接
        </el-button>
        <el-button type="primary" class="modern-btn" @click="handleSubmit"> 保 存 配 置 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getAiConfig, saveAiConfig, testAiConnection } from '@/api/project/import'

export default {
  name: 'AiProviderConfig',
  data() {
    return {
      form: {
        enabled: false,
        providerType: 'deepseek',
        apiKey: '',
        baseUrl: 'https://api.deepseek.com/v1',
        modelName: 'deepseek-chat',
        timeout: 60
      },
      testing: false
    }
  },
  computed: {
    baseUrlPlaceholder() {
      const placeholders = {
        deepseek: 'https://api.deepseek.com/v1',
        openai: 'https://api.openai.com/v1',
        custom: '请输入自定义 API 地址'
      }
      return placeholders[this.form.providerType] || ''
    },
    modelNamePlaceholder() {
      const placeholders = {
        deepseek: 'deepseek-chat',
        openai: 'gpt-4o',
        custom: '请输入模型名称'
      }
      return placeholders[this.form.providerType] || ''
    }
  },
  watch: {
    'form.providerType'(val) {
      if (val === 'deepseek') {
        this.form.baseUrl = 'https://api.deepseek.com/v1'
        this.form.modelName = 'deepseek-chat'
      } else if (val === 'openai') {
        this.form.baseUrl = 'https://api.openai.com/v1'
        this.form.modelName = 'gpt-4o'
      }
    }
  },
  async created() {
    await this.loadConfig()
  },
  methods: {
    async loadConfig() {
      try {
        const res = await getAiConfig()
        if (res.code === 200 && res.data) {
          this.form = { ...this.form, ...res.data }
        }
      } catch (e) {
        console.error('加载 AI 配置失败', e)
      }
    },
    handleEnabledChange(val) {
      if (!val) {
        this.$refs.aiProviderConfig.clearValidate()
      }
    },
    async handleTest() {
      this.testing = true
      try {
        const res = await testAiConnection(this.form)
        if (res.code === 200) {
          this.$message.success('连接成功')
        } else {
          this.$message.error(res.msg || '连接失败')
        }
      } catch (e) {
        this.$message.error('连接测试失败')
      } finally {
        this.testing = false
      }
    },
    handleSubmit() {
      this.$refs.aiProviderConfig.validate((valid) => {
        if (valid) {
          saveAiConfig(this.form).then((res) => {
            if (res.code === 200) {
              this.msgSuccess('保存成功')
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.config-form-wrapper {
  max-width: 800px;
  margin-top: 32px;
  margin-left: 16px;
}

.modern-form {
  ::v-deep .el-form-item {
    margin-bottom: 28px;

    .el-form-item__label {
      font-weight: 600;
      color: #1e293b;
      padding-bottom: 8px;
      line-height: 1.4;
    }
  }

  .form-hint {
    font-size: 13px;
    color: #94a3b8;
    margin-top: 6px;
    line-height: 1.5;
  }

  .form-action {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #f1f5f9;
  }
}

.modern-input {
  ::v-deep .el-input__inner {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 0 16px;
    height: 42px;
    line-height: 42px;
    transition: all 0.2s ease;
    font-size: 14px;
    color: #334155;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  ::v-deep .el-input-number__decrease,
  ::v-deep .el-input-number__increase {
    border-radius: 0 8px 8px 0;
    background-color: #f8fafc;
    border-left: 1px solid #cbd5e1;
    height: 40px;
    line-height: 40px;
  }

  ::v-deep .el-input-number__decrease {
    border-radius: 8px 0 0 8px;
    border-right: 1px solid #cbd5e1;
    border-left: none;
  }
}

.modern-btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 32px;
  font-size: 14px;
  transition: all 0.2s;
  border: none;

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
}
</style>
