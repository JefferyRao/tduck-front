<template>
  <div class="project-setting-view">
    <p class="project-setting-title">
      通知设置
      <span class="title-desc">自定义表单提交后的通知，支持公众号、邮件等</span>
    </p>
    <el-divider />
    <el-form ref="notifySettingForm" :model="notifySettingForm" :rules="settingRules">
      <div class="setting-item">
        <p class="label">发邮件提醒我</p>
        <el-switch v-model="notifySettingForm.emailNotify" />
      </div>
      <el-form-item v-if="notifySettingForm.emailNotify" prop="newWriteNotifyEmail">
        <el-input
          v-model="notifySettingForm.newWriteNotifyEmail"
          placeholder="请输入接收通知的邮箱地址，多个邮箱用 ; 隔开"
          clearable
        />
      </el-form-item>
      <div class="setting-item">
        <p class="label">发微信提醒我</p>
        <el-switch v-model="notifySettingForm.wxNotify" />
      </div>
      <div v-if="notifySettingForm.wxNotify">
        <p class="project-setting-sub-label sub-label-text">
          需要关注公众号
          <el-link type="primary" @click="openSubNotifyWxDialogHandle"> 查看二维码 </el-link>
        </p>
        <el-row v-if="notifySettingForm.newWriteNotifyWx" align="middle" type="flex" class="mt10">
          <el-col :span="4">
            <p class="project-setting-sub-label" style="margin-top: 0; line-height: 40px">提醒人：</p>
          </el-col>
          <el-col :span="20">
            <span v-for="(user, i) in subNotifyWxUserList" :key="i" class="sub-user-view">
              <i class="el-icon-close sub-user-delete" @click="deleteSubNotifyUserHandle(i)" />
              <el-avatar :src="user.headImgUrl" :size="40" />
              <span class="user-nickname">{{ user.nickname }}</span>
            </span>
          </el-col>
        </el-row>
      </div>
      <div class="submit-btn">
        <el-button type="primary" icon="el-icon-check" @click="saveSettingHandle"> 保存设置 </el-button>
      </div>
      <el-dialog :visible.sync="dialogSubNotifyVisible" title="微信扫描二维码订阅" width="400px" append-to-body>
        <div style="text-align: center">
          <el-image :src="subNotifyWxQrCode" fit="contain" style="width: 200px; height: 200px" />
          <p class="project-setting-sub-label mt10" style="text-align: center">请使用微信扫描上方二维码</p>
        </div>
      </el-dialog>
    </el-form>
  </div>
</template>

<script>
import mixin from './mixin'
import {
  deleteWxNotifyUserRequest,
  getSettingRequest,
  getWxNotifyQrcodeRequest,
  getWxNotifyUserRequest,
  saveSettingRequest
} from '@/api/project/setting'

export default {
  name: 'NotifySetting',
  components: {},
  mixins: [mixin],
  data() {
    return {
      settingRules: {
        newWriteNotifyEmail: [
          {
            trigger: 'blur',
            pattern:
              /^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\;))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/,
            message: '请输入正确发送的邮箱'
          },
          { required: true, message: '请输入正确发送的邮箱', trigger: 'blur' }
        ]
      },
      notifySettingForm: {
        emailNotify: false,
        newWriteNotifyEmail: null,
        wxNotify: false,
        newWriteNotifyWx: null
      },
      dialogSubNotifyVisible: false,
      subNotifyWxQrCode: '',
      subNotifyWxUserList: [],
      subNotifyUserTimer: null
    }
  },
  mounted() {
    this.queryUserProjectSetting()
    this.getSubNotifyWxQrCode()
  },
  destroyed() {
    clearInterval(this.subNotifyUserTimer)
  },
  methods: {
    queryUserProjectSetting() {
      getSettingRequest(this.formKey).then((res) => {
        if (res.data) {
          this.notifySettingForm = res.data
          if (this.notifySettingForm.wxNotify) {
            this.querySubNotifyWxUser(this.notifySettingForm.newWriteNotifyWx)
          }
        }
      })
    },
    saveSettingHandle() {
      this.$refs['notifySettingForm'].validate((valid) => {
        if (valid) {
          this.notifySettingForm.formKey = this.formKey
          saveSettingRequest(this.notifySettingForm).then(() => {
            this.msgSuccess('保存成功')
            this.queryUserProjectSetting()
          })
        } else {
          return false
        }
      })
    },
    openSubNotifyWxDialogHandle() {
      this.dialogSubNotifyVisible = true
      this.subNotifyUserTimer = setInterval(() => {
        this.querySubNotifyWxUser()
      }, 5 * 1000)
    },
    querySubNotifyWxUser(openIdStr) {
      getWxNotifyUserRequest({
        key: this.formKey,
        openIdStr: openIdStr
      }).then((res) => {
        this.subNotifyWxUserList = res.data
        if (this.subNotifyWxUserList) {
          let changeNewWriteNotifyWx = this.subNotifyWxUserList.map((item) => item.openId).join(';')
          if (!openIdStr && changeNewWriteNotifyWx != this.notifySettingForm.newWriteNotifyWx) {
            this.notifySettingForm.newWriteNotifyWx = changeNewWriteNotifyWx
            this.dialogSubNotifyVisible = false
          }
        }
      })
    },
    getSubNotifyWxQrCode() {
      getWxNotifyQrcodeRequest({ key: this.formKey }).then((res) => {
        this.subNotifyWxQrCode = res.data
      })
    },
    deleteSubNotifyUserHandle(i) {
      if (this.subNotifyWxUserList) {
        let openId = this.subNotifyWxUserList[i].openId
        let key = this.formKey
        deleteWxNotifyUserRequest(key, openId).then((res) => {
          this.subNotifyWxUserList.splice(i)
          this.notifySettingForm.newWriteNotifyWx = this.subNotifyWxUserList.map((item) => item.openId).join(';')
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'settting';

.sub-label-text {
  text-align: left;
}

.sub-user-view {
  position: relative;
  display: inline-block;
  height: 100%;
  width: 60px;
  cursor: pointer;

  &:hover .sub-user-delete {
    display: block;
  }

  .sub-user-delete {
    position: absolute;
    right: -6px;
    background-color: red;
    color: white;
    border-radius: 50px;
    padding: 2px;
    font-size: 12px;
    height: 16px;
    width: 16px;
    font-weight: 500;
    line-height: 18px;
    display: none;
  }
}
</style>
