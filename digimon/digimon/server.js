const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 存储游戏数据
let gameData = {
  digimons: [
    {
      id: 'digi-001',
      name: 'Agumon',
      image: 'images/digimons/agumon.jpg',
      level: 5,
      hp: 100,
      maxHp: 100,
      attack: 15,
      defense: 10,
      speed: 10,
      skills: [
        { id: 'skill-001', name: '火焰喷射', damage: 20, type: 'fire' },
        { id: 'skill-002', name: '爪击', damage: 10, type: 'normal' }
      ]
    },
    {
      id: 'digi-002',
      name: 'Gabumon',
      image: 'images/digimons/gabumon.jpg',
      level: 5,
      hp: 90,
      maxHp: 90,
      attack: 12,
      defense: 15,
      speed: 8,
      skills: [
        { id: 'skill-003', name: '蓝色烈焰', damage: 18, type: 'ice' },
        { id: 'skill-004', name: '角撞击', damage: 12, type: 'normal' }
      ]
    },
    {
      id: 'digi-003',
      name: 'Patamon',
      image: 'images/digimons/patamon.jpg',
      level: 4,
      hp: 80,
      maxHp: 80,
      attack: 10,
      defense: 8,
      speed: 15,
      skills: [
        { id: 'skill-005', name: '空气炮', damage: 15, type: 'wind' },
        { id: 'skill-006', name: '拍击', damage: 8, type: 'normal' }
      ]
    }
  ],
  items: [
    { id: 'item-001', name: '恢复药水', effect: 'heal', value: 30 },
    { id: 'item-002', name: '强力药水', effect: 'attack', value: 5 },
    { id: 'item-003', name: '防御药水', effect: 'defense', value: 5 }
  ],
  player: {
    name: '训练师',
    digimons: ['digi-001', 'digi-002'],
    items: [
      { id: 'item-001', quantity: 3 },
      { id: 'item-002', quantity: 1 }
    ]
  },
  wildDigimons: ['digi-003']
};

// 获取所有数码宝贝
app.get('/api/digimons', (req, res) => {
  res.json(gameData.digimons);
});

// 获取玩家信息
app.get('/api/player', (req, res) => {
  // 扩展玩家数据，包含完整的数码宝贝信息
  const playerData = {
    ...gameData.player,
    digimons: gameData.player.digimons.map(id => {
      return gameData.digimons.find(d => d.id === id);
    })
  };
  res.json(playerData);
});

// 获取物品信息
app.get('/api/items', (req, res) => {
  res.json(gameData.items);
});

// 战斗系统 - 开始战斗
app.post('/api/battle/start', (req, res) => {
  // 随机选择一个野生数码宝贝
  const wildDigimonId = gameData.wildDigimons[Math.floor(Math.random() * gameData.wildDigimons.length)];
  const wildDigimon = gameData.digimons.find(d => d.id === wildDigimonId);
  
  // 创建战斗会话
  const battleId = uuidv4();
  const playerDigimon = gameData.digimons.find(d => d.id === gameData.player.digimons[0]);
  
  // 复制数码宝贝数据，避免修改原始数据
  const battleSession = {
    id: battleId,
    playerDigimon: JSON.parse(JSON.stringify(playerDigimon)),
    wildDigimon: JSON.parse(JSON.stringify(wildDigimon)),
    turn: 0,
    status: 'active'
  };
  
  // 存储战斗会话
  if (!gameData.battles) gameData.battles = {};
  gameData.battles[battleId] = battleSession;
  
  res.json(battleSession);
});

// 战斗系统 - 使用技能
app.post('/api/battle/:battleId/skill', (req, res) => {
  const { battleId } = req.params;
  const { skillId } = req.body;
  
  // 获取战斗会话
  const battle = gameData.battles[battleId];
  if (!battle || battle.status !== 'active') {
    return res.status(400).json({ error: '无效的战斗会话' });
  }
  
  // 获取技能
  const skill = battle.playerDigimon.skills.find(s => s.id === skillId);
  if (!skill) {
    return res.status(400).json({ error: '无效的技能' });
  }
  
  // 计算伤害
  const damage = Math.max(1, Math.floor(skill.damage * (battle.playerDigimon.attack / battle.wildDigimon.defense)));
  battle.wildDigimon.hp = Math.max(0, battle.wildDigimon.hp - damage);
  
  // 检查战斗是否结束
  if (battle.wildDigimon.hp <= 0) {
    battle.status = 'win';
    return res.json({
      battle,
      message: `你的${battle.playerDigimon.name}使用了${skill.name}，造成了${damage}点伤害！野生的${battle.wildDigimon.name}倒下了！`
    });
  }
  
  // 野生数码宝贝反击
  const enemySkill = battle.wildDigimon.skills[Math.floor(Math.random() * battle.wildDigimon.skills.length)];
  const enemyDamage = Math.max(1, Math.floor(enemySkill.damage * (battle.wildDigimon.attack / battle.playerDigimon.defense)));
  battle.playerDigimon.hp = Math.max(0, battle.playerDigimon.hp - enemyDamage);
  
  // 再次检查战斗是否结束
  if (battle.playerDigimon.hp <= 0) {
    battle.status = 'lose';
    return res.json({
      battle,
      message: `你的${battle.playerDigimon.name}使用了${skill.name}，造成了${damage}点伤害！野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！你的${battle.playerDigimon.name}倒下了！`
    });
  }
  
  // 更新回合数
  battle.turn += 1;
  
  res.json({
    battle,
    message: `你的${battle.playerDigimon.name}使用了${skill.name}，造成了${damage}点伤害！野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！`
  });
});

