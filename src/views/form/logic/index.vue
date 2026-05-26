<template>
  <div class="project-logic-container">
    <el-scrollbar class="scrollbar-container">
      <p class="logic_title">逻辑设置</p>
      <p class="text-desc">
        你可以为选择字段（单项选择、多项选择、图片单选、图片多选、评分、下拉框、）设定一些规则：在填写者选择某选项后，触发显示其他显示字段
      </p>
      <div class="show-logic-container">
        <div v-if="!logicList.length" class="not-logic-container empty-state-wrapper">
          <div class="empty-icon-box">
            <i class="el-icon-set-up" />
          </div>
          <p class="empty-text">当前表单暂无逻辑规则</p>
          <el-button type="primary" class="add-logic-btn" @click="addLogicHandle">
            <i class="el-icon-plus" /> 立即添加逻辑
          </el-button>
        </div>
        <div v-else class="logic-item-container">
          <el-row align="middle" justify="center" type="flex">
            <el-col :offset="1" :span="10">
              <el-tag class="message-tag" effect="plain" :type="isSave">{{ saveMessage }}</el-tag>
            </el-col>
            <el-col :offset="6" :span="6">
              <el-button size="mini" icon="el-icon-plus" :loading="isLoading" type="primary" @click="addLogicHandle">
                <i class="" />
                <span class="label">添加逻辑</span>
              </el-button>
            </el-col>
          </el-row>
          <el-divider />
          <div v-for="(logicItem, index) in logicList" :key="logicItem.id" class="logic-item">
            <div class="logic-item-delete" @click="handleRemoveLogicItem(index)">
              <i class="el-icon-delete" />
            </div>
            <el-row
              v-for="(cItem, cIndex) in logicItem.conditionList"
              :key="cIndex"
              :gutter="20"
              align="middle"
              class="mt5"
              justify="center"
              type="flex"
            >
              <el-col :span="3" class="text-center">
                <span v-if="cIndex === 0">如果：</span>
                <el-select
                  v-else
                  v-model="cItem.relation"
                  :disabled="cIndex !== 1"
                  @change="(val) => relationChangeHandle(val, logicItem)"
                >
                  <el-option label="并且" value="AND" />
                  <el-option label="或者" value="OR" />
                </el-select>
              </el-col>
              <el-col :span="7">
                <el-select
                  v-model="cItem.formItemId"
                  placeholder="请选择题目"
                  style="width: 80%"
                  @change="handleConditionChange(cItem)"
                >
                  <el-option
                    v-for="item in getConditionProjectItemList(logicItem)"
                    :key="item.id"
                    :label="item.textLabel"
                    :value="item.formItemId"
                  />
                </el-select>
              </el-col>
              <el-col :span="5">
                <el-select v-model="cItem.expression" placeholder="请选择条件">
                  <el-option
                    v-for="item in getConditionOptions(cItem.formItemId)"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-col>
              <el-col :span="6">
                <!--  下拉问题使用选项-->
                <el-select
                  v-if="getFormItemIdType(cItem.formItemId) !== 'RATE'"
                  v-model="cItem.optionValue"
                  placeholder="请选择选项"
                >
                  <el-option
                    v-for="item in getFormItemOptions(cItem.formItemId)"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <!--  评分使用数字框-->
                <el-input-number v-else v-model="cItem.optionValue" :min="0" />
              </el-col>
              <el-col :span="6">
                <el-button type="text" @click="addConditionHandle(logicItem, cItem)">
                  <i class="el-icon-circle-plus-outline" />
                </el-button>
                <el-button
                  v-if="cIndex !== 0"
                  class="remove"
                  type="text"
                  @click="removeConditionHandle(logicItem, index, cIndex)"
                >
                  <i class="el-icon-remove-outline" />
                </el-button>
              </el-col>
            </el-row>
            <div class="mt20" />
            <el-row v-for="(trigger, tindex) in logicItem.triggerList" :key="`t1${tindex}`" align="middle" type="flex">
              <el-col :span="3" class="text-center">
                <span>则显示</span>
              </el-col>
              <el-col :span="14">
                <el-select v-model="trigger.formItemId" placeholder="请选择问题">
                  <el-option
                    v-for="item in getTriggerItemList(logicItem)"
                    :key="item.id"
                    :label="item.textLabel"
                    :value="item.formItemId"
                    :disabled="item.disabled"
                  />
                </el-select>
                <span class="ml20">否则不显示</span>
              </el-col>
              <el-col :span="6">
                <el-button type="text" @click="addTriggerItemHandle(logicItem)">
                  <i class="el-icon-circle-plus-outline" />
                </el-button>
                <el-button
                  v-if="tindex !== 0"
                  class="remove"
                  type="text"
                  @click="removeTriggerItemHandle(logicItem, index, tindex)"
                >
                  <i class="el-icon-remove-outline" />
                </el-button>
              </el-col>
            </el-row>
            <el-divider />
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { jsonSimpleClone } from '@/utils'
import { getFormLogicRequest, listProjectItemRequest, saveFormLogicRequest } from '@/api/project/form'
import { debounce } from 'lodash'

