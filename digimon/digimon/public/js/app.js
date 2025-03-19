// 全局变量
let playerData = null;
let digimonsData = null;
let itemsData = null;
let currentBattle = null;
let mapData = null;
let playerPosition = { x: 0, y: 0 };

// DOM元素
const screens = {
  main: document.getElementById('main-screen'),
  battle: document.getElementById('battle-screen'),
  digimons: document.getElementById('digimons-screen'),
  items: document.getElementById('items-screen'),
  map: document.getElementById('map-screen')
};

// 初始化函数
async function initGame() {
  try {
    // 获取游戏数据
    await Promise.all([
      fetchPlayerData(),
      fetchDigimonsData(),
      fetchItemsData()
    ]);
    
    // 初始化地图数据
    initMapData();
    
    // 更新UI
    updatePlayerInfo();
    
    // 添加事件监听器
    setupEventListeners();
  } catch (error) {
    console.error('游戏初始化失败:', error);
    alert('游戏加载失败，请刷新页面重试');
  }
}

// 获取玩家数据
async function fetchPlayerData() {
  const response = await fetch('/api/player');
  playerData = await response.json();
  return playerData;
}

// 获取数码宝贝数据
async function fetchDigimonsData() {
  const response = await fetch('/api/digimons');
  digimonsData = await response.json();
  return digimonsData;
}

// 获取物品数据
async function fetchItemsData() {
  const response = await fetch('/api/items');
  itemsData = await response.json();
  return itemsData;
}

// 更新玩家信息
function updatePlayerInfo() {
  document.getElementById('player-name').textContent = playerData.name;
}

// 设置事件监听器
function setupEventListeners() {
  // 主界面按钮
  document.getElementById('explore-map-btn').addEventListener('click', () => showScreen('map'));
  document.getElementById('view-digimons-btn').addEventListener('click', () => showScreen('digimons'));
  document.getElementById('view-items-btn').addEventListener('click', () => showScreen('items'));
  
  // 返回按钮
  document.getElementById('back-from-digimons-btn').addEventListener('click', () => showScreen('main'));
  document.getElementById('back-from-items-btn').addEventListener('click', () => showScreen('main'));
  document.getElementById('back-from-map-btn').addEventListener('click', () => showScreen('main'));
  
  // 战斗界面按钮
  document.getElementById('battle-skills-btn').addEventListener('click', showSkillsMenu);
  document.getElementById('battle-items-btn').addEventListener('click', showItemsMenu);
  document.getElementById('battle-switch-btn').addEventListener('click', showDigimonsMenu);
  document.getElementById('battle-run-btn').addEventListener('click', runFromBattle);
  
  // 地图移动按钮
  document.getElementById('move-up').addEventListener('click', () => movePlayer(0, -1));
  document.getElementById('move-down').addEventListener('click', () => movePlayer(0, 1));
  document.getElementById('move-left').addEventListener('click', () => movePlayer(-1, 0));
  document.getElementById('move-right').addEventListener('click', () => movePlayer(1, 0));
  
  // 渲染数码宝贝和物品列表
  renderDigimonsList();
  renderItemsList();
}

// 显示指定界面
function showScreen(screenName) {
  // 隐藏所有界面
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  
  // 显示指定界面
  screens[screenName].classList.add('active');
  
  // 如果是战斗界面，隐藏所有子菜单
  if (screenName === 'battle') {
    document.querySelectorAll('.sub-menu').forEach(menu => menu.classList.remove('active'));
  }
  
  // 如果是地图界面，渲染地图
  if (screenName === 'map') {
    renderMap();
  }
}

