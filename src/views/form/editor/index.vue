<template>
  <div class="form-editor-wrapper">
    <FormDesign :key="formRenderKey" :question-mode="true" ref="formDesign" @back="handleBack" />
    <ImportFormItem
      ref="importItems"
      :form-key="formKey"
      :on-success="onImportSuccess"
    />
  </div>
</template>

<script>
import TduckForm, { FormDesign } from 'tduck-form-generator'
import 'tduck-form-generator/dist/TduckForm.css'
import mixin from '../TduckFormMixin.js'
import ImportFormItem from './ImportFormItem.vue'

// 需要清除的 localStorage 缓存 key 前缀
const CACHE_KEY_PREFIXES = [
  'drawingItems:', 'drawingId:', 'drawingList:',
  'formConf:', 'DRAWING_ITEMS_VERSION', 'TREE_NODE_ID', 'drawing'
];

function clearFormGeneratorCache() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && CACHE_KEY_PREFIXES.some(p => key.startsWith(p))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  localStorage.setItem('DRAWING_ITEMS_VERSION', '0');
}

export default {
  name: 'FormEditor',
  components: { FormDesign, ImportFormItem },
  mixins: [mixin],
  data() {
    return {
      formKey: '',
      formRenderKey: 0,
      onImportSuccess: null
    }
  },
  created() {
    this.formKey = this.$route.query.key || '';
    
    // 绑定回调（确保 this 正确）
    this.onImportSuccess = () => {
      console.log('[编辑器-导入] 导入成功，刷新 FormDesign 数据');
      clearFormGeneratorCache();
      
      // 直接调用 FormDesign 的方法重新从 API 获取数据
      // 不需要页面刷新或组件重建
      this.$nextTick(() => {
        const fd = this.$refs.formDesign;
        if (fd && fd.queryProjectItems) {
          console.log('[编辑器-导入] 调用 FormDesign.queryProjectItems()');
          fd.queryProjectItems();
        } else {
          // 降级：重建组件
          console.log('[编辑器-导入] FormDesign 无 queryProjectItems 方法，使用 key 重建');
          this.formRenderKey = Date.now();
        }
      });
    };

    // 每次进入编辑器清除缓存
    clearFormGeneratorCache();
  },
  mounted() {
    this.$nextTick(() => this.overrideImportButton());
  },
  methods: {
    overrideImportButton() {
      const importBtn = document.querySelector('.import-topic-box button');
      if (importBtn) {
        importBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.$refs.importItems.showDialog();
        }, true);
      }
    },
    handleBack() {
      this.$router.push('/home');
    }
  }
}
</script>

<style lang="scss">
.form-editor-wrapper { height: 100%; }
</style>
