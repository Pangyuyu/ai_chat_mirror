<template>
  <div class="control-panel">
    <div class="panel-section">
      <h3>
        <el-icon><Operation /></el-icon>
        对话控制
      </h3>
      
      <div class="control-buttons">
        <el-button
          v-if="!isRunning"
          type="primary"
          size="large"
          :icon="VideoPlay"
          @click="$emit('start')"
          class="full-width-btn"
        >
          开始对话
        </el-button>

        <template v-else>
          <el-button
            v-if="!isPaused"
            type="warning"
            size="large"
            :icon="VideoPause"
            @click="$emit('pause')"
            class="full-width-btn"
          >
            暂停
          </el-button>

          <el-button
            v-else
            type="success"
            size="large"
            :icon="VideoPlay"
            @click="$emit('resume')"
            class="full-width-btn"
          >
            继续
          </el-button>

          <el-button
            type="danger"
            size="large"
            :icon="VideoCamera"
            @click="$emit('stop')"
            class="full-width-btn"
          >
            停止
          </el-button>
        </template>

        <el-button
          size="large"
          :icon="RefreshLeft"
          @click="$emit('reset')"
          class="full-width-btn"
        >
          重置
        </el-button>
      </div>
    </div>

    <div class="panel-section">
      <h3>
        <el-icon><DataAnalysis /></el-icon>
        对话状态
      </h3>
      
      <div class="status-info">
        <div class="status-item">
          <span class="label">状态</span>
          <span class="value" :class="statusClass">
            <span class="status-dot" :class="statusDotClass"></span>
            {{ statusText }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">轮数</span>
          <span class="value">{{ roundCount }} / {{ maxRounds > 0 ? maxRounds : '∞' }}</span>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <h3>
        <el-icon><Download /></el-icon>
        导出
      </h3>
      
      <el-button 
        @click="$emit('export')"
        style="width: 100%"
      >
        <el-icon><Document /></el-icon>
        导出为 Markdown
      </el-button>
    </div>

    <div class="panel-section">
      <h3>
        <el-icon><Setting /></el-icon>
        对话设置
      </h3>
      
      <el-form label-position="top" size="small">
        <el-form-item label="最大轮数（0 为无限制）">
          <el-input-number 
            v-model="localMaxRounds" 
            :min="0" 
            :max="100" 
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VideoPlay, VideoPause, VideoCamera, RefreshLeft } from '@element-plus/icons-vue'

const props = defineProps({
  isRunning: Boolean,
  isPaused: Boolean,
  roundCount: Number,
  maxRounds: Number
})

const emit = defineEmits(['start', 'pause', 'resume', 'stop', 'reset', 'export', 'update:maxRounds'])

const localMaxRounds = computed({
  get: () => props.maxRounds,
  set: (val) => emit('update:maxRounds', val)
})

const statusText = computed(() => {
  if (!props.isRunning) return '未开始'
  if (props.isPaused) return '已暂停'
  return '运行中'
})

const statusClass = computed(() => {
  if (!props.isRunning) return 'status-stopped'
  if (props.isPaused) return 'status-paused'
  return 'status-running'
})

const statusDotClass = computed(() => {
  if (!props.isRunning) return 'dot-stopped'
  if (props.isPaused) return 'dot-paused'
  return 'dot-running'
})
</script>

<style scoped>
.control-panel {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.panel-section {
  margin-bottom: 20px;
}

.panel-section:last-child {
  margin-bottom: 0;
}

.panel-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.full-width-btn {
  width: 100%;
  margin: 0;
  padding: 0;
}

.full-width-btn :deep(span) {
  justify-content: flex-start;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item .label {
  font-size: 13px;
  color: #666;
}

.status-item .value {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-running {
  background: #67c23a;
  animation: pulse 1.5s ease-in-out infinite;
}

.dot-paused {
  background: #e6a23c;
}

.dot-stopped {
  background: #909399;
}

.status-running {
  color: #67c23a;
}

.status-paused {
  color: #e6a23c;
}

.status-stopped {
  color: #909399;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