// 渲染数码宝贝列表
function renderDigimonsList() {
  const container = document.getElementById('digimons-list');
  container.innerHTML = '';
  
  playerData.digimons.forEach(digimon => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <img src="${digimon.image}" alt="${digimon.name}">
      <h3>${digimon.name}</h3>
      <p>等级: ${digimon.level}</p>
      <p>HP: ${digimon.hp}/${digimon.maxHp}</p>
    `;
    container.appendChild(item);
  });
}

// 渲染物品列表
function renderItemsList() {
  const container = document.getElementById('items-list');
  container.innerHTML = '';
  
  playerData.items.forEach(playerItem => {
    const item = itemsData.find(i => i.id === playerItem.id);
    if (item && playerItem.quantity > 0) {
      const itemElement = document.createElement('div');
      itemElement.className = 'list-item';
      itemElement.innerHTML = `
        <h3>${item.name}</h3>
        <p>数量: ${playerItem.quantity}</p>
        <p>效果: ${getItemEffectDescription(item)}</p>
      `;
      container.appendChild(itemElement);
    }
  });
}

// 获取物品效果描述
function getItemEffectDescription(item) {
  switch (item.effect) {
    case 'heal':
      return `恢复 ${item.value} 点生命值`;
    case 'attack':
      return `提高 ${item.value} 点攻击力`;
    case 'defense':
      return `提高 ${item.value} 点防御力`;
    default:
      return '未知效果';
  }
}

// 开始战斗
async function startBattle() {
  try {
    const response = await fetch('/api/battle/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    currentBattle = await response.json();
    
    // 更新战斗界面
    updateBattleUI();
    
    // 显示战斗界面
    showScreen('battle');
  } catch (error) {
    console.error('开始战斗失败:', error);
    alert('无法开始战斗，请重试');
  }
}

// 更新战斗界面
function updateBattleUI() {
  // 更新野生数码宝贝信息
  const wildDigimon = currentBattle.wildDigimon;
  document.getElementById('wild-digimon-name').textContent = wildDigimon.name;
  document.getElementById('wild-digimon-img').src = wildDigimon.image;
  document.getElementById('wild-digimon-hp').textContent = `${wildDigimon.hp}/${wildDigimon.maxHp}`;
  document.getElementById('wild-digimon-hp-bar').style.width = `${(wildDigimon.hp / wildDigimon.maxHp) * 100}%`;
  
  // 更新玩家数码宝贝信息
  const playerDigimon = currentBattle.playerDigimon;
  document.getElementById('player-digimon-name').textContent = playerDigimon.name;
  document.getElementById('player-digimon-img').src = playerDigimon.image;
  document.getElementById('player-digimon-hp').textContent = `${playerDigimon.hp}/${playerDigimon.maxHp}`;
  document.getElementById('player-digimon-hp-bar').style.width = `${(playerDigimon.hp / playerDigimon.maxHp) * 100}%`;
  
  // 重置战斗消息
  document.getElementById('battle-message-text').textContent = '战斗开始！';
}

// 显示技能菜单
function showSkillsMenu() {
  // 隐藏所有子菜单
  document.querySelectorAll('.sub-menu').forEach(menu => menu.classList.remove('active'));
  
  // 显示技能菜单
  const skillsContainer = document.getElementById('skills-container');
  skillsContainer.classList.add('active');
  
  // 清空技能菜单
  skillsContainer.innerHTML = '';
  
  // 添加技能按钮
  currentBattle.playerDigimon.skills.forEach(skill => {
    const button = document.createElement('button');
    button.className = 'skill-btn';
    button.textContent = skill.name;
    button.addEventListener('click', () => useSkill(skill.id));
    skillsContainer.appendChild(button);
  });
}

// 显示物品菜单
function showItemsMenu() {
  // 隐藏所有子菜单
  document.querySelectorAll('.sub-menu').forEach(menu => menu.classList.remove('active'));
  
  // 显示物品菜单
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.classList.add('active');
  
  // 清空物品菜单
  itemsContainer.innerHTML = '';
  
  // 添加物品按钮
  playerData.items.forEach(playerItem => {
    if (playerItem.quantity > 0) {
      const item = itemsData.find(i => i.id === playerItem.id);
      const button = document.createElement('button');
      button.className = 'item-btn';
      button.textContent = `${item.name} (${playerItem.quantity})`;
      button.addEventListener('click', () => useItem(item.id));
      itemsContainer.appendChild(button);
    }
  });
}

// 显示数码宝贝菜单
function showDigimonsMenu() {
  // 隐藏所有子菜单
  document.querySelectorAll('.sub-menu').forEach(menu => menu.classList.remove('active'));
  
  // 显示数码宝贝菜单
  const digimonsContainer = document.getElementById('digimons-container');
  digimonsContainer.classList.add('active');
  
  // 清空数码宝贝菜单
  digimonsContainer.innerHTML = '';
  
  // 添加数码宝贝按钮
  playerData.digimons.forEach(digimon => {
    if (digimon.id !== currentBattle.playerDigimon.id) {
      const button = document.createElement('button');
      button.className = 'digimon-btn';
      button.textContent = `${digimon.name} (HP: ${digimon.hp}/${digimon.maxHp})`;
      button.addEventListener('click', () => switchDigimon(digimon.id));
      digimonsContainer.appendChild(button);
    }
  });
}

// 使用技能
async function useSkill(skillId) {
  try {
    const response = await fetch(`/api/battle/${currentBattle.id}/skill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ skillId })
    });
    
    const result = await response.json();
    
    // 更新战斗状态
    currentBattle = result.battle;
    
    // 更新战斗界面
    updateBattleUI();
    
    // 显示战斗消息
    document.getElementById('battle-message-text').textContent = result.message;
    
    // 检查战斗是否结束
    checkBattleEnd();
  } catch (error) {
    console.error('使用技能失败:', error);
    alert('无法使用技能，请重试');
  }
}

