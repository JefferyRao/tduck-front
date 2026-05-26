<template>
  <div class="config-form-wrapper">
    <el-form ref="deepSeekEnvConfig" :model="form" label-position="top" class="modern-form">
      <el-form-item label="启用 DeepSeek 服务" prop="enabled">
        <el-switch v-model="form.enabled" class="modern-switch" @change="handleEnabledChange" />
        <div class="form-hint">开启后，系统将启用 AI 大语言模型相关功能</div>
      </el-form-item>

      <template v-if="form.enabled">
        <el-form-item
          label="API Key"
          prop="apiKey"
          :rules="form.enabled ? [{ required: true, message: '请输入 API Key', trigger: 'blur' }] : []"
        >
          <el-input v-model="form.apiKey" placeholder="例如：sk-..." show-password class="modern-input" />
          <div class="form-hint">填写从 DeepSeek 官方开放平台获取的 API Key</div>
        </el-form-item>

        <el-form-item
          label="Base URL"
          prop="baseUrl"
          :rules="form.enabled ? [{ required: true, message: '请输入 Base URL', trigger: 'blur' }] : []"
        >
          <el-input v-model="form.baseUrl" placeholder="例如：https://api.deepseek.com/v1" class="modern-input" />
          <div class="form-hint">默认的 API 终结点为 https://api.deepseek.com/v1</div>
        </el-form-item>

        <el-form-item
          label="模型名称"
          prop="modelName"
          :rules="form.enabled ? [{ required: true, message: '请输入模型名称', trigger: 'blur' }] : []"
        >
          <el-input v-model="form.modelName" placeholder="例如：deepseek-chat" class="modern-input" />
          <div class="form-hint">大语言模型名称，默认使用 deepseek-chat</div>
        </el-form-item>

        <el-form-item label="请求超时时间 (秒)" prop="timeout">
          <el-input-number v-model="form.timeout" :min="10" :max="300" class="modern-input" style="width: 100%" />
          <div class="form-hint">接口请求的超时限制，默认 60 秒，范围 10-300 秒</div>
        </el-form-item>
      </template>

      <el-form-item class="form-action">
        <el-button type="primary" class="modern-btn" @click="handleSubmit"> 保 存 配 置 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ConfigMixin from './ConfigMixin'

export default {
  name: 'DeepseekEnvConfig',
  mixins: [ConfigMixin],
  data() {
    return {
      form: {
        enabled: false,
        apiKey: '',
        baseUrl: 'https://api.deepseek.com/v1',
        modelName: 'deepseek-chat',
        model: 'deepseek-chat',
        timeout: 60
      }
    }
  },
  async created() {
    this.activeName = 'deepSeekEnvConfig'
    await this.handleClick()
  },
  methods: {
    handleEnabledChange(val) {
      if (!val) {
        this.$refs.deepSeekEnvConfig.clearValidate()
      }
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
