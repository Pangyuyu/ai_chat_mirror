import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const isRunning = ref(false)
  const isPaused = ref(false)
  const roundCount = ref(0)
  const topic = ref('')

  function setMessages(newMessages) {
    messages.value = newMessages
    // 保存到 localStorage
    localStorage.setItem('chatMessages', JSON.stringify(newMessages))
  }

  function addMessage(message) {
    messages.value.push(message)
    localStorage.setItem('chatMessages', JSON.stringify(messages.value))
  }

  function clearMessages() {
    messages.value = []
    localStorage.removeItem('chatMessages')
  }

  function loadMessages() {
    const saved = localStorage.getItem('chatMessages')
    if (saved) {
      messages.value = JSON.parse(saved)
    }
  }

  function setRunning(value) {
    isRunning.value = value
  }

  function setPaused(value) {
    isPaused.value = value
  }

  function setRoundCount(value) {
    roundCount.value = value
  }

  function incrementRound() {
    roundCount.value++
  }

  function setTopic(value) {
    topic.value = value
  }

  return {
    messages,
    isRunning,
    isPaused,
    roundCount,
    topic,
    setMessages,
    addMessage,
    clearMessages,
    loadMessages,
    setRunning,
    setPaused,
    setRoundCount,
    incrementRound,
    setTopic
  }
})
