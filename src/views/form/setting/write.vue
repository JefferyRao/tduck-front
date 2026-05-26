<template>
  <div class="project-setting-view">
    <div class="setting-header">
      <h3 class="setting-title">回收设置</h3>
      <p class="setting-desc">自定义表单收集时间、次数，以及限制填写环境等</p>
    </div>
    <el-divider />
    <el-form
      ref="writeSettingForm"
      :model="writeSettingForm"
      :rules="settingRules"
      label-position="left"
      class="setting-form"
    >
      <!-- 密码填写 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">
            密码填写
            <el-tooltip class="item" content="开启后需要输入密码才能进入填写页面" effect="dark" placement="top">
              <i class="el-icon-info" />
            </el-tooltip>
          </p>
          <el-switch v-model="writeSettingForm.passwordWriteStatus" />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.passwordWriteStatus" class="setting-sub-box">
            <el-form-item
              :rules="[{ required: true, message: '请输入填写密码', trigger: 'blur' }]"
              prop="writePassword"
            >
              <el-input
                v-model="writeSettingForm.writePassword"
                placeholder="请设置访问密码"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 每个微信答题次数限制 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">微信答题次数限制</p>
          <el-switch
            v-model="writeSettingForm.wxWriteCountLimitStatus"
            @change="
              () => {
                writeSettingForm.recordWxUser = true
                writeSettingForm.onlyWxWrite = true
              }
            "
          />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.wxWriteCountLimitStatus" class="setting-sub-box">
            <div class="sub-box-row">
              <el-select v-model="writeSettingForm.wxWriteCountLimitDateType" class="date-type-select">
                <el-option v-for="d in dateRangeList" :key="d.value" :label="d.label" :value="d.value">
                  {{ d.label }}
                </el-option>
              </el-select>
              <span class="sub-text">限制答题</span>
              <el-input-number v-model="writeSettingForm.wxWriteCountLimit" :min="1" class="limit-input" />
              <span class="sub-text">次</span>
            </div>
            <el-input
              v-model="writeSettingForm.wxWriteCountLimitText"
              class="mt10"
              placeholder="自定义提示文案：该微信已经提交过数据，不可重复提交..."
            />
          </div>
        </el-collapse-transition>
      </div>

      <!-- 每个IP答题次数限制 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">
            IP答题次数限制
            <el-tooltip placement="top" content="限制同一个IP地址的提交次数，防止恶意刷单">
              <i class="el-icon-info" />
            </el-tooltip>
          </p>
          <el-switch v-model="writeSettingForm.ipWriteCountLimitStatus" />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.ipWriteCountLimitStatus" class="setting-sub-box">
            <div class="sub-box-row">
              <el-select v-model="writeSettingForm.ipWriteCountLimitDateType" class="date-type-select">
                <el-option v-for="d in dateRangeList" :key="d.value" :label="d.label" :value="d.value">
                  {{ d.label }}
                </el-option>
              </el-select>
              <span class="sub-text">限制答题</span>
              <el-input-number v-model="writeSettingForm.ipWriteCountLimit" :min="1" class="limit-input" />
              <span class="sub-text">次</span>
            </div>
            <el-input
              v-model="writeSettingForm.ipWriteCountLimitText"
              class="mt10"
              placeholder="自定义提示文案：该IP已经提交过数据，不可重复提交..."
            />
          </div>
        </el-collapse-transition>
      </div>

      <!-- 每个账号答题次数限制 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">
            账号答题次数限制
            <el-tooltip placement="top" content="限制同一个登录账号的提交次数">
              <i class="el-icon-info" />
            </el-tooltip>
          </p>
          <el-switch v-model="writeSettingForm.accountWriteCountLimitStatus" />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.accountWriteCountLimitStatus" class="setting-sub-box">
            <div class="sub-box-row">
              <el-select v-model="writeSettingForm.accountWriteCountLimitDateType" class="date-type-select">
                <el-option v-for="d in dateRangeList" :key="d.value" :label="d.label" :value="d.value">
                  {{ d.label }}
                </el-option>
              </el-select>
              <span class="sub-text">限制答题</span>
              <el-input-number v-model="writeSettingForm.accountWriteCountLimit" :min="1" class="limit-input" />
              <span class="sub-text">次</span>
            </div>
            <el-input
              v-model="writeSettingForm.accountWriteCountLimitText"
              class="mt10"
              placeholder="自定义提示文案：该账号已经提交过数据，不可重复提交..."
            />
          </div>
        </el-collapse-transition>
      </div>

      <!-- 每台设备次数限制 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">
            设备答题次数限制
            <el-tooltip placement="top" content="依赖浏览器的本地存储，换浏览器或清空缓存后会失效">
              <i class="el-icon-info" />
            </el-tooltip>
          </p>
          <el-switch v-model="writeSettingForm.deviceWriteCountLimitStatus" />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.deviceWriteCountLimitStatus" class="setting-sub-box">
            <div class="sub-box-row">
              <span class="sub-text">总共限制答题</span>
              <el-input-number v-model="writeSettingForm.deviceWriteCountLimit" :min="1" class="limit-input" />
              <span class="sub-text">次</span>
            </div>
            <el-input
              v-model="writeSettingForm.deviceWriteCountLimitText"
              class="mt10"
              placeholder="自定义提示文案：该设备已经提交过数据，不可重复提交..."
            />
          </div>
        </el-collapse-transition>
      </div>

      <!-- 设定答题次数上限 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">
            表单收集总数上限
            <el-tooltip placement="top" content="当表单收集的数据量达到该上限后，将停止收集并提示用户">
              <i class="el-icon-info" />
            </el-tooltip>
          </p>
          <el-switch v-model="writeSettingForm.totalWriteCountLimitStatus" />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.totalWriteCountLimitStatus" class="setting-sub-box">
            <div class="sub-box-row">
              <el-select v-model="writeSettingForm.totalWriteCountLimitDateType" class="date-type-select">
                <el-option v-for="d in dateRangeList" :key="d.value" :label="d.label" :value="d.value">
                  {{ d.label }}
                </el-option>
              </el-select>
              <span class="sub-text">最多收集</span>
              <el-input-number v-model="writeSettingForm.totalWriteCountLimit" :min="1" class="limit-input" />
              <span class="sub-text">份</span>
            </div>
            <el-input
              v-model="writeSettingForm.totalWriteCountLimitText"
              class="mt10"
              placeholder="自定义提示文案：该表单收集数据已经达到上限..."
            />
          </div>
        </el-collapse-transition>
      </div>

      <!-- 允许填写时间 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">
            定时收集与访问时间限制
            <el-tooltip placement="top" content="设定用户可以访问表单和提交数据的具体时间范围">
              <i class="el-icon-info" />
            </el-tooltip>
          </p>
          <el-switch v-model="writeSettingForm.writeInterviewTimeStatus" />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.writeInterviewTimeStatus" class="setting-sub-box">
            <div class="mb10">
              <el-checkbox v-model="writeSettingForm.writeInterviewDayTimeStatus"> 每天特定时间段可访问 </el-checkbox>
            </div>

            <div v-if="writeSettingForm.writeInterviewDayTimeStatus" class="time-range-box">
              <div class="mb10">
                <span class="sub-text label-text">生效日期：</span>
                <el-date-picker
                  v-model="writeSettingForm.writeInterviewDateRange"
                  type="daterange"
                  value-format="yyyy-MM-dd"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="full-width-picker"
                />
              </div>
              <div class="mb10">
                <span class="sub-text label-text">每天时段：</span>
                <el-time-picker
                  v-model="writeSettingForm.writeInterviewTimeRange"
                  is-range
                  range-separator="至"
                  value-format="HH:mm:ss"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  class="full-width-picker"
                />
              </div>
            </div>

            <div v-else class="mb10">
              <span class="sub-text label-text">生效时间：</span>
              <el-date-picker
                v-model="writeSettingForm.writeInterviewDateTimeRange"
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="full-width-picker"
              />
            </div>

            <div class="checkbox-group mb10">
              <span class="sub-text label-text">生效星期：</span>
              <el-checkbox-group v-model="writeSettingForm.writeInterviewTimeWhichDays" class="days-checkbox">
                <el-checkbox label="2"> 周一 </el-checkbox>
                <el-checkbox label="3"> 周二 </el-checkbox>
                <el-checkbox label="4"> 周三 </el-checkbox>
                <el-checkbox label="5"> 周四 </el-checkbox>
                <el-checkbox label="6"> 周五 </el-checkbox>
                <el-checkbox label="7"> 周六 </el-checkbox>
                <el-checkbox label="1"> 周日 </el-checkbox>
              </el-checkbox-group>
            </div>

            <el-input
              v-model="writeSettingForm.writeInterviewTimeText"
              class="mt10"
              placeholder="自定义提示文案：当前不在表单开放时间内..."
            />
          </div>
        </el-collapse-transition>
      </div>

      <!-- 只能在微信中填写 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">只能在微信中填写</p>
          <el-switch
            v-model="writeSettingForm.onlyWxWrite"
            @change="
              (val) => {
                if (!writeSettingForm.onlyWxWrite && !val) {
                  writeSettingForm.recordWxUser = false
                }
              }
            "
          />
        </div>
      </div>

      <!-- 记录微信用户个人信息 -->
      <div class="setting-group">
        <div class="setting-item">
          <p class="label">获取微信用户个人信息</p>
          <el-switch
            v-model="writeSettingForm.recordWxUser"
            @change="
              (val) => {
                if (!writeSettingForm.onlyWxWrite && val) {
                  writeSettingForm.onlyWxWrite = true
                }
              }
            "
          />
        </div>
        <el-collapse-transition>
          <div v-if="writeSettingForm.recordWxUser" class="mt10">
            <p class="project-setting-sub-label">
              <i class="el-icon-warning-outline" /> 开启后将会要求用户授权登录，获取用户的微信昵称、头像等信息
            </p>
          </div>
        </el-collapse-transition>
      </div>

      <div class="submit-btn-wrapper">
        <el-button type="primary" class="save-btn" icon="el-icon-check" @click="saveSettingHandle">
          保存设置
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import mixin from './mixin'
import { getSettingRequest, saveSettingRequest } from '../../../api/project/setting'

