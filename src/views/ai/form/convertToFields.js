// 解析json为字段
import TduckForm from 'tduck-form-generator'
import { toLower } from 'lodash'

export const parseJsonToFields = (json) => {
  if (!json) {
    return { fields: [], formInfo: { title: '', description: '' } }
  }

  // 动态从 TduckForm.GenerateConfig.allComponents 中获取基础组件列表
  const allComponents = TduckForm.GenerateConfig?.allComponents || []
  const basicCompGroup = allComponents.find((group) => group.title === '基础组件')
  const basicComponents = basicCompGroup ? basicCompGroup.list : allComponents[0]?.list || []

  const inputConfig = basicComponents.find((item) => item.typeId === 'INPUT')
  const textareaConfig = basicComponents.find((item) => item.typeId === 'TEXTAREA')
  const dateConfig = basicComponents.find((item) => item.typeId === 'DATE')
  const numberConfig = basicComponents.find((item) => item.typeId === 'NUMBER')
  const radioConfig = basicComponents.find((item) => item.typeId === 'RADIO')
  const checkboxConfig = basicComponents.find((item) => item.typeId === 'CHECKBOX')
  const selectConfig = basicComponents.find((item) => item.typeId === 'SELECT')

  const filedTypeMap = {
    单行文本: inputConfig,
    多行文本: textareaConfig,
    日期: dateConfig,
    数字: numberConfig,
    单选: radioConfig,
    多选: checkboxConfig,
    下拉: selectConfig
  }

  let jsonArr
  try {
    jsonArr = typeof json === 'string' ? JSON.parse(json) : json
  } catch (e) {
    return { fields: [], formInfo: { title: '', description: '' } }
  }

  if (!jsonArr) {
    return { fields: [], formInfo: { title: '', description: '' } }
  }

  // 兼容非数组对象，尝试获取其中的 fields/questions/list 数组
  if (!Array.isArray(jsonArr)) {
    if (jsonArr.fields && Array.isArray(jsonArr.fields)) {
      jsonArr = jsonArr.fields
    } else if (jsonArr.questions && Array.isArray(jsonArr.questions)) {
      jsonArr = jsonArr.questions
    } else if (jsonArr.list && Array.isArray(jsonArr.list)) {
      jsonArr = jsonArr.list
    } else {
      return { fields: [], formInfo: { title: '', description: '' } }
    }
  }

  const time = new Date().getTime()
  const formInfo = {
    title: '',
    description: ''
  }
  // 转换成表单数据
  const fields = jsonArr
    .map((item, index) => {
      if (!item) return null
      if (item.type == '问卷标题') {
        formInfo.title = item.title
        return null
      } else if (item.type == '问卷描述') {
        formInfo.description = item.title
        return null
      } else {
        const fieldTemplate = filedTypeMap[item.type]
        if (!fieldTemplate) return null

        const field = JSON.parse(JSON.stringify(fieldTemplate))
        if (field.config) {
          field.config.label = item.title || ''
        }
        if (field.config && field.config.options && Array.isArray(item.options)) {
          field.config.options = item.options.map((op, index) => {
            return {
              type: op == '其他' ? 'input' : 'option',
              label: op,
              value: index + 1
            }
          })
        }
        // 找到题目数据定义
        if (field.config) {
          field.config.formId = `${toLower(field.typeId)}${+time + index}`
          field.vModel = field.config.formId
        }
        return field
      }
    })
    .filter((item) => item)
  return {
    fields,
    formInfo
  }
}

const test = () => {
  const str = `[{"type": "问卷标题","title": "远程办公体验调查问卷"},{"type": "问卷描述","title": "本次调查旨在了解您的远程办公体验，关注工作效率、沟通方式和居家环境等方面。"},{"type": "单选","title": "与在办公室相比，您远程办公的整体工作效率如何？","options": ["显著提升","略有提升","基本持平","略有下降","显著下降"]},{"type": "多选","title": "在日常工作中，您最常使用的沟通工均有哪些？","options": ["即时通讯（如微信、飞书）","视频会议（如腾讯会议、Zoom）","电话","电子邮件","内部协作平台（如Confluence、Notion）"]},{"type": "单选","title": "您目前的居家办公环境（如噪音、网络、桌椅等）是否有利于您高效工作？","options": ["非常有利","比较有利","一般","比较不利","非常不利"]},{"type": "单选","title": "在远程办公时，您认为团队协作面临的最大挑战是什么？","options": ["沟通效率低下","信息不同步","任务分配和进度跟进困难","员工归属感和团队氛围减弱","技术设备支持不足"]},{"type": "多行文本","title": "请分享一个您认为能帮助改善远程办公体验的具体建议。"}]`
  console.log(parseJsonToFields(str))
}

test()
