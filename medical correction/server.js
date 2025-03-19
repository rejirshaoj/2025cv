const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

// 启用CORS和JSON解析
app.use(cors());
app.use(bodyParser.json());

// 医学术语替换规则库
const medicalTerms = {
  '鸡少站': '肌少症',
  '北塔葡聚糖': 'β-葡聚糖',
  '5引号苷酸': "5'-核苷酸",
  '阿尔茨海默': '阿尔茨海默',
  '胰岛素样生长因子': '胰岛素样生长因子',
  '脱氧核糖核酸': '脱氧核糖核酸',
  '阿尔兹海默': '阿尔茨海默',
  '阿尔茨海默氏症': '阿尔茨海默病',
  '帕金森氏症': '帕金森病',
  '心肌梗死': '心肌梗死',
  '心肌梗塞': '心肌梗死',
  '高血压': '高血压',
  '糖尿病': '糖尿病',
  '二型糖尿病': '2型糖尿病',
  '一型糖尿病': '1型糖尿病',
  '冠心病': '冠心病',
  '脑卒中': '脑卒中',
  '脑梗死': '脑梗死',
  '脑梗塞': '脑梗死',
  '肺炎': '肺炎',
  '肺气肿': '肺气肿',
  '慢阻肺': '慢性阻塞性肺疾病',
  '慢性阻塞性肺病': '慢性阻塞性肺疾病',
  '哮喘': '哮喘',
  '支气管炎': '支气管炎',
  '肝炎': '肝炎',
  '肝硬化': '肝硬化',
  '肝癌': '肝癌',
  '胃炎': '胃炎',
  '胃溃疡': '胃溃疡',
  '十二指肠溃疡': '十二指肠溃疡',
  '结肠炎': '结肠炎',
  '克罗恩病': '克罗恩病',
  '溃疡性结肠炎': '溃疡性结肠炎',
  '肾炎': '肾炎',
  '肾病综合征': '肾病综合征',
  '尿毒症': '尿毒症',
  '类风湿关节炎': '类风湿关节炎',
  '骨质疏松': '骨质疏松',
  '骨关节炎': '骨关节炎',
  '痛风': '痛风',
  '甲状腺功能亢进': '甲状腺功能亢进',
  '甲亢': '甲状腺功能亢进',
  '甲状腺功能减退': '甲状腺功能减退',
  '甲减': '甲状腺功能减退'
};

// 按领域分类的术语
const domainTerms = {
  '医学临床': {
    '鸡少站': '肌少症',
    '阿尔兹海默': '阿尔茨海默',
    '阿尔茨海默氏症': '阿尔茨海默病',
    '帕金森氏症': '帕金森病',
    '心肌梗死': '心肌梗死',
    '心肌梗塞': '心肌梗死',
    '高血压': '高血压',
    '糖尿病': '糖尿病'
  },
  '营养学': {
    '北塔葡聚糖': 'β-葡聚糖',
    '鸡少站': '肌少症',
    '二型糖尿病': '2型糖尿病',
    '一型糖尿病': '1型糖尿病'
  },
  '生物化学': {
    '5引号苷酸': "5'-核苷酸",
    '脱氧核糖核酸': '脱氧核糖核酸'
  },
  '药理学': {
    '阿尔茨海默': '阿尔茨海默',
    '帕金森氏症': '帕金森病'
  },
  '免疫学': {
    '类风湿关节炎': '类风湿关节炎',
    '克罗恩病': '克罗恩病',
    '溃疡性结肠炎': '溃疡性结肠炎'
  },
  '分子生物学': {
    '胰岛素样生长因子': '胰岛素样生长因子',
    '脱氧核糖核酸': '脱氧核糖核酸'
  }
};

// 获取API状态
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    rulesCount: Object.keys(medicalTerms).length,
    domains: Object.keys(domainTerms),
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  });
});

// 处理文本
app.post('/api/process', (req, res) => {
  const { text, domain } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: '请提供需要处理的文本' });
  }
  
  let termsToUse = medicalTerms;
  let replacementCount = 0;
  let replacements = [];
  
  // 如果指定了特定领域且不是"全部领域"
  if (domain && domain !== '全部领域' && domainTerms[domain]) {
    termsToUse = domainTerms[domain];
  }
  
  let processedText = text;
  
  // 替换所有匹配的术语
  for (const [incorrect, correct] of Object.entries(termsToUse)) {
    const regex = new RegExp(incorrect, 'g');
    const matches = processedText.match(regex);
    
    if (matches) {
      replacementCount += matches.length;
      replacements.push({ original: incorrect, replacement: correct, count: matches.length });
    }
    processedText = processedText.replace(regex, correct);
  }
  
  // 返回处理结果
  res.json({
    processedText: processedText,
    replacementCount: replacementCount,
    totalRules: Object.keys(termsToUse).length,
    domain: domain || '全部领域',
    summary: {
      replacements: replacements.slice(0, 10), // 只返回前10个替换项，避免响应过大
      totalReplacements: replacements.length
    }
  });
});

// 提供静态文件服务
app.use(express.static('.'));

// 启动服务器
app.listen(port, () => {
  console.log(`医学语音文字校正API服务器运行在 http://localhost:${port}`);
  console.log(`已加载 ${Object.keys(medicalTerms).length} 条医学术语规则`);
  console.log(`覆盖 ${Object.keys(domainTerms).length} 个专业领域`);
});