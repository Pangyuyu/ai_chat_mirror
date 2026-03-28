<template>
  <div class="main-content">
    <div class="left-panel">
      <AISelector 
        :ai-index="1" 
        :config="ai1Config" 
        @update:config="updateAI1Config" 
      />
      <div class="divider"></div>
      <AISelector 
        :ai-index="2" 
        :config="ai2Config" 
        @update:config="updateAI2Config" 
      />
    </div>

    <div class="center-panel">
      <TopicInput v-model:topic="topic" @start="startChat" />
      <ChatWindow
        :messages="messages"
        :is-running="isRunning"
        :is-paused="isPaused"
        :streaming-index="streamingIndex"
        @send-user-message="sendUserMessage"
      />
    </div>

    <div class="right-panel">
      <ControlPanel
        :is-running="isRunning"
        :is-paused="isPaused"
        :round-count="roundCount"
        :max-rounds="maxRounds"
        @start="startChat"
        @pause="pauseChat"
        @resume="resumeChat"
        @stop="stopChat"
        @reset="resetChat"
        @export="exportChat"
      />
      <PresetList @load="loadPreset" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AISelector from './AISelector.vue'
import TopicInput from './TopicInput.vue'
import ChatWindow from './ChatWindow.vue'
import ControlPanel from './ControlPanel.vue'
import PresetList from './PresetList.vue'
import { useChatStore } from '../stores/chat'
import { useConfigStore } from '../stores/config'
import api from '../api'

const chatStore = useChatStore()
const configStore = useConfigStore()

// AI 配置
const ai1Config = reactive({})
const ai2Config = reactive({})

// 话题
const topic = ref('')

// 对话状态
const isRunning = ref(false)
const isPaused = ref(false)
const roundCount = ref(0)
const maxRounds = ref(0)

// 流式输出状态
const streamingIndex = ref(-1)

// 消息列表 - 使用独立数组
const messages = ref([])

// 同步到 store
function syncMessages() {
  chatStore.setMessages([...messages.value])
}

// 对话控制
let chatTimer = null
let currentTurn = 1
let abortController = null

onMounted(() => {
  // 初始化默认配置
  ai1Config.roleName = 'AI 1'
  ai2Config.roleName = 'AI 2'
})

function updateAI1Config(newConfig) {
  Object.assign(ai1Config, newConfig)
}

function updateAI2Config(newConfig) {
  Object.assign(ai2Config, newConfig)
}

async function startChat() {
  if (!topic.value.trim()) {
    ElMessage.warning('请输入对话话题')
    return
  }

  if (!ai1Config.apiKey || !ai2Config.apiKey) {
    ElMessage.warning('请配置两个 AI 的 API Key')
    return
  }

  if (isPaused.value) {
    resumeChat()
    return
  }

  messages.value = []
  roundCount.value = 0
  streamingIndex.value = -1

  const initialMessage = {
    id: Date.now().toString(),
    role: 'system',
    name: '系统',
    content: `对话话题：${topic.value}`,
    timestamp: new Date().toISOString()
  }
  messages.value.push(initialMessage)
  syncMessages()

  isRunning.value = true
  isPaused.value = false
  currentTurn = 1

  await runChatCycle()
}

async function runChatCycle() {
  if (!isRunning.value || isPaused.value) return

  try {
    const currentAIConfig = currentTurn === 1 ? ai1Config : ai2Config
    const aiName = currentTurn === 1 ? ai1Config.roleName : ai2Config.roleName
    const otherAIName = currentTurn === 1 ? ai2Config.roleName : ai1Config.roleName

    const systemPrompt = currentAIConfig.systemPrompt || `你是一个${aiName || 'AI 助手'}。`
    
    // 构建消息历史
    const messageHistory = [
      { role: 'system', content: systemPrompt }
    ]
    
    // 添加历史消息
    // 关键：把对方 AI 的回复当作 user 角色，这样当前 AI 才知道是在回应对方
    for (let i = 0; i < messages.value.length; i++) {
      const m = messages.value[i]
      if (m.role === 'system') continue
      if (!m.content || m.content.trim() === '') continue
      
      if (m.role === 'user') {
        // 用户消息保持 user 角色
        messageHistory.push({ role: 'user', content: m.content })
      } else if (m.role === 'assistant') {
        // AI 消息：如果是对方 AI 的回复，当作 user；如果是自己的，当作 assistant
        if (m.aiIndex !== currentTurn) {
          // 对方 AI 的回复 - 当作 user（对方在对你说话）
          messageHistory.push({ role: 'user', name: otherAIName, content: m.content })
        } else {
          // 自己之前的回复 - 当作 assistant
          messageHistory.push({ role: 'assistant', content: m.content })
        }
      }
    }

    // 如果是第一轮，添加话题
    if (messages.value.length <= 1) {
      messageHistory.push({ role: 'user', content: `请围绕以下话题开始讨论：${topic.value}` })
    }

    console.log(`[第${roundCount.value + 1}轮] ${aiName} 发言，消息历史:`, messageHistory)

    // 创建空的 AI 消息用于流式显示
    const aiMessageIndex = messages.value.length
    const aiMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      name: aiName,
      aiIndex: currentTurn,
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    }
    messages.value.push(aiMessage)
    streamingIndex.value = aiMessageIndex

    // 流式接收
    await streamResponse(currentAIConfig, messageHistory, aiMessageIndex)

    // 流式完成
    streamingIndex.value = -1
    if (messages.value[aiMessageIndex]) {
      messages.value[aiMessageIndex].isStreaming = false
    }
    syncMessages()

    // 切换发言权
    currentTurn = currentTurn === 1 ? 2 : 1

    if (currentTurn === 1) {
      roundCount.value++
      if (maxRounds.value > 0 && roundCount.value >= maxRounds.value) {
        stopChat()
        ElMessage.success('已达到最大对话轮数')
        return
      }
    }

    if (isRunning.value && !isPaused.value) {
      chatTimer = setTimeout(runChatCycle, 1000)
    }
  } catch (error) {
    console.error('对话出错:', error)
    ElMessage.error(error.message || '对话失败')
    streamingIndex.value = -1
    stopChat()
  }
}