// 战斗系统 - 使用物品
app.post('/api/battle/:battleId/item', (req, res) => {
  const { battleId } = req.params;
  const { itemId } = req.body;
  
  // 获取战斗会话
  const battle = gameData.battles[battleId];
  if (!battle || battle.status !== 'active') {
    return res.status(400).json({ error: '无效的战斗会话' });
  }
  
  // 检查玩家是否拥有该物品
  const playerItem = gameData.player.items.find(i => i.id === itemId && i.quantity > 0);
  if (!playerItem) {
    return res.status(400).json({ error: '你没有这个物品' });
  }
  
  // 获取物品信息
  const item = gameData.items.find(i => i.id === itemId);
  
  // 应用物品效果
  let message = '';
  if (item.effect === 'heal') {
    const oldHp = battle.playerDigimon.hp;
    battle.playerDigimon.hp = Math.min(battle.playerDigimon.maxHp, battle.playerDigimon.hp + item.value);
    message = `使用了${item.name}，恢复了${battle.playerDigimon.hp - oldHp}点生命值！`;
  } else if (item.effect === 'attack') {
    battle.playerDigimon.attack += item.value;
    message = `使用了${item.name}，攻击力提高了${item.value}点！`;
  } else if (item.effect === 'defense') {
    battle.playerDigimon.defense += item.value;
    message = `使用了${item.name}，防御力提高了${item.value}点！`;
  }
  
  // 减少物品数量
  playerItem.quantity -= 1;
  
  // 野生数码宝贝反击
  const enemySkill = battle.wildDigimon.skills[Math.floor(Math.random() * battle.wildDigimon.skills.length)];
  const enemyDamage = Math.max(1, Math.floor(enemySkill.damage * (battle.wildDigimon.attack / battle.playerDigimon.defense)));
  battle.playerDigimon.hp = Math.max(0, battle.playerDigimon.hp - enemyDamage);
  
  // 检查战斗是否结束
  if (battle.playerDigimon.hp <= 0) {
    battle.status = 'lose';
    return res.json({
      battle,
      message: `你${message}野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！你的${battle.playerDigimon.name}倒下了！`
    });
  }
  
  // 更新回合数
  battle.turn += 1;
  
  res.json({
    battle,
    message: `你${message}野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！`
  });
});

// 战斗系统 - 更换数码宝贝
app.post('/api/battle/:battleId/switch', (req, res) => {
  const { battleId } = req.params;
  const { digimonId } = req.body;
  
  // 获取战斗会话
  const battle = gameData.battles[battleId];
  if (!battle || battle.status !== 'active') {
    return res.status(400).json({ error: '无效的战斗会话' });
  }
  
  // 检查是否是玩家的数码宝贝
  if (!gameData.player.digimons.includes(digimonId)) {
    return res.status(400).json({ error: '你没有这个数码宝贝' });
  }
  
  // 检查是否已经是当前数码宝贝
  if (battle.playerDigimon.id === digimonId) {
    return res.status(400).json({ error: '这个数码宝贝已经在战斗中' });
  }
  
  // 更换数码宝贝
  const newDigimon = gameData.digimons.find(d => d.id === digimonId);
  battle.playerDigimon = JSON.parse(JSON.stringify(newDigimon));
  
  // 野生数码宝贝攻击
  const enemySkill = battle.wildDigimon.skills[Math.floor(Math.random() * battle.wildDigimon.skills.length)];
  const enemyDamage = Math.max(1, Math.floor(enemySkill.damage * (battle.wildDigimon.attack / battle.playerDigimon.defense)));
  battle.playerDigimon.hp = Math.max(0, battle.playerDigimon.hp - enemyDamage);
  
  // 检查战斗是否结束
  if (battle.playerDigimon.hp <= 0) {
    battle.status = 'lose';
    return res.json({
      battle,
      message: `你更换了数码宝贝！野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！你的${battle.playerDigimon.name}倒下了！`
    });
  }
  
  // 更新回合数
  battle.turn += 1;
  
  res.json({
    battle,
    message: `你更换了数码宝贝！野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！`
  });
});

// 战斗系统 - 逃跑
app.post('/api/battle/:battleId/run', (req, res) => {
  const { battleId } = req.params;
  
  // 获取战斗会话
  const battle = gameData.battles[battleId];
  if (!battle || battle.status !== 'active') {
    return res.status(400).json({ error: '无效的战斗会话' });
  }
  
  // 计算逃跑成功率，基于速度差异
  const escapeChance = 0.3 + 0.4 * (battle.playerDigimon.speed / battle.wildDigimon.speed);
  const escaped = Math.random() < escapeChance;
  
  if (escaped) {
    battle.status = 'escaped';
    return res.json({
      battle,
      message: '你成功地逃离了战斗！'
    });
  } else {
    // 逃跑失败，野生数码宝贝攻击
    const enemySkill = battle.wildDigimon.skills[Math.floor(Math.random() * battle.wildDigimon.skills.length)];
    const enemyDamage = Math.max(1, Math.floor(enemySkill.damage * (battle.wildDigimon.attack / battle.playerDigimon.defense)));
    battle.playerDigimon.hp = Math.max(0, battle.playerDigimon.hp - enemyDamage);
    
    // 检查战斗是否结束
    if (battle.playerDigimon.hp <= 0) {
      battle.status = 'lose';
      return res.json({
        battle,
        message: `逃跑失败！野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！你的${battle.playerDigimon.name}倒下了！`
      });
    }
    
    // 更新回合数
    battle.turn += 1;
    
    return res.json({
      battle,
      message: `逃跑失败！野生的${battle.wildDigimon.name}使用了${enemySkill.name}，造成了${enemyDamage}点伤害！`
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});