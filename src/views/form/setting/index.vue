<template>
  <div class="setting-container">
    <el-tabs tab-position="left" class="setting-tabs">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-document-checked"></i> 提交设置</span>
        <submit-setting />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-refresh-left"></i> 回收设置</span>
        <write-setting />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-bell"></i> 通知设置</span>
        <notify-setting />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-share"></i> 分享设置</span>
        <share-setting />
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-s-promotion"></i> 数据推送</span>
        <data-push />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import SubmitSetting from './submit'
import WriteSetting from './write'
import NotifySetting from './notify'
import ShareSetting from './share'
import DataPush from './DataPush'

export default {
  name: 'ProjectSetting',
  components: {
    SubmitSetting,
    WriteSetting,
    NotifySetting,
    ShareSetting,
    DataPush
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.setting-container {
  width: 100%;
  height: 100%;
  background-color: #f7f8fa;
  display: flex;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;

  .setting-tabs {
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    width: 1100px;
    max-width: 95%;
    height: 100%;
    min-height: 600px;
    border: none;
    padding: 16px 0;
    display: flex;
    overflow: hidden;

    ::v-deep .el-tabs__content {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      padding: 0 24px;
    }
  }
}

::v-deep .el-tabs--left .el-tabs__header.is-left {
  margin-right: 0;
  border-right: 1px solid #f0f0f0;
  width: 200px;
}

::v-deep .el-tabs--left .el-tabs__nav-wrap.is-left::after {
  width: 0;
}

::v-deep .el-tabs--left .el-tabs__nav.is-left {
  background-color: transparent !important;
  width: 100%;
  padding-top: 10px;
}

::v-deep .el-tabs--left .el-tabs__item.is-left {
  text-align: center;
}

::v-deep .el-tabs__item {
  font-size: 15px;
  height: 48px;
  line-height: 48px;
  margin: 6px 16px;
  padding: 0 16px !important;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  color: #4b5563;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  i {
    font-size: 18px;
    margin-right: 12px;
  }

  &:hover {
    color: #1d4ed8;
    background-color: #f3f4f6;
  }

  &.is-active {
    color: #2563eb;
    font-weight: 600;
    background-color: #eff6ff;
  }
}

::v-deep .el-tabs__active-bar {
  display: none !important;
}
</style>
