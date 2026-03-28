<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <el-icon :size="24"><ChatDotRound /></el-icon>
        <span>AI 对话工具</span>
      </div>
      <div class="actions">
        <el-button link @click="showAbout = true">
          <el-icon><InfoFilled /></el-icon>
          关于
        </el-button>
      </div>
    </div>
  </header>

  <el-dialog v-model="showAbout" title="关于" width="500px">
    <div class="about-content">
      <h3>AI 对话工具 v1.0.0</h3>
      <p>让两个不同的 AI 自行对话的图形化工具。</p>
      <h4>功能特性</h4>
      <ul>
        <li>双 AI 对话：配置两个不同的 AI 模型进行对话</li>
        <li>角色定义：为每个 AI 设定独特的角色和人设</li>
        <li>话题设定：用户可自定义对话主题</li>
        <li>实时控制：开始、暂停、停止、插入发言</li>
        <li>历史记录：自动保存对话记录，支持导出</li>
        <li>多模型支持：支持国内主流大模型和自定义 API</li>
      </ul>
      <h4>支持的 AI 模型</h4>
      <p>通义千问、文心一言、讯飞星火、腾讯混元、Kimi、智谱 AI、自定义 OpenAI 兼容接口</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const showAbout = ref(false)
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 15px;
}

.actions .el-button {
  color: white;
}

.actions .el-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.about-content h3 {
  margin-bottom: 10px;
  color: #667eea;
}

.about-content h4 {
  margin: 15px 0 10px;
  color: #333;
}

.about-content ul {
  margin-left: 20px;
  color: #666;
}

.about-content p {
  color: #666;
  line-height: 1.6;
}
</style>
