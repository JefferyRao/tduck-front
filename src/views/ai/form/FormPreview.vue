<template>
  <div class="preview-form-wrapper">
    <!-- 头部：标题与描述 -->
    <div v-if="formConfig.title || formConfig.description" class="form-header-box">
      <h1 v-if="formConfig.title" class="form-preview-title">{{ formConfig.title }}</h1>
      <p v-if="formConfig.description" class="form-preview-desc">{{ formConfig.description }}</p>
      <div class="form-header-divider"></div>
    </div>
    <!-- 表单主体 -->
    <generate-form ref="generateForm" :key="renderKey" :page-form-model="{}" :form-conf="formConfig" />
  </div>
</template>

<script>
import { GenerateForm } from 'tduck-form-generator'
import 'tduck-form-generator/dist/TduckForm.css'
import { throttle } from 'lodash'

export default {
  name: 'FormPreview',
  components: {
    GenerateForm
  },
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    formInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      renderKey: 0,
      formConfig: {
        title: '',
        description: '',
        fields: [],
        labelPosition: 'top',
        formKey: 'temp001'
      }
    }
  },
  watch: {
    fields: {
      handler(newVal) {
        this.formConfig.fields = newVal
        this.renderKey++
      },
      deep: true,
      immediate: true
    },
    formInfo: {
      handler(newVal) {
        this.handleFormInfoChange(newVal)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleFormInfoChange: throttle(function (newVal) {
      if (newVal) {
        this.formConfig.title = newVal.title || ''
        this.formConfig.description = newVal.description || ''
      }
    }, 300)
  }
}
</script>

<style scoped lang="scss">
.preview-form-wrapper {
  width: 100%;
  min-height: 480px; /* 稳定最小高度，彻底防止重新渲染时高度塌陷/抖动 */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.form-header-box {
  text-align: center;
  margin-bottom: 28px;
  padding: 0 16px;

  .form-preview-title {
    font-size: 22px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 12px 0;
    line-height: 1.4;
    letter-spacing: 0.5px;
  }

  .form-preview-desc {
    font-size: 14px;
    color: #64748b;
    margin: 0;
    line-height: 1.6;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }

  .form-header-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0 15%, #e2e8f0 85%, transparent);
    margin-top: 20px;
    width: 100%;
  }
}
</style>