async function streamResponse(aiConfig, messageHistory, messageIndex) {
  abortController = new AbortController()

  try {
    console.log(`[流式开始] AI 索引：${messageIndex}`)
    const reader = await api.chat.sendStream(aiConfig, messageHistory)
    const decoder = new TextDecoder()
    let receivedCount = 0

    for await (const chunk of reader) {
      if (!isRunning.value || isPaused.value) break

      const text = decoder.decode(chunk, { stream: true })
      const lines = text.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          const parsed = JSON.parse(data)
          
          // 兼容两种格式
          let content = ''
          let reasoningContent = ''
          
          if (typeof parsed.chunk === 'string') {
            content = parsed.chunk
          } else if (typeof parsed.chunk === 'object') {
            content = parsed.chunk?.content || ''
            reasoningContent = parsed.chunk?.reasoningContent || ''
          }

          if (messages.value[messageIndex]) {
            if (content) {
              messages.value[messageIndex].content += content
              receivedCount++
            }
            if (reasoningContent) {
              if (!messages.value[messageIndex].reasoningContent) {
                messages.value[messageIndex].reasoningContent = ''
              }
              messages.value[messageIndex].reasoningContent += reasoningContent
            }
            syncMessages()
          }
        }
      }
    }
    
    console.log(`[流式完成] AI 索引：${messageIndex}, 接收次数：${receivedCount}, 内容长度：${messages.value[messageIndex]?.content?.length || 0}`)
  } catch (error) {
    console.error('流式错误:', error)
    if (error.name !== 'AbortError') {
      throw error
    }
  }
}

function pauseChat() {
  if (!isRunning.value) return
  isPaused.value = true
  if (abortController) abortController.abort()
  clearTimeout(chatTimer)
  ElMessage.info('对话已暂停')
}

function resumeChat() {
  if (!isPaused.value) return
  isPaused.value = false
  ElMessage.success('对话已继续')
  runChatCycle()
}

function stopChat() {
  isRunning.value = false
  isPaused.value = false
  if (abortController) abortController.abort()
  clearTimeout(chatTimer)
  streamingIndex.value = -1
  ElMessage.success('对话已停止')
}

function resetChat() {
  stopChat()
  messages.value = []
  roundCount.value = 0
  currentTurn = 1
  syncMessages()
  ElMessage.info('对话已重置')
}

async function sendUserMessage(content) {
  if (!content.trim()) return

  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    name: '用户',
    content: content,
    timestamp: new Date().toISOString()
  }
  messages.value.push(userMessage)
  syncMessages()

  if (!isRunning.value && !isPaused.value) {
    ElMessage.success('消息已发送')
    return
  }

  if (isRunning.value) {
    if (abortController) abortController.abort()
    clearTimeout(chatTimer)
    chatTimer = setTimeout(runChatCycle, 1000)
  }
}

function exportChat() {
  if (messages.value.length === 0) {
    ElMessage.warning('没有可导出的对话内容')
    return
  }

  const markdown = generateMarkdown()
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-chat-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('对话已导出')
}

function generateMarkdown() {
  let md = `# AI 对话记录\n\n`
  md += `**话题**: ${topic.value}\n`
  md += `**时间**: ${new Date().toLocaleString('zh-CN')}\n`
  md += `**轮数**: ${roundCount.value}\n\n`
  md += `---\n\n`

  for (const msg of messages.value) {
    if (msg.role === 'system') {
      md += `### ${msg.content}\n\n`
    } else {
      md += `**${msg.name}**: ${msg.content}\n\n`
    }
  }

  return md
}

function loadPreset(preset) {
  if (preset.ai1Config) Object.assign(ai1Config, preset.ai1Config)
  if (preset.ai2Config) Object.assign(ai2Config, preset.ai2Config)
  if (preset.topic) topic.value = preset.topic
  saveConfigs()
  ElMessage.success('预设已加载')
}
</script>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  padding: 15px;
  gap: 15px;
  overflow: hidden;
}

.left-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.divider {
  height: 1px;
  background: #e4e7ed;
  margin: 15px 0;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.right-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
