<template>
  <div class="chat-window">
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <el-icon :size="60" color="#ccc"><ChatDotRound /></el-icon>
        <p>暂无对话内容</p>
        <p class="hint">输入话题后点击开始对话</p>
      </div>

      <div
        v-for="(message, index) in messages"
        :key="message.id"
        class="message"
        :class="getMessageClass(message)"
      >
        <div class="message-avatar">
          <el-icon :size="24">
            <component :is="getAvatarIcon(message)" />
          </el-icon>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-name">{{ message.name }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            <span v-if="message.isStreaming" class="streaming-badge">
              <el-icon class="rotating"><Loading /></el-icon>
              生成中...
            </span>
          </div>
          <!-- 思考过程 -->
          <div v-if="message.reasoningContent" class="reasoning-block">
            <div class="reasoning-header" @click="message.showReasoning = !message.showReasoning">
              <el-icon :class="{ 'rotating': message.isStreaming }"><Lightning /></el-icon>
              <span>思考过程</span>
              <el-icon class="expand-icon" :class="{ 'expanded': message.showReasoning }">
                <ArrowRight />
              </el-icon>
            </div>
            <div v-show="message.showReasoning !== false" class="reasoning-content">
              <MarkdownRenderer :content="message.reasoningContent" />
            </div>
          </div>
          <!-- 回答内容 -->
          <div class="message-text">
            <MarkdownRenderer v-if="shouldRenderMarkdown(message)" :content="message.content" />
            <template v-else>{{ message.content }}</template>
          </div>
        </div>
      </div>
    </div>

    <div class="user-input-area">
      <el-input
        v-model="userMessage"
        placeholder="输入你的发言（可选）"
        clearable
        @keyup.enter="sendUserMessage"
      >
        <template #append>
          <el-button
            type="primary"
            :disabled="!userMessage.trim()"
            @click="sendUserMessage"
          >
            <el-icon><Promotion /></el-icon>
            发送
          </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Lightning, ArrowRight } from '@element-plus/icons-vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isRunning: Boolean,
  isPaused: Boolean,
  streamingIndex: Number
})

const emit = defineEmits(['send-user-message'])

const messagesContainer = ref(null)
const userMessage = ref('')

watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function getMessageClass(message) {
  if (message.role === 'system') return 'message-system'
  if (message.role === 'user') return 'message-user'
  return message.aiIndex === 1 ? 'message-ai1' : 'message-ai2'
}

function getAvatarIcon(message) {
  if (message.role === 'system') return 'Setting'
  if (message.role === 'user') return 'User'
  return 'Cpu'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function sendUserMessage() {
  if (!userMessage.value.trim()) return
  emit('send-user-message', userMessage.value)
  userMessage.value = ''
}

function shouldRenderMarkdown(message) {
  // 系统和用户消息不渲染 Markdown
  if (message.role === 'system' || message.role === 'user') return false
  // AI 消息渲染 Markdown
  return true
}
</script>

<style scoped>
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-state p {
  margin-top: 15px;
  font-size: 16px;
}

.empty-state .hint {
  font-size: 13px;
  color: #bbb;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 85%;
}

.message-ai1 {
  align-self: flex-start;
}

.message-ai2 {
  align-self: flex-end;
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-system {
  align-self: center;
  justify-content: center;
  max-width: 100%;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-ai1 .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-ai2 .message-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.message-user .message-avatar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.message-system .message-avatar {
  background: #909399;
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.message-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.message-ai1 .message-name {
  color: #667eea;
}

.message-ai2 .message-name {
  color: #f5576c;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.streaming-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.streaming-badge .rotating {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 思考过程样式 */
.reasoning-block {
  margin-bottom: 12px;
  border: 1px solid #e8f3ff;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f7ff 0%, #f5faff 100%);
  overflow: hidden;
}

.reasoning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transition: background 0.2s;
}

.reasoning-header:hover {
  background: rgba(64, 158, 255, 0.1);
}

.reasoning-header .el-icon {
  font-size: 16px;
}

.reasoning-header span {
  flex: 1;
}

.expand-icon {
  transition: transform 0.3s;
  font-size: 14px;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.reasoning-content {
  padding: 12px 16px;
  border-top: 1px solid #e8f3ff;
  max-height: 400px;
  overflow-y: auto;
}

.reasoning-content :deep(.markdown-body) {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.reasoning-content :deep(.markdown-body p) {
  margin: 0.3em 0;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-ai1 .message-text {
  border-top-left-radius: 4px;
}

.message-ai2 .message-text {
  border-top-right-radius: 4px;
  background: linear-gradient(135deg, #fef5f6 0%, #fff5f7 100%);
}

.message-user .message-text {
  background: linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%);
  border-top-right-radius: 4px;
}

.message-system .message-text {
  background: #f4f4f5;
  text-align: center;
  color: #666;
  font-style: italic;
}

.user-input-area {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background: white;
}
</style>
