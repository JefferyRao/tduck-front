<template>
  <el-drawer
    :visible.sync="drawerVisible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :with-header="false"
    class="chat-form-drawer"
    size="100%"
  >
    <ChatForm @close="close" />
  </el-drawer>
</template>

<script>
import ChatForm from './ChatForm.vue'

export default {
  name: 'ChatFormDialog',
  components: {
    ChatForm
  },
  data() {
    return {
      drawerVisible: false
    }
  },
  methods: {
    open() {
      this.drawerVisible = true
    },
    close() {
      this.drawerVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-form-drawer {
  ::v-deep .el-drawer__body {
    padding: 0;
    overflow: hidden;
  }
}
</style>
