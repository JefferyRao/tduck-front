<template>
  <div v-loading="createProjectLoading" class="template-preview-container">
    <!-- 顶部优雅导航栏 -->
    <div class="preview-header">
      <el-page-header content="模板详情" @back="$router.back(-1)" />
      <div class="header-actions">
        <el-button type="primary" round class="use-template-btn" @click="createProjectByTemplate">
          使用该模板
        </el-button>
      </div>
    </div>

    <!-- 居中预览内容区 -->
    <div class="template-preview-content">
      <el-scrollbar class="template-scrollbar">
        <div class="form-preview-wrapper">
          <biz-project-form v-if="formConfig.formKey" :form-config="formConfig" @submit="submitForm" />
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { BizProjectForm } from 'tduck-form-generator'
import { useTemplateCreateFormRequest } from '@/api/project/template'
import mixin from '../../form/TduckFormMixin'

export default {
  name: 'TemplatePreview',
  components: {
    BizProjectForm
  },
  mixins: [mixin],
  props: {},
  data() {
    return {
      createProjectLoading: false,
      formConfig: {
        formKey: '',
        preview: false,
        formKind: 2,
        showBtns: true
      }
    }
  },
  mounted() {
    this.formConfig.formKey = this.$route.query.key
  },
  methods: {
    createProjectByTemplate() {
      this.createProjectLoading = true
      useTemplateCreateFormRequest({ formKey: this.formConfig.formKey })
        .then((res) => {
          this.createProjectLoading = false
          if (res.data) {
            this.$router.push({ path: '/project/form/editor', query: { key: res.data, active: 1 } })
          }
        })
        .catch(() => {
          this.createProjectLoading = false
        })
    },
    submitForm() {}
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

// 整体容器采用 Flex 布局
.template-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f7; // 苹果风灰白背景
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

// 顶部导航：悬浮阴影与左右分布
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  z-index: 10;

  ::v-deep .el-page-header__content {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
  }

  .use-template-btn {
    font-weight: 600;
    padding: 10px 24px;
    box-shadow: 0 4px 12px rgba($color-primary, 0.25);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba($color-primary, 0.35);
    }

    &:active {
      transform: translateY(1px);
    }
  }
}

// 预览滚动区
.template-preview-content {
  flex: 1;
  overflow: hidden; // 滚动由 el-scrollbar 处理

  .template-scrollbar {
    height: 100%;

    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
}

// 表单居中卡片容器
.form-preview-wrapper {
  max-width: 810px; // 固定表单最佳阅读宽度
  margin: 40px auto 80px auto;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.02);
  min-height: calc(100vh - 200px);

  @media (max-width: 768px) {
    max-width: 100%;
    margin: 20px;
    padding: 20px;
    border-radius: 12px;
  }

  ::v-deep .project-form-wrapper {
    background: transparent !important;
    min-height: auto !important;
    padding: 0 !important;
  }

  ::v-deep .project-form {
    box-shadow: none !important;
  }
}
</style>
