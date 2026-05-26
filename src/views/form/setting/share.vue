<template>
  <div class="project-setting-view">
    <p class="project-setting-title">
      分享设置
      <span class="title-desc">自定义表单在微信分享的标题以及图片等</span>
    </p>
    <el-divider />

    <div class="setting-layout">
      <div class="setting-form-area">
        <el-form ref="shareSettingForm" :model="shareSettingForm">
          <div class="setting-item">
            <p class="label">自定义分享图标</p>
            <el-switch v-model="shareSettingForm.shareWxImg" active-color="#3b82f6" />
          </div>
          <div v-if="shareSettingForm.shareWxImg" class="upload-area">
            <p class="project-setting-sub-label">请上传分享图片 * 建议尺寸 500px * 500px</p>
            <el-upload
              ref="logoUpload"
              :action="getUploadUrl"
              :headers="getUploadHeader"
              :on-success="uploadShareImgHandle"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.PBG,.GIF,.BMP"
            >
              <div class="share-img-upload">
                <el-image
                  v-if="shareSettingForm.shareWxImgUrl"
                  :src="shareSettingForm.shareWxImgUrl"
                  class="share-img"
                  fit="cover"
                />
                <div v-else class="upload-placeholder">
                  <i class="el-icon-picture-outline" />
                  <span>点击上传</span>
                </div>
              </div>
            </el-upload>
          </div>

          <div class="setting-item">
            <p class="label">自定义分享标题</p>
            <el-switch v-model="shareSettingForm.shareWxTitle" active-color="#3b82f6" />
          </div>
          <el-form-item
            v-if="shareSettingForm.shareWxTitle"
            :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]"
            prop="shareWxTitleContent"
          >
            <el-input v-model="shareSettingForm.shareWxTitleContent" placeholder="请输入标题" clearable />
          </el-form-item>

          <div class="setting-item">
            <p class="label">自定义分享描述</p>
            <el-switch v-model="shareSettingForm.shareWxDesc" active-color="#3b82f6" />
          </div>
          <el-form-item
            v-if="shareSettingForm.shareWxDesc"
            :rules="[{ required: true, message: '请输入描述', trigger: 'blur' }]"
            prop="shareWxDescContent"
          >
            <el-input
              v-model="shareSettingForm.shareWxDescContent"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
              clearable
            />
          </el-form-item>

          <div class="submit-btn">
            <el-button type="primary" icon="el-icon-check" @click="saveSettingHandle"> 保存设置 </el-button>
          </div>
        </el-form>
      </div>

      <div class="setting-preview-area">
        <div
          class="preview-wrapper"
          v-if="shareSettingForm.shareWxDesc || shareSettingForm.shareWxTitle || shareSettingForm.shareWxImg"
        >
          <p class="preview-title">效果预览</p>
          <div class="share-preview">
            <div class="share-preview-msg">
              <p class="share-preview-msg-title">
                {{ shareSettingForm.shareWxTitleContent || '此处显示分享标题' }}
              </p>
              <div class="share-preview-body">
                <p class="share-preview-msg-desc">
                  {{
                    shareSettingForm.shareWxDescContent ||
                    '此处显示分享描述内容，描述内容会在微信聊天列表中显示给其他用户...'
                  }}
                </p>
                <img
                  v-if="shareSettingForm.shareWxImgUrl"
                  :src="shareSettingForm.shareWxImgUrl"
                  class="share-preview-img"
                />
                <div v-else class="share-preview-img-placeholder">
                  <i class="el-icon-link" />
                </div>
              </div>
            </div>
            <img :src="getUserInfos.avatar" class="share-user-avatar" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from './mixin'
import { getSettingRequest, saveSettingRequest } from '../../../api/project/setting'

export default {
  name: 'ShareSetting',
  mixins: [mixin],
  data() {
    return {
      shareSettingForm: {
        shareWxImg: false,
        shareWxImgUrl: null,
        shareWxTitle: false,
        shareWxTitleContent: null,
        shareWxDesc: false,
        shareWxDescContent: null
      }
    }
  },
  computed: {
    getUserInfos() {
      return this.$store.state.user
    }
  },
  mounted() {
    this.formKey = this.$route.query.key
    this.queryUserProjectSetting()
  },
  destroyed() {},
  methods: {
    uploadShareImgHandle(response) {
      this.shareSettingForm.shareWxImgUrl = response.data
    },
    queryUserProjectSetting() {
      getSettingRequest(this.formKey).then((res) => {
        if (res.data) {
          this.shareSettingForm = res.data
        }
      })
    },
    saveSettingHandle() {
      this.$refs['shareSettingForm'].validate((valid) => {
        // 图片检查
        if (this.shareSettingForm.shareWxImg && !this.shareSettingForm.shareWxImgUrl) {
          this.msgError('请上传分享显示图片')
          return
        }
        if (valid) {
          this.shareSettingForm.formKey = this.formKey
          saveSettingRequest(this.shareSettingForm).then(() => {
            this.msgSuccess('保存成功')
            this.queryUserProjectSetting()
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

.setting-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 60px;
  margin-top: 10px;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 40px;
  }
}

.setting-form-area {
  flex: 1;
  max-width: 600px;
  width: 100%;
}

.setting-preview-area {
  flex: 1;
  max-width: 400px;
  width: 100%;
}

.upload-area {
  margin: 16px 0;

  .project-setting-sub-label {
    margin-bottom: 12px;
  }
}

.share-img-upload {
  width: 120px;
  height: 120px;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
}

.share-img {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;

  i {
    font-size: 28px;
    margin-bottom: 8px;
    color: #9ca3af;
  }

  span {
    font-size: 13px;
  }
}

.preview-wrapper {
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.preview-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 24px;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background: #3b82f6;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.share-preview {
  width: 100%;
  border-radius: 12px;
  background-color: #f3f4f6;
  padding: 24px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 12px;
}

.share-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #e5e7eb;
  flex-shrink: 0;
  order: 2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.share-preview-msg {
  flex: 1;
  border-radius: 8px;
  background-color: #ffffff;
  color: #111827;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  position: relative;
  order: 1;
  max-width: 250px;

  &::before {
    content: '';
    position: absolute;
    right: -5px;
    top: 14px;
    width: 10px;
    height: 10px;
    background-color: #ffffff;
    transform: rotate(45deg);
    border-radius: 2px;
    box-shadow: 1px -1px 1px rgba(0, 0, 0, 0.02);
  }
}

.share-preview-msg-title {
  width: 100%;
  line-height: 1.4;
  color: #111827;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 6px;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-wrap: break-word;
}

.share-preview-body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.share-preview-msg-desc {
  flex: 1;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  word-wrap: break-word;
}

.share-preview-img,
.share-preview-img-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  flex-shrink: 0;
}

.share-preview-img {
  object-fit: cover;
  border: 1px solid #f3f4f6;
}

.share-preview-img-placeholder {
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 20px;
    color: #9ca3af;
  }
}

::v-deep .el-form-item {
  margin-bottom: 24px !important;
  margin-top: 12px !important;

  .el-input__inner,
  .el-textarea__inner {
    border-radius: 8px;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;

    &:focus {
      background-color: #ffffff;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }
}
</style>
