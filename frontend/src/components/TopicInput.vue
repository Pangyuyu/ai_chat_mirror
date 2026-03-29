<template>
  <div class="topic-input">
    <el-input
      v-model="localTopic"
      placeholder="输入对话话题，如：人工智能的未来发展"
      clearable
      @keyup.enter="handleStart"
    >
      <template #prefix>
        <el-icon><Edit /></el-icon>
      </template>
      <template #append>
        <el-button 
          type="primary" 
          :disabled="isRunning"
          @click="handleStart"
        >
          <el-icon><VideoPlay /></el-icon>
          开始对话
        </el-button>
      </template>
    </el-input>

    <div class="preset-topics">
      <span class="label">预设话题：</span>
      <el-tag
        v-for="preset in presetTopics"
        :key="preset"
        size="small"
        effect="plain"
        class="topic-tag"
        @click="selectPreset(preset)"
      >
        {{ preset }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Edit, VideoPlay } from '@element-plus/icons-vue'

const props = defineProps({
  topic: String
})

const emit = defineEmits(['update:topic', 'start'])

const localTopic = ref(props.topic || '')
const isRunning = ref(false)

const presetTopics = [
  '人工智能的未来发展',
  '程序员 vs 产品经理：需求的博弈',
  '远程办公的利弊',
  '技术选型：稳定 vs 创新',
  'AI 会取代程序员吗？'
]

watch(() => props.topic, (newVal) => {
  localTopic.value = newVal || ''
})

watch(localTopic, (newVal) => {
  emit('update:topic', newVal)
})

function selectPreset(preset) {
  localTopic.value = preset
  emit('update:topic', preset)
}

function handleStart() {
  emit('start')
}
</script>

<style scoped>
.topic-input {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.preset-topics {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.label {
  font-size: 13px;
  color: #666;
}

.topic-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.topic-tag:hover {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}
</style>
