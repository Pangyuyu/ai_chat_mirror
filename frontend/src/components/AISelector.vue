<template>
  <div class="ai-selector">
    <div class="selector-header">
      <h3>
        <el-icon><User /></el-icon>
        AI {{ aiIndex }}: {{ localConfig?.roleName || '未选择' }}
      </h3>
      <el-button link type="primary" @click="showManageDialog = true">
        <el-icon><Setting /></el-icon>
        管理模型
      </el-button>
    </div>

    <el-select
      v-model="selectedConfigId"
      placeholder="选择 AI 模型"
      style="width: 100%"
      @change="onConfigChange"
    >
      <el-option
        v-for="cfg in savedConfigs"
        :key="cfg.id"
        :label="cfg.name"
        :value="cfg.id"
      >
        <div class="config-option">
          <span class="config-name">{{ cfg.name }}</span>
          <span class="config-model">{{ cfg.model }}</span>
        </div>
      </el-option>
    </el-select>

    <!-- 本次对话设置 -->
    <div class="session-settings">
      <el-form label-position="top" size="small">
        <el-form-item label="角色名称">
          <el-input
            v-model="localConfig.roleName"
            placeholder="如：程序员小明"
            @input="emitUpdate"
          />
        </el-form-item>
        <el-form-item label="系统提示词（本次对话）">
          <el-input
            v-model="localConfig.systemPrompt"
            type="textarea"
            :rows="3"
            placeholder="如：你是一个有 5 年经验的后端程序员，擅长技术讨论..."
            @input="emitUpdate"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 管理模型对话框 -->
    <el-dialog v-model="showManageDialog" title="管理 AI 模型" width="600px">
      <div class="model-list">
        <div v-if="savedConfigs.length === 0" class="empty-list">
          <p>暂无配置的模型</p>
          <p class="hint">点击下方按钮添加新模型</p>
        </div>
        <div v-else class="models">
          <div
            v-for="cfg in savedConfigs"
            :key="cfg.id"
            class="model-item"
            :class="{ active: cfg.id === selectedConfigId }"
          >
            <div class="model-info">
              <div class="model-name">{{ cfg.name }}</div>
              <div class="model-detail">{{ cfg.provider }} / {{ cfg.model }}</div>
            </div>
            <div class="model-actions">
              <el-button
                link
                type="primary"
                @click="editConfig(cfg)"
              >
                编辑
              </el-button>
              <el-button
                v-if="cfg.id !== selectedConfigId"
                link
                type="primary"
                @click="selectConfig(cfg.id)"
              >
                选择
              </el-button>
              <el-button link type="danger" @click="deleteConfig(cfg.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showAddForm = true">
            <el-icon><Plus /></el-icon>
            添加模型
          </el-button>
          <el-button @click="showManageDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加/编辑模型表单 -->
    <el-dialog v-model="showAddForm" :title="editingId ? '编辑 AI 模型' : '添加 AI 模型'" width="500px">
      <el-form :model="newConfig" label-position="top">
        <el-form-item label="配置名称">
          <el-input v-model="newConfig.name" placeholder="如：通义千问 - 主账号" />
        </el-form-item>
        <el-form-item label="提供商">
          <el-select v-model="newConfig.provider" placeholder="选择提供商" style="width: 100%">
            <el-option label="通义千问 (阿里云)" value="aliyun" />
            <el-option label="Kimi (月之暗面)" value="moonshot" />
            <el-option label="智谱 AI" value="zhipu" />
            <el-option label="文心一言 (百度)" value="baidu" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="OpenAI 兼容" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input v-model="newConfig.model" placeholder="如：qwen-turbo" />
        </el-form-item>
        <el-form-item label="API Base URL">
          <el-input v-model="newConfig.baseUrl" placeholder="API 地址" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="newConfig.apiKey" type="password" show-password />
        </el-form-item>
        <el-form-item label="默认角色名称">
          <el-input v-model="newConfig.roleName" placeholder="如：AI 助手" />
        </el-form-item>
        <el-form-item label="默认系统提示词">
          <el-input v-model="newConfig.systemPrompt" type="textarea" :rows="3" placeholder="保存后仍可修改本次对话的提示词" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="testing"
            @click="testConnection"
            style="width: 100%"
          >
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddForm = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">
          {{ editingId ? '更新' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Delete, Plus, Connection } from '@element-plus/icons-vue'
import api from '../api'

const props = defineProps({
  aiIndex: Number,
  config: Object
})

const emit = defineEmits(['update:config'])

const savedConfigs = ref([])
const selectedConfigId = ref('')
const showManageDialog = ref(false)
const showAddForm = ref(false)
const editingId = ref('')
const testing = ref(false)

const localConfig = reactive({
  id: '',
  name: '',
  provider: '',
  model: '',
  baseUrl: '',
  apiKey: '',
  roleName: '',
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 1000
})

const newConfig = ref({
  id: '',
  name: '',
  provider: 'aliyun',
  model: '',
  baseUrl: '',
  apiKey: '',
  roleName: '',
  systemPrompt: ''
})

// 监听外部 config 变化
watch(() => props.config, (newVal) => {
  if (newVal && newVal.id) {
    selectedConfigId.value = newVal.id
  }
}, { immediate: true })

onMounted(() => {
  loadConfigs()
})

function loadConfigs() {
  const saved = localStorage.getItem('aiModelConfigs')
  if (saved) {
    savedConfigs.value = JSON.parse(saved)
  }

  // 如果没有选中，默认选第一个
  if (!selectedConfigId.value && savedConfigs.value.length > 0) {
    selectedConfigId.value = savedConfigs.value[0].id
    selectConfig(selectedConfigId.value)
  }
}

function emitUpdate() {
  // 发送当前配置，包含基础配置 + 本次对话的覆盖设置
  emit('update:config', {
    ...localConfig
  })
}

function onConfigChange() {
  selectConfig(selectedConfigId.value)
}

function selectConfig(id) {
  const config = savedConfigs.value.find(c => c.id === id)
  if (config) {
    selectedConfigId.value = id
    // 复制配置到本地
    Object.assign(localConfig, {
      ...config,
      id: config.id
    })
    emitUpdate()
    ElMessage.success('已选择')
  }
}

function addConfig() {
  editingId.value = ''
  newConfig.value = {
    id: '',
    name: '',
    provider: 'aliyun',
    model: '',
    baseUrl: '',
    apiKey: '',
    roleName: '',
    systemPrompt: ''
  }
  showAddForm.value = true
}

function editConfig(config) {
  editingId.value = config.id
  newConfig.value = {
    id: config.id,
    name: config.name,
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    roleName: config.roleName,
    systemPrompt: config.systemPrompt
  }
  showAddForm.value = true
}

function saveConfig() {
  if (!newConfig.value.name.trim()) {
    ElMessage.warning('请输入配置名称')
    return
  }
  if (!newConfig.value.apiKey.trim()) {
    ElMessage.warning('请输入 API Key')
    return
  }

  const config = {
    ...newConfig.value,
    temperature: 0.7,
    maxTokens: 1000
  }

  if (editingId.value) {
    // 更新现有配置
    const index = savedConfigs.value.findIndex(c => c.id === editingId.value)
    if (index >= 0) {
      savedConfigs.value[index] = config
      // 如果当前选中的是被编辑的配置，更新本地配置
      if (selectedConfigId.value === editingId.value) {
        Object.assign(localConfig, config)
        emitUpdate()
      }
      ElMessage.success('模型已更新')
    }
  } else {
    // 添加新配置
    config.id = Date.now().toString()
    savedConfigs.value.push(config)
    ElMessage.success('模型已添加')
  }

  saveToLocalStorage()

  // 如果是第一个配置，自动选中
  if (savedConfigs.value.length === 1) {
    selectedConfigId.value = config.id
    selectConfig(config.id)
  }

  showAddForm.value = false
}

function deleteConfig(id) {
  savedConfigs.value = savedConfigs.value.filter(c => c.id !== id)
  saveToLocalStorage()

  if (selectedConfigId.value === id) {
    selectedConfigId.value = savedConfigs.value.length > 0 ? savedConfigs.value[0].id : ''
    if (selectedConfigId.value) {
      selectConfig(selectedConfigId.value)
    } else {
      // 清空本地配置
      Object.assign(localConfig, {
        id: '',
        name: '',
        provider: '',
        model: '',
        baseUrl: '',
        apiKey: '',
        roleName: '',
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 1000
      })
      emitUpdate()
    }
  }

  ElMessage.success('模型已删除')
}

function saveToLocalStorage() {
  localStorage.setItem('aiModelConfigs', JSON.stringify(savedConfigs.value))
}

async function testConnection() {
  if (!newConfig.value.apiKey.trim()) {
    ElMessage.warning('请先输入 API Key')
    return
  }
  if (!newConfig.value.baseUrl.trim()) {
    ElMessage.warning('请先输入 API Base URL')
    return
  }

  testing.value = true
  try {
    await api.chat.test({
      provider: newConfig.value.provider,
      baseUrl: newConfig.value.baseUrl,
      apiKey: newConfig.value.apiKey,
      model: newConfig.value.model
    })
    ElMessage.success('连接测试成功！')
  } catch (error) {
    ElMessage.error(`连接失败：${error.message}`)
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.ai-selector {
  padding: 10px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.selector-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin: 0;
}

.config-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-name {
  font-weight: 500;
}

.config-model {
  font-size: 12px;
  color: #999;
}

.session-settings {
  margin-top: 15px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.session-settings :deep(.el-form-item) {
  margin-bottom: 12px;
}

.session-settings :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.model-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-list {
  text-align: center;
  color: #999;
  padding: 30px 0;
}

.empty-list .hint {
  font-size: 12px;
  margin-top: 5px;
}

.models {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.model-item:hover {
  background: #f0f2f5;
}

.model-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.model-info {
  flex: 1;
}

.model-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.model-detail {
  font-size: 12px;
  color: #666;
}

.model-actions {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}
</style>
