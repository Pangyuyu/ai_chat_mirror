import express from 'express';
import createAIService from '../services/ai.js';

const router = express.Router();

// 发送消息到指定 AI（流式输出）
router.post('/send', async (req, res) => {
  try {
    const { aiConfig, messages } = req.body;

    if (!aiConfig || !messages) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const aiService = createAIService(aiConfig);
    
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // 创建可读流
    const stream = await aiService.sendMessageStream(messages);
    
    // 流式传输
    for await (const chunk of stream) {
      const data = JSON.stringify({ chunk });
      res.write(`data: ${data}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('发送消息失败:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// 发送消息到指定 AI（非流式，兼容旧接口）
router.post('/send-sync', async (req, res) => {
  try {
    const { aiConfig, messages } = req.body;

    if (!aiConfig || !messages) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const aiService = createAIService(aiConfig);
    const response = await aiService.sendMessage(messages);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '发送消息失败'
    });
  }
});

// 测试连接
router.post('/test', async (req, res) => {
  try {
    const { aiConfig } = req.body;

    if (!aiConfig) {
      return res.status(400).json({ error: '缺少配置参数' });
    }

    const aiService = createAIService(aiConfig);
    const testMessages = [
      { role: 'user', content: '你好，请简单回复即可。' }
    ];

    await aiService.sendMessage(testMessages);

    res.json({
      success: true,
      message: '连接测试成功'
    });
  } catch (error) {
    console.error('测试连接失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '连接测试失败'
    });
  }
});

export default router;
