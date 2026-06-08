import request from '@/api/index'
import { postRequest } from '../baseRequest'

// 上传文档解析
export function parseDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/user/form/import/parse-doc',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// AI 优化问卷内容
export function aiOptimizeRequest(data) {
  return postRequest('/user/form/import/ai-optimize', data)
}

// 获取 AI 配置
export function getAiConfig() {
  return request({
    url: '/sys/config/ai',
    method: 'get'
  })
}

// 保存 AI 配置
export function saveAiConfig(data) {
  return request({
    url: '/sys/config/ai',
    method: 'post',
    data: data
  })
}

// 测试 AI 连接
export function testAiConnection(data) {
  return request({
    url: '/sys/config/ai/test',
    method: 'post',
    data: data
  })
}
