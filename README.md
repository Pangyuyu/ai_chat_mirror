# AI 对话工具

让两个不同的 AI 自行对话的图形化工具。

> **🤖 本项目由 AI 生成**
> 
> 本程序由 Qwen Code（阿里巴巴通义实验室）辅助开发完成。从需求分析、功能规划到代码实现，均由 AI 自主完成。

## 功能特性

- 🎭 **双 AI 对话**：配置两个不同的 AI 模型进行对话
- 🎯 **角色定义**：为每个 AI 设定独特的角色和人设
- 💬 **话题设定**：用户可自定义对话主题
- 🎮 **实时控制**：开始、暂停、停止、插入发言
- 📝 **历史记录**：自动保存对话记录，支持导出
- 🔌 **多模型支持**：支持国内主流大模型和自定义 API

## 支持的 AI 模型

- 通义千问（阿里云）
- 文心一言（百度）
- 讯飞星火（科大讯飞）
- 腾讯混元（腾讯云）
- Kimi（月之暗面）
- 智谱 AI
- 自定义 OpenAI 兼容接口

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend && npm install && cd ..

# 安装前端依赖
cd frontend && npm install && cd ..
```

### 开发模式

```bash
# 同时启动前后端开发服务器
npm run dev

# 或者分别启动
npm run dev:backend  # 后端 (http://localhost:3000)
npm run dev:frontend # 前端 (http://localhost:5173)
```

### 生产构建

```bash
npm run build
```

## 项目结构

```
ai-chat/
├── docs/                    # 文档目录
├── frontend/                # Vue3 前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── api/             # API 调用
│   │   └── ...
│   └── ...
├── backend/                 # Node.js 后端
│   ├── src/
│   │   ├── routes/          # 路由
│   │   ├── services/        # AI 服务
│   │   └── ...
│   └── ...
└── package.json
```

## 使用说明

1. 配置 AI 1 和 AI 2 的模型、API Key 和角色
2. 输入对话话题
3. 点击【开始】按钮
4. 观看两个 AI 对话
5. 可随时插入发言或停止对话

## License

MIT
