<template>
  <div class="preset-list">
    <div class="preset-header">
      <h3>
        <el-icon><FolderOpened /></el-icon>
        预设模板
      </h3>
      <el-button link type="primary" @click="showSaveDialog = true">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <div v-if="presets.length === 0" class="empty-presets">
      <p>暂无预设</p>
      <p class="hint">点击 + 添加预设</p>
    </div>

    <div v-else class="presets-container">
      <div 
        v-for="preset in presets" 
        :key="preset.id" 
        class="preset-item"
        @click="loadPreset(preset)"
      >
        <div class="preset-name">{{ preset.name }}</div>
        <div class="preset-info">
          <span class="preset-ai">{{ preset.ai1Config?.roleName || 'AI 1' }}</span>
          <span class="vs">VS</span>
          <span class="preset-ai">{{ preset.ai2Config?.roleName || 'AI 2' }}</span>
        </div>
        <div class="preset-actions">
          <el-button 
            link 
            type="danger" 
            size="small"
            @click.stop="deletePreset(preset.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 保存预设对话框 -->
    <el-dialog v-model="showSaveDialog" title="保存预设" width="400px">
      <el-form :model="newPreset" label-position="top">
        <el-form-item label="预设名称">
          <el-input v-model="newPreset.name" placeholder="如：程序员 vs 产品经理" />
        </el-form-item>
        <el-form-item label="话题">
          <el-input v-model="newPreset.topic" placeholder="对话话题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveDialog = false">取消</el-button>
        <el-button type="primary" @click="savePreset">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useConfigStore } from '../stores/config'

const emit = defineEmits(['load'])

const configStore = useConfigStore()
const presets = computed(() => configStore.presets)

const showSaveDialog = ref(false)
const newPreset = ref({
  name: '',
  topic: '',
  ai1Config: null,
  ai2Config: null
})

onMounted(() => {
  configStore.loadPresets()
})

function loadPreset(preset) {
  emit('load', preset)
}

function savePreset() {
  if (!newPreset.value.name.trim()) {
    ElMessage.warning('请输入预设名称')
    return
  }

  // 从 localStorage 获取当前 AI 配置
  const savedConfigs = JSON.parse(localStorage.getItem('aiConfigs') || '[]')
  
  newPreset.value.ai1Config = savedConfigs[0] || null
  newPreset.value.ai2Config = savedConfigs[1] || null

  configStore.savePreset({
    ...newPreset.value,
    ai1Config: savedConfigs[0] || null,
    ai2Config: savedConfigs[1] || null
  })

  showSaveDialog.value = false
  newPreset.value = { name: '', topic: '', ai1Config: null, ai2Config: null }
  ElMessage.success('预设已保存')
}

function deletePreset(id) {
  configStore.deletePreset(id)
  ElMessage.success('预设已删除')
}
</script>

<style scoped>
.preset-list {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preset-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin: 0;
}

.empty-presets {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.empty-presets .hint {
  font-size: 12px;
  color: #bbb;
  margin-top: 5px;
}

.presets-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e4e7ed;
}

.preset-item:hover {
  background: #f0f2f5;
  border-color: #667eea;
}

.preset-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.preset-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.vs {
  color: #999;
  font-style: italic;
}

.preset-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
