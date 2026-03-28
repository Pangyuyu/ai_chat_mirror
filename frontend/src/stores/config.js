import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useConfigStore = defineStore('config', () => {
  const aiConfigs = ref([])
  const presets = ref([])

  // 默认 AI 配置
  const defaultAIConfig = {
    id: '',
    roleName: '',
    provider: 'aliyun',
    model: 'qwen-turbo',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 1000
  }

  function loadConfigs() {
    const saved = localStorage.getItem('aiConfigs')
    if (saved) {
      aiConfigs.value = JSON.parse(saved)
    }
  }

  function saveConfigs(configs) {
    aiConfigs.value = configs
    localStorage.setItem('aiConfigs', JSON.stringify(configs))
  }

  function addConfig(config) {
    config.id = Date.now().toString()
    aiConfigs.value.push(config)
    localStorage.setItem('aiConfigs', JSON.stringify(aiConfigs.value))
  }

  function updateConfig(id, config) {
    const index = aiConfigs.value.findIndex(c => c.id === id)
    if (index >= 0) {
      aiConfigs.value[index] = { ...config, id }
      localStorage.setItem('aiConfigs', JSON.stringify(aiConfigs.value))
    }
  }

  function deleteConfig(id) {
    aiConfigs.value = aiConfigs.value.filter(c => c.id !== id)
    localStorage.setItem('aiConfigs', JSON.stringify(aiConfigs.value))
  }

  // 预设管理
  async function loadPresets() {
    try {
      const response = await api.config.getPresets()
      presets.value = response.data || []
    } catch (error) {
      console.error('加载预设失败:', error)
    }
  }

  async function savePreset(preset) {
    try {
      await api.config.savePreset(preset)
      await loadPresets()
    } catch (error) {
      console.error('保存预设失败:', error)
      throw error
    }
  }

  async function deletePreset(id) {
    try {
      await api.config.deletePreset(id)
      await loadPresets()
    } catch (error) {
      console.error('删除预设失败:', error)
      throw error
    }
  }

  return {
    aiConfigs,
    presets,
    defaultAIConfig,
    loadConfigs,
    saveConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    loadPresets,
    savePreset,
    deletePreset
  }
})