export default {
  name: 'ProjectLogic',
  components: {},
  data() {
    return {
      saveMessage: '',
      isSave: 'info',
      isLoading: false,
      formKey: '',
      // 默认逻辑结构
      defaultLogicItem: {
        // 触发内容
        triggerList: [
          {
            formItemId: null,
            type: 'show'
          }
        ],
        // 逻辑条件
        conditionList: [
          {
            // 问题
            formItemId: null,
            // 条件 == > < >= <=
            expression: null,
            // 值
            optionValue: null,
            // 关系
            relation: 'AND'
          }
        ]
      },
      conditionOptions: [
        {
          value: 'eq',
          label: '选中'
        },
        {
          value: 'ne',
          label: '未选中'
        },
        {
          value: 'gt',
          label: '大于',
          types: ['RATE']
        },
        {
          value: 'ge',
          label: '大于等于',
          types: ['RATE']
        },
        {
          value: 'lt',
          label: '小于',
          types: ['RATE']
        },
        {
          value: 'le',
          label: '小于等于',
          types: ['RATE']
        }
      ],
      allProjectItemList: [],
      logicList: []
    }
  },
  watch: {
    logicList: {
      handler(val) {
        if (val) {
          this.saveProjectLogic(val)
          this.isSave = 'info'
          this.saveMessage = '正在处理'
        }
      },
      deep: true
    }
  },
  mounted() {
    this.formKey = this.$route.query.key
    this.queryProjectItems()
    this.queryProjectLogic()
  },
  methods: {
    addConditionHandle(logicItem, cItem) {
      logicItem.conditionList.push({ relation: cItem.relation })
    },
    removeConditionHandle(logicItem, logicIndex, index) {
      logicItem.conditionList.splice(index, 1)
    },
    addTriggerItemHandle(logicItem) {
      logicItem.triggerList.push({})
    },
    removeTriggerItemHandle(logicItem, logicIndex, index) {
      logicItem.triggerList.splice(index, 1)
    },
    addLogicHandle() {
      this.isLoading = true
      let newLogicItem = jsonSimpleClone(this.defaultLogicItem)
      newLogicItem.id = new Date().getTime()
      this.logicList.push(newLogicItem)
    },
    getConditionOptions(formItemId) {
      if (!formItemId) return []
      // 截取第一个数字前面的字符串
      let type = formItemId.replace(/\d+/, '').toUpperCase()
      let conditionOptions = jsonSimpleClone(this.conditionOptions)
      if (type === 'RATE') {
        // 移除前两个选项
        conditionOptions.splice(0, 2)
      } else {
        conditionOptions.splice(2, 4)
      }
      return conditionOptions
    },
    // 处理逻辑连接 只允许同时and 或者同时OR 负责逻辑会冲突
    relationChangeHandle(val, logicItem) {
      logicItem.conditionList.forEach((item) => {
        item.relation = val
      })
    },
    // 获取条件可选择问题
    getConditionProjectItemList(logicItem) {
      return jsonSimpleClone(this.allProjectItemList).filter((item) => {
        return ['RADIO', 'CHECKBOX', 'SELECT', 'IMAGE_SELECT', 'RATE'].includes(item.type)
      })
    },
    // 获取显示问题可选择问题
    getTriggerItemList(logicItem) {
      // 作为逻辑条件的问题不能作为显示问题·
      let selectedFormItemList = logicItem.conditionList.map((item) => item.formItemId)
      let projectItemList = jsonSimpleClone(this.allProjectItemList)
      projectItemList.forEach((item) => {
        if (selectedFormItemList.includes(item.formItemId)) {
          item.disabled = true
        }
      })
      return projectItemList
    },
    /**
     * 获取选择问题的选项
     * @param formItemId
     * @returns {*[]|*}
     */
    getFormItemOptions(formItemId) {
      let formItem = this.allProjectItemList.find((item) => item.formItemId == formItemId)
      if (formItem) {
        return formItem.scheme.config.options
      }
      return []
    },
    handleConditionChange(cItem) {
      this.$set(cItem, 'optionValue', null)
    },
    handleRemoveLogicItem(index) {
      console.log(index)
      // console.log(this.logicList.splice(index, 1))
      this.logicList.splice(index, 1)
    },
    getFormItemIdType(formItemId) {
      if (!formItemId) return ''
      return formItemId.replace(/\d+/, '').toUpperCase()
    },
    // 查询项目逻辑数据
    queryProjectLogic() {
      getFormLogicRequest({ formKey: this.formKey }).then((res) => {
        if (res.data) {
          this.logicList = res.data.scheme ? res.data.scheme : []
        }
      })
    },
    //
    queryProjectItems() {
      listProjectItemRequest({ key: this.formKey }).then((res) => {
        this.allProjectItemList = res.data.filter((item) => {
          return item.type !== 'PAGINATION'
        })
      })
    },
    saveProjectLogic: debounce(function (logicList) {
      let data = { formKey: this.formKey, scheme: logicList }
      saveFormLogicRequest(data).then((res) => {
        this.isLoading = false
        this.isSave = ''
        this.saveMessage = '已保存'
      })
    }, 300)
  }
}
</script>

