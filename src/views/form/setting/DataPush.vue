<template>
  <div class="project-setting-view">
    <p class="project-setting-title">
      数据推送
      <span class="title-desc">将数据以JSON格式推送给第三方系统</span>
    </p>
    <el-divider />

    <div class="setting-alert-box">
      <i class="el-icon-info"></i>
      <div class="alert-content">
        <div class="alert-title">温馨提示</div>
        <div class="alert-desc">
          数据提交后，将向填写的 Webhook 地址发送 JSON 格式的填写结果，Content-Type 为
          application/json。目标服务器需要返回 200 状态码作为响应，否则系统认为出现异常，最多重试 3 次。
        </div>
      </div>
    </div>

    <div v-if="apiKey" class="api-wrap">
      <div class="api-item">
        <span class="api-label">表单字段同步 API</span>
        <div class="api-value-box">
          <span class="api-value">{{ apiBasePath }}/sync/form/fields?apiKey={{ apiKey }}</span>
          <el-button
            type="text"
            icon="el-icon-copy-document"
            class="copy-btn"
            @click="handleCopy(`${apiBasePath}/sync/form/fields?apiKey=${apiKey}`)"
            >复制</el-button
          >
        </div>
      </div>
      <div class="api-item mt15">
        <span class="api-label">数据同步 API</span>
        <div class="api-value-box">
          <span class="api-value">{{ apiBasePath }}/sync/form/data?apiKey={{ apiKey }}</span>
          <el-button
            type="text"
            icon="el-icon-copy-document"
            class="copy-btn"
            @click="handleCopy(`${apiBasePath}/sync/form/data?apiKey=${apiKey}`)"
            >复制</el-button
          >
        </div>
      </div>
    </div>

    <el-form ref="webhookForm" :model="form" :rules="rules" class="custom-form">
      <div class="setting-item switch-item">
        <div class="setting-item-content">
          <p class="label">开启数据推送</p>
          <p class="desc">启用后，表单收集到的新数据将自动推送到目标地址</p>
        </div>
        <el-switch v-model="form.enabled" />
      </div>

      <transition name="el-fade-in-linear">
        <div v-if="form.enabled" class="webhook-config-wrap mt20">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="请求类型" prop="requestType">
                <el-select v-model="form.requestType" placeholder="请求类型" style="width: 100%">
                  <el-option label="POST" value="POST"></el-option>
                  <el-option label="GET" value="GET"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <el-form-item label="推送地址" prop="url">
                <el-input v-model="form.url" placeholder="例如：https://api.example.com/webhook" clearable></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="事件类型" class="mt10">
            <el-select
              v-model="form.otherOptions.eventTypes"
              clearable
              collapse-tags
              multiple
              style="width: 100%"
              placeholder="请选择推送触发的事件类型"
            >
              <el-option label="表单数据新增" value="form_data_add" />
              <el-option label="表单数据修改" value="form_data_update" />
              <el-option label="表单数据删除" value="form_data_delete" />
            </el-select>
          </el-form-item>
        </div>
      </transition>

      <div class="submit-btn" style="display: flex; gap: 12px; margin-top: 30px">
        <el-button type="primary" class="save-btn" icon="el-icon-check" @click="handleSave">保存设置</el-button>
        <el-button v-if="form.enabled" class="test-btn" icon="el-icon-position" @click="handleSendTest"
          >发送测试</el-button
        >
      </div>
    </el-form>
  </div>
</template>

<script>
import { getApiKey, getWebHook, saveWebHook, sendTestWebHook } from '@/api/project/webhook'

export default {
  name: 'DataPush',
  components: {},
  data() {
    return {
      form: {
        sourceType: '',
        sourceId: '',
        enabled: false,
        requestType: 'POST',
        url: '',
        otherOptions: {
          eventTypes: []
        }
      },
      rules: {
        requestType: [{ required: true, message: '请选择请求类型', trigger: 'blur' }],
        url: [
          { required: true, message: '请输入推送地址', trigger: 'blur' },
          { type: 'url', message: '请输入正确的url地址', trigger: ['blur', 'change'] }
        ]
      },
      apiKey: '',
      apiBasePath: ''
    }
  },
  created() {
    this.form.sourceType = 'form'
    this.form.sourceId = this.$route.query.key
    this.handleQuery()
    getApiKey(this.form.sourceId).then((res) => {
      if (res.data) {
        this.apiKey = res.data
        this.apiBasePath = window.location.origin + '' + process.env['VUE_APP_API_ROOT']
      }
    })
  },
  methods: {
    handleQuery() {
      getWebHook(this.form.sourceType, this.form.sourceId).then((res) => {
        if (res.data) {
          this.form = res.data
          // 旧版本没有这个字段 兼容下 24/4/06
          if (!this.form.otherOptions) {
            this.form.otherOptions = {
              eventTypes: []
            }
          }
        }
      })
    },
    handleCopy(text) {
      const input = document.createElement('input')
      input.setAttribute('value', text)
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('复制成功')
    },
    handleSendTest() {
      if (this.form.enabled === false) {
        this.msgError('请先开启数据推送')
        return
      }
      this.$refs.webhookForm.validate((valid) => {
        if (valid) {
          sendTestWebHook(this.form).then((res) => {
            if (res.data) {
              this.msgSuccess('发送成功')
            } else {
              this.msgError('发送失败,请检查地址是否正确，并且服务器是否正常和正确响应')
            }
          })
        } else {
          return false
        }
      })
    },
    handleSave() {
      this.$refs.webhookForm.validate((valid) => {
        if (valid) {
          saveWebHook(this.form).then((res) => {
            this.msgSuccess('保存成功')
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'settting';

.setting-alert-box {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  background: rgba(33, 118, 255, 0.04);
  border: 1px solid rgba(33, 118, 255, 0.1);
  border-radius: 8px;
  margin: 16px 0 24px;

  i {
    font-size: 18px;
    color: #2176ff;
    margin-right: 12px;
    margin-top: 2px;
  }

  .alert-content {
    flex: 1;
    .alert-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 6px;
    }
    .alert-desc {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.6;
    }
  }
}

.api-wrap {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

  .api-item {
    .api-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    .api-value-box {
      display: flex;
      align-items: center;
      background: #f3f4f6;
      border-radius: 6px;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s;

      &:hover {
        border-color: #d1d5db;
        background: #f0f1f3;
      }

      .api-value {
        flex: 1;
        font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
        font-size: 13px;
        color: #4b5563;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: all;
      }
      .copy-btn {
        padding: 0;
        margin-left: 12px;
        color: #6b7280;
        font-size: 13px;

        &:hover {
          color: #2176ff;
        }
      }
    }
  }
  .mt15 {
    margin-top: 15px;
  }
}

.custom-form {
  .switch-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #f3f4f6;
    margin-bottom: 0;

    .setting-item-content {
      .label {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 4px 0;
      }
      .desc {
        font-size: 13px;
        color: #6b7280;
        margin: 0;
      }
    }
  }

  .webhook-config-wrap {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-top: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

    ::v-deep .el-form-item__label {
      font-weight: 500;
      color: #374151;
      padding-bottom: 6px;
    }
  }

  .submit-btn {
    .save-btn {
      padding: 10px 24px;
      font-weight: 500;
      border-radius: 6px;
    }
    .test-btn {
      padding: 10px 24px;
      font-weight: 500;
      border-radius: 6px;
      border-color: #d1d5db;
      color: #4b5563;

      &:hover {
        border-color: #2176ff;
        color: #2176ff;
        background: rgba(33, 118, 255, 0.04);
      }
    }
  }
}
</style>
