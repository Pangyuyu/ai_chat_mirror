import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || '请求失败'
      return Promise.reject(new Error(message))
    } else if (error.request) {
      return Promise.reject(new Error('网络错误，请检查后端服务是否运行'))
    } else {
      return Promise.reject(error)
    }
  }
)

// Chat API
const chatAPI = {
  /**
   * 发送消息到 AI（流式）
   * @param {Object} aiConfig - AI 配置
   * @param {Array} messages - 消息历史
   * @returns {ReadableStream} 流式响应
   */
  async sendStream(aiConfig, messages) {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ aiConfig, messages })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }))
      throw new Error(error.error || '请求失败')
    }

    return response.body
  },

  /**
   * 发送消息到 AI（非流式，兼容）
   * @param {Object} aiConfig - AI 配置
   * @param {Array} messages - 消息历史
   */
  async send(aiConfig, messages) {
    const response = await api.post('/chat/send-sync', {
      aiConfig,
      messages
    })
    return response.data
  },

  /**
   * 测试 AI 连接
   * @param {Object} aiConfig - AI 配置
   */
  async test(aiConfig) {
    const response = await api.post('/chat/test', {
      aiConfig
    })
    return response.data
  }
}

// Config API
const configAPI = {
  async getConfigs() {
    const response = await api.get('/config/configs')
    return response.data
  },

  async saveConfigs(data) {
    const response = await api.post('/config/configs', data)
    return response.data
  },

  async deleteConfig(id) {
    const response = await api.delete(`/config/configs/${id}`)
    return response.data
  },

  async getPresets() {
    const response = await api.get('/config/presets')
    return response.data
  },

  async savePreset(preset) {
    const response = await api.post('/config/presets', preset)
    return response.data
  },

  async deletePreset(id) {
    const response = await api.delete(`/config/presets/${id}`)
    return response.data
  }
}

export default {
  chat: chatAPI,
  config: configAPI
}
