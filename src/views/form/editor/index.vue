<template>
  <div class="form-editor-wrapper">
    <FormDesign :question-mode="true" ref="formDesign" @back="handleBack" />
    <ImportFormItem
      ref="importItems"
      :form-key="formKey"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script>
import TduckForm, { FormDesign } from 'tduck-form-generator'
import 'tduck-form-generator/dist/TduckForm.css'
import mixin from '../TduckFormMixin.js'
import ImportFormItem from './ImportFormItem.vue'

export default {
  name: 'FormEditor',
  components: {
    FormDesign,
    ImportFormItem
  },
  mixins: [mixin],
  data() {
    return {
      formKey: ''
    }
  },
  created() {
    this.formKey = this.$route.query.key || ''
  },
  mounted() {
    this.$nextTick(() => {
      this.overrideImportButton()
    })
  },
  methods: {
    overrideImportButton() {
      const importBtn = document.querySelector('.import-topic-box button')
      if (importBtn) {
        importBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          this.$refs.importItems.showDialog()
        }, true)
      }
    },
    handleImportSuccess() {
      // Reload page to show imported items
      window.location.reload()
    },
    handleBack() {
      this.$router.push('/home')
    }
  }
}
</script>

<style lang="scss">
.form-editor-wrapper {
  height: 100%;
}
</style>