<style lang="scss" scoped>
.project-logic-container {
  width: 100%;
  height: 100%;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  .scrollbar-container {
    width: 100%;
    height: 100%;

    ::v-deep .el-scrollbar__wrap {
      overflow-x: hidden;
    }

    ::v-deep .el-scrollbar__view {
      padding: 40px 5%;
      max-width: 1400px;
      min-width: 900px; /* 保证内部下拉框等不会在窄屏下挤压错位 */
      margin: 0 auto;
      box-sizing: border-box;
    }
  }

  .logic_title {
    font-size: 24px;
    font-weight: 600;
    height: 32px;
    line-height: 32px;
    color: #111827;
    text-align: left;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }
}

.text-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
  margin-bottom: 32px;
}

/* 无逻辑状态 */
.empty-state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0 80px;

  .empty-icon-box {
    width: 80px;
    height: 80px;
    background-color: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;

    i {
      font-size: 36px;
      color: #9ca3af;
    }
  }

  .empty-text {
    font-size: 15px;
    color: #6b7280;
    margin-bottom: 32px;
    margin-top: 0;
  }

  .add-logic-btn {
    border-radius: 8px;
    padding: 12px 28px;
    font-weight: 600;
    font-size: 14px;
    background: linear-gradient(135deg, #4080ff 0%, #3370ff 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(51, 112, 255, 0.2);
    transition: all 0.3s ease;

    i {
      margin-right: 6px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(51, 112, 255, 0.3);
      filter: brightness(1.05);
    }
  }
}

/* 主卡片区域 */
.show-logic-container {
  padding: 32px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
  min-height: 50vh;
  transition: all 0.3s ease;
}