export default {
  name: 'WriteSetting',
  mixins: [mixin],
  data() {
    return {
      dateRangeList: [
        { value: 1, label: '总共' },
        { value: 2, label: '每天' },
        { value: 3, label: '每周' },
        { value: 4, label: '每月' }
      ],
      settingRules: {},
      writeSettingForm: {
        // 仅在微信填写
        onlyWxWrite: false,
        // 记录微信用户信息
        recordWxUser: false,
        // 恢复提交数据
        saveSubmitStatus: false,
        // 保存未恢复数据
        saveNotSubmitStatus: false,
        // 密码填写状态
        passwordWriteStatus: false,
        // 填写密码
        writePassword: '',
        // 每个微信答题次数限制
        wxWriteCountLimitStatus: false,
        // 次数
        wxWriteCountLimit: 1,
        // 日期范围
        wxWriteCountLimitDateType: 1,
        // 文案
        wxWriteCountLimitText: '',
        // 每个IP答题次数限制
        ipWriteCountLimitStatus: false,
        // 次数
        ipWriteCountLimit: 1,
        // 日期范围
        ipWriteCountLimitDateType: 1,
        // 文案
        ipWriteCountLimitText: '',
        // 每个账号答题次数限制
        accountWriteCountLimitStatus: false,
        // 次数
        accountWriteCountLimit: 1,
        // 日期范围
        accountWriteCountLimitDateType: 1,
        // 文案
        accountWriteCountLimitText: '',
        // 每台设备答题次数限制
        deviceWriteCountLimitStatus: false,
        // 次数
        deviceWriteCountLimit: 1,
        // 文案
        deviceWriteCountLimitText: '',
        // 累计答题数量
        totalWriteCountLimitStatus: false,
        // 次数
        totalWriteCountLimit: 1,
        // 日期范围
        totalWriteCountLimitDateType: 1,
        // 文案
        totalWriteCountLimitText: '',
        // 访问时间
        writeInterviewTimeStatus: false,
        // 访问时间是否是一天内的某些小时
        writeInterviewDayTimeStatus: false,
        // 允许访问访问时间范围
        writeInterviewDateTimeRange: [],
        // 允许访问访问日期范围
        writeInterviewDateRange: [],
        // 允许访问访问时间范围
        writeInterviewTimeRange: [],
        // 每周允许周几访问
        writeInterviewTimeWhichDays: [],
        writeInterviewTimeText: ''
      }
    }
  },
  mounted() {
    this.queryUserProjectSetting()
  },
  methods: {
    queryUserProjectSetting() {
      getSettingRequest(this.formKey).then((res) => {
        if (res.data) {
          this.writeSettingForm = res.data
        }
      })
    },
    saveSettingHandle() {
      this.$refs['writeSettingForm'].validate((valid) => {
        if (valid) {
          this.writeSettingForm.formKey = this.formKey
          saveSettingRequest(this.writeSettingForm).then(() => {
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

.project-setting-view {
  .setting-header {
    margin-bottom: 20px;

    .setting-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .setting-desc {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }
  }

  .el-divider {
    margin: 20px 0;
    background-color: #f3f4f6;
  }

  .setting-form {
    max-width: 720px;
  }

  .setting-group {
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 16px;
    margin-bottom: 16px;

    // Use nth-last-child(2) since the submit button wrapper is the last child
    &:nth-last-child(2) {
      border-bottom: none;
    }

    .setting-item {
      border-bottom: none;
      padding: 8px 0;
    }
  }

  .setting-sub-box {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    margin-top: 8px;
    border: 1px solid #f3f4f6;

    .sub-box-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .date-type-select {
        width: 120px;
        margin-right: 12px;
      }

      .sub-text {
        font-size: 14px;
        color: #4b5563;
      }

      .limit-input {
        width: 120px;
        margin: 0 12px;
      }
    }

    .time-range-box {
      background: #ffffff;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      margin-bottom: 12px;
    }

    .label-text {
      display: inline-block;
      width: 80px;
      text-align: right;
      margin-right: 12px;
      color: #6b7280;
    }

    .full-width-picker {
      width: calc(100% - 100px);
      max-width: 400px;
    }

    .days-checkbox {
      display: inline-block;
      width: calc(100% - 100px);
      vertical-align: top;

      .el-checkbox {
        margin-right: 20px;
        margin-bottom: 8px;
      }
    }

    .mt10 {
      margin-top: 12px;
    }

    .mb10 {
      margin-bottom: 12px;
    }
  }

  .project-setting-sub-label {
    font-size: 13px;
    color: #e6a23c;
    margin: 8px 0 0 0;
    background: #fdf6ec;
    padding: 8px 12px;
    border-radius: 6px;
    display: inline-block;
    border: 1px solid #faecd8;

    i {
      margin-right: 4px;
      font-size: 14px;
    }
  }

  .submit-btn-wrapper {
    margin-top: 10px;
    padding-top: 10px;

    .save-btn {
      padding: 10px 24px;
      font-size: 14px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(64, 158, 255, 0.15);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 4px 8px rgba(64, 158, 255, 0.25);
        transform: translateY(-1px);
      }
    }
  }
}
</style>