// 使用物品
async function useItem(itemId) {
  try {
    const response = await fetch(`/api/battle/${currentBattle.id}/item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemId })
    });
    
    const result = await response.json();
    
    // 更新战斗状态
    currentBattle = result.battle;
    
    // 更新战斗界面
    updateBattleUI();
    
    // 显示战斗消息
    document.getElementById('battle-message-text').textContent = result.message;
    
    // 检查战斗是否结束
    checkBattleEnd();
    
    // 隐藏物品菜单
    document.getElementById('items-container').classList.remove('active');
    
    // 更新玩家数据
    await fetchPlayerData();
  } catch (error) {
    console.error('使用物品失败:', error);
    alert('无法使用物品，请重试');
  }
}

// 切换数码宝贝
async function switchDigimon(digimonId) {
  try {
    const response = await fetch(`/api/battle/${currentBattle.id}/switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ digimonId })
    });
    
    const result = await response.json();
    
    // 更新战斗状态
    currentBattle = result.battle;
    
    // 更新战斗界面
    updateBattleUI();
    
    // 显示战斗消息
    document.getElementById('battle-message-text').textContent = result.message;
    
    // 检查战斗是否结束
    checkBattleEnd();
    
    // 隐藏数码宝贝菜单
    document.getElementById('digimons-container').classList.remove('active');
  } catch (error) {
    console.error('切换数码宝贝失败:', error);
    alert('无法切换数码宝贝，请重试');
  }
}

// 逃跑
async function runFromBattle() {
  try {
    const response = await fetch(`/api/battle/${currentBattle.id}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    // 更新战斗状态
    currentBattle = result.battle;
    
    // 显示战斗消息
    document.getElementById('battle-message-text').textContent = result.message;
    
    // 如果成功逃跑，返回主界面
    if (currentBattle.status === 'escaped') {
      setTimeout(() => {
        showScreen('main');
      }, 1500);
    } else {
      // 更新战斗界面
      updateBattleUI();
      
      // 检查战斗是否结束
      checkBattleEnd();
    }
  } catch (error) {
    console.error('逃跑失败:', error);
    alert('无法逃跑，请重试');
  }
}

// 检查战斗是否结束
function checkBattleEnd() {
  if (currentBattle.status === 'win') {
    setTimeout(() => {
      alert('恭喜你赢得了战斗！');
      showScreen('main');
    }, 1500);
  } else if (currentBattle.status === 'lose') {
    setTimeout(() => {
      alert('很遗憾，你输掉了战斗！');
      showScreen('main');
    }, 1500);
  }
}

// 初始化地图数据
function initMapData() {
  // 创建10x10的地图
  mapData = [];
  
  // 地形类型
  const terrainTypes = [
    { type: 'grass', name: '草原', encounterRate: 20 },
    { type: 'forest', name: '森林', encounterRate: 30 },
    { type: 'mountain', name: '山地', encounterRate: 15 },
    { type: 'water', name: '水域', encounterRate: 10 }
  ];
  
  // 生成随机地图
  for (let y = 0; y < 10; y++) {
    const row = [];
    for (let x = 0; x < 10; x++) {
      // 随机选择地形
      const terrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
      row.push({
        type: terrain.type,
        name: terrain.name,
        encounterRate: terrain.encounterRate,
        x: x,
        y: y
      });
    }
    mapData.push(row);
  }
  
  // 设置初始位置为中心点
  playerPosition = { x: 4, y: 4 };
}

// 渲染地图
function renderMap() {
  const mapContainer = document.getElementById('map-container');
  mapContainer.innerHTML = '';
  
  // 渲染地图瓦片
  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      const tile = mapData[y][x];
      const tileElement = document.createElement('div');
      tileElement.className = 'map-tile';
      tileElement.style.backgroundImage = `url('images/map/${tile.type}.svg')`;
      
      // 如果是玩家位置，添加玩家标记
      if (x === playerPosition.x && y === playerPosition.y) {
        const playerMarker = document.createElement('img');
        playerMarker.src = 'images/map/player.svg';
        playerMarker.className = 'player-marker';
        tileElement.appendChild(playerMarker);
      }
      
      mapContainer.appendChild(tileElement);
    }
  }
  
  // 更新当前位置信息
  const currentTile = mapData[playerPosition.y][playerPosition.x];
  document.getElementById('current-location').textContent = currentTile.name;
  document.getElementById('encounter-rate').textContent = `遇敌率: ${currentTile.encounterRate}%`;
}

// 移动玩家
function movePlayer(dx, dy) {
  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;
  
  // 检查是否超出地图边界
  if (newX < 0 || newX >= 10 || newY < 0 || newY >= 10) {
    return;
  }
  
  // 更新玩家位置
  playerPosition.x = newX;
  playerPosition.y = newY;
  
  // 重新渲染地图
  renderMap();
  
  // 随机遇敌检测
  checkRandomEncounter();
}

// 随机遇敌检测
function checkRandomEncounter() {
  const currentTile = mapData[playerPosition.y][playerPosition.x];
  const encounterRate = currentTile.encounterRate;
  
  // 随机数判断是否遇敌
  if (Math.random() * 100 < encounterRate) {
    startBattle();
  }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);