/* 头部操作栏 */
.logic-item-container {
  .message-tag {
    border: none;
    background-color: #f0fdf4;
    color: #16a34a;
    padding: 0 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    height: 32px;
  }

  /* 添加逻辑按钮精修 */
  .el-button--primary {
    border-radius: 8px;
    height: 32px;
    padding: 0 16px;
    font-weight: 600;
    border: none;
    background: linear-gradient(135deg, #4080ff 0%, #3370ff 100%);
    box-shadow: 0 2px 8px rgba(51, 112, 255, 0.3);
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(51, 112, 255, 0.4);
      filter: brightness(1.05);
    }
  }
}

/* 逻辑项大卡片 */
.logic-item {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px 32px;
  margin-bottom: 24px;
  border: 1px solid #edf2f7;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.015);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
    border-color: #e2e8f0;
  }

  /* 逻辑规则块里的高级引导词标签 */
  .text-center {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 12px;

    span {
      display: inline-block;
      padding: 4px 12px;
      background-color: rgba(51, 112, 255, 0.06);
      color: #3370ff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* 如果这个位置是并/或的选择器，让它和普通的文本框看起来不同，更像是个蓝色药丸 */
    ::v-deep .el-select {
      width: 72px;
      .el-input__inner {
        background-color: rgba(51, 112, 255, 0.06) !important;
        color: #3370ff !important;
        font-weight: 600;
        border: none !important;
        text-align: center;
        padding-left: 8px;
        padding-right: 20px;
        height: 28px !important;
        line-height: 28px !important;
      }
      .el-input__suffix {
        right: 2px;
        color: rgba(51, 112, 255, 0.6);
      }
      .el-input__icon {
        line-height: 28px !important;
      }
    }
  }

  .ml20 {
    margin-left: 12px;
    color: #9ca3af;
    font-size: 13px;
    font-weight: 500;
  }

  /* 右上角删除逻辑项按钮，还原极简默认样式 */
  .logic-item-delete {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    box-shadow: none;
    transition: all 0.25s ease;

    i {
      font-size: 18px;
    }

    &:hover {
      background-color: transparent;
      color: #ef4444;
    }
  }

  .mt5 {
    margin-top: 12px;
  }

  .mt20 {
    margin-top: 20px;
  }

  /* 为每一行条件（包括如果和则显示）加上下间距 */
  .el-row {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* 解决 el-select 100% 宽度导致“否则不显示”换行的问题 */
  .el-col-14 {
    display: flex;
    align-items: center;

    ::v-deep .el-select {
      flex: 1;
    }
  }
}

/* + / - 按钮美化，还原原生图标感并带彩色 */
.el-icon-circle-plus-outline {
  font-size: 20px;
  vertical-align: middle;
  transition: all 0.25s ease;
  color: #3b82f6;
}

.el-icon-remove-outline {
  font-size: 20px;
  vertical-align: middle;
  transition: all 0.25s ease;
  color: #ef4444;
}

.el-button--text {
  padding: 0;
  margin-right: 8px; /* 加减号间距 */

  &:hover i.el-icon-circle-plus-outline,
  &:hover i.el-icon-remove-outline {
    filter: brightness(0.8);
    transform: scale(1.1);
  }
}

/* 全局覆盖 el-select / el-input 的内部样式（深度美化组件外观） */
::v-deep .el-select,
::v-deep .el-input-number {
  width: 100%;

  .el-input__inner {
    border-radius: 8px;
    border: 1px solid transparent;
    background-color: #f3f4f6;
    height: 36px;
    line-height: 36px;
    font-size: 13px;
    color: #1f2937;
    transition: all 0.25s ease;

    &:hover {
      background-color: #f9fafb;
      border-color: rgba(51, 112, 255, 0.4);
    }

    &:focus {
      background-color: #ffffff;
      border-color: #3370ff;
      box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.1);
    }
  }
}

::v-deep .el-divider {
  background-color: #f3f4f6;
  margin: 24px 0;
}
</style>
