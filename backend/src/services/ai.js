import axios from 'axios';

/**
 * AI 服务基类
 */
class AIService {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  /**
   * 发送消息（非流式）
   * @param {Array} messages - 消息历史 [{role, content}]
   * @returns {Promise<string>} AI 回复内容
   */
  async sendMessage(messages) {
    throw new Error('sendMessage 方法必须由子类实现');
  }

  /**
   * 发送消息（流式）
   * @param {Array} messages - 消息历史
   * @returns {AsyncIterable<string>} 流式响应
   */
  async *sendMessageStream(messages) {
    throw new Error('sendMessageStream 方法必须由子类实现');
  }
}

/**
 * 通义千问服务（阿里云）
 */
class AliyunService extends AIService {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.supportsReasoning = config.supportsReasoning !== false; // 默认支持
  }

  async sendMessage(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'qwen-turbo',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  async *sendMessageStream(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'qwen-turbo',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    for await (const chunk of response.data) {
      const str = chunk.toString();
      const lines = str.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content || '';
            const reasoningContent = this.supportsReasoning ? (delta?.reasoning_content || '') : '';

            // 直接返回对象，不要 JSON.stringify
            if (content || reasoningContent) {
              yield { content, reasoningContent };
            }
          } catch (e) {
            console.error('解析 SSE 数据失败:', e, '数据:', data);
          }
        }
      }
    }
  }
}

/**
 * Kimi 服务（月之暗面）
 */
class MoonshotService extends AIService {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.moonshot.cn/v1';
    this.supportsReasoning = config.supportsReasoning === true; // 默认不支持
  }

  async sendMessage(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'moonshot-v1-8k',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  async *sendMessageStream(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'moonshot-v1-8k',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    for await (const chunk of response.data) {
      const str = chunk.toString();
      const lines = str.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content || '';
            const reasoningContent = this.supportsReasoning ? (delta?.reasoning_content || delta?.reasoningContent || '') : '';
            if (content || reasoningContent) {
              yield { content, reasoningContent };
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}

/**
 * 智谱 AI 服务
 */
class ZhipuService extends AIService {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://open.bigmodel.cn/api/paas/v4';
    this.supportsReasoning = config.supportsReasoning !== false; // 默认支持
  }

  async sendMessage(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'glm-4',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  async *sendMessageStream(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'glm-4',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    for await (const chunk of response.data) {
      const str = chunk.toString();
      const lines = str.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content || '';
            const reasoningContent = this.supportsReasoning ? (delta?.reasoning_content || '') : '';

            // 支持思考链
            if (content || reasoningContent) {
              yield { content, reasoningContent };
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}

/**
 * OpenAI 兼容服务（通用）
 */
class OpenAICompatibleService extends AIService {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.supportsReasoning = config.supportsReasoning === true; // 默认不支持
  }

  async sendMessage(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  async *sendMessageStream(messages) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    for await (const chunk of response.data) {
      const str = chunk.toString();
      const lines = str.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content || '';
            const reasoningContent = this.supportsReasoning ? (delta?.reasoning_content || delta?.reasoningContent || '') : '';

            if (content || reasoningContent) {
              yield { content, reasoningContent };
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}

/**
 * 创建 AI 服务实例的工厂函数
 */
function createAIService(config) {
  const providerMap = {
    'aliyun': AliyunService,
    'moonshot': MoonshotService,
    'zhipu': ZhipuService,
    'baidu': OpenAICompatibleService,
    'deepseek': OpenAICompatibleService,
    'custom': OpenAICompatibleService
  };

  const ServiceClass = providerMap[config.provider] || OpenAICompatibleService;
  return new ServiceClass(config);
}

export {
  AIService,
  AliyunService,
  MoonshotService,
  ZhipuService,
  OpenAICompatibleService,
  createAIService
}

export default createAIService
