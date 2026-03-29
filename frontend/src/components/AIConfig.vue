<template>
  <div class="ai-config">
    <el-form :model="localConfig" label-position="top" size="small">
      <el-form-item label="角色名称">
        <el-input 
          v-model="localConfig.roleName" 
          placeholder="如：程序员小明"
          @input="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="模型选择">
        <el-select 
          v-model="localConfig.provider" 
          placeholder="选择模型"
          style="width: 100%"
          @change="onProviderChange"
        >
          <el-option-group label="国内大模型">
            <el-option label="通义千问 (阿里云)" value="aliyun" />
            <el-option label="Kimi (月之暗面)" value="moonshot" />
            <el-option label="智谱 AI" value="zhipu" />
            <el-option label="文心一言 (百度)" value="baidu" />
          </el-option-group>
          <el-option-group label="其他">
            <el-option label="OpenAI 兼容" value="custom" />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="模型名称">
        <el-input 
          v-model="localConfig.model" 
          placeholder="如：qwen-turbo"
          @input="emitUpdate"
        >
          <template #append>
            <el-popover :width="300" trigger="click">
              <template #reference>
                <el-button :icon="InfoFilled" />
              </template>
              <div class="model-hints">
                <p><strong>常用模型名称：</strong></p>
                <ul>
                  <li>通义千问：qwen-turbo, qwen-plus, qwen-max</li>
                  <li>Kimi: moonshot-v1-8k, moonshot-v1-32k</li>
                  <li>智谱 AI: glm-4, glm-3-turbo</li>
                </ul>
              </div>
            </el-popover>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="API Base URL">
        <el-input 
          v-model="localConfig.baseUrl" 
          placeholder="如：https://dashscope.aliyuncs.com/compatible-mode/v1"
          @input="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="API Key">
        <el-input 
          v-model="localConfig.apiKey" 
          type="password"
          placeholder="请输入 API Key"
          show-password
          @input="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="系统提示词（人设）">
        <el-input 
          v-model="localConfig.systemPrompt" 
          type="textarea"
          :rows="4"
          placeholder="如：你是一个有 5 年经验的后端程序员，擅长技术讨论..."
          @input="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="温度 (Temperature)">
        <el-slider 
          v-model="localConfig.temperature" 
          :min="0" 
          :max="1" 
          :step="0.1"
          @change="emitUpdate"
        />
        <div class="slider-hint">值越大回复越有创造性，0 最确定，1 最随机</div>
      </el-form-item>

      <el-form-item label="最大 Token 数">
        <el-input-number
          v-model="localConfig.maxTokens"
          :min="100"
          :max="4000"
          :step="100"
          @change="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="思考链支持">
        <el-switch
          v-model="localConfig.supportsReasoning"
          active-text="启用"
          inactive-text="禁用"
          @change="emitUpdate"
        />
        <div class="slider-hint">启用后可显示模型的思考过程（如 Qwen、GLM-4 等）</div>
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
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import api from '../api'

const props = defineProps({
  aiIndex: Number,
  config: Object
})

const emit = defineEmits(['update:config'])

const localConfig = reactive({
  supportsReasoning: true,  // 默认启用思考链
  ...props.config
})

watch(() => props.config, (newVal) => {
  Object.assign(localConfig, {
    supportsReasoning: true,
    ...newVal
  })
}, { deep: true })

function emitUpdate() {
  emit('update:config', { ...localConfig })
}

function onProviderChange() {
  const defaults = {
    aliyun: {
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-turbo',
      supportsReasoning: true  // Qwen 支持思考链
    },
    moonshot: {
      baseUrl: 'https://api.moonshot.cn/v1',
      model: 'moonshot-v1-8k',
      supportsReasoning: false  // Kimi 不支持思考链
    },
    zhipu: {
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4',
      supportsReasoning: true  // GLM-4 支持思考链
    },
    baidu: {
      baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
      model: 'completions_pro',
      supportsReasoning: false  // 百度文心一言暂不支持
    },
    custom: {
      baseUrl: '',
      model: '',
      supportsReasoning: false  // 自定义模型默认不启用
    }
  }

  const defaultsForProvider = defaults[localConfig.provider] || defaults.custom
  localConfig.baseUrl = defaultsForProvider.baseUrl
  localConfig.model = defaultsForProvider.model
  localConfig.supportsReasoning = defaultsForProvider.supportsReasoning
  emitUpdate()
}

const testing = ref(false)

async function testConnection() {
  if (!localConfig.apiKey) {
    ElMessage.warning('请先输入 API Key')
    return
  }

  testing.value = true
  try {
    await api.chat.test(localConfig)
    ElMessage.success('连接测试成功！')
  } catch (error) {
    ElMessage.error(`连接失败：${error.message}`)
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.ai-config {
  padding-top: 5px;
}

.slider-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.model-hints {
  font-size: 13px;
}

.model-hints p {
  margin-bottom: 8px;
}

.model-hints ul {
  margin-left: 15px;
  color: #666;
}

.model-hints li {
  margin: 4px 0;
}
</style>
