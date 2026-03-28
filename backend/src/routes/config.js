import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径
const CONFIG_FILE = path.join(__dirname, '../../data/configs.json');

// 确保数据目录存在
const dataDir = path.dirname(CONFIG_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化配置文件
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    aiConfigs: [],
    presets: []
  }, null, 2));
}

// 获取所有配置
router.get('/configs', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: '读取配置失败' });
  }
});

// 保存配置
router.post('/configs', (req, res) => {
  try {
    const { aiConfigs, presets } = req.body;
    const data = { aiConfigs, presets };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: '配置保存成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '保存配置失败' });
  }
});

// 删除配置
router.delete('/configs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    data.aiConfigs = data.aiConfigs.filter(c => c.id !== id);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: '配置删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除配置失败' });
  }
});

// 获取预设列表
router.get('/presets', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    res.json({ success: true, data: data.presets || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: '读取预设失败' });
  }
});

// 保存预设
router.post('/presets', (req, res) => {
  try {
    const preset = req.body;
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    
    if (!data.presets) data.presets = [];
    
    if (preset.id) {
      const index = data.presets.findIndex(p => p.id === preset.id);
      if (index >= 0) {
        data.presets[index] = { ...preset, updatedAt: new Date().toISOString() };
      } else {
        data.presets.push({ ...preset, createdAt: new Date().toISOString() });
      }
    } else {
      preset.id = Date.now().toString();
      preset.createdAt = new Date().toISOString();
      data.presets.push(preset);
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: '预设保存成功', data: preset });
  } catch (error) {
    res.status(500).json({ success: false, error: '保存预设失败' });
  }
});

// 删除预设
router.delete('/presets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    data.presets = (data.presets || []).filter(p => p.id !== id);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: '预设删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除预设失败' });
  }
});

export default router;
