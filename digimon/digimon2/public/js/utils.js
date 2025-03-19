// 工具函数

// 随机整数生成器（包含min和max）
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 计算两点之间的距离
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// 保存游戏数据到本地存储
function saveGameData(player) {
  try {
    const gameData = {
      player: {
        x: player.x,
        y: player.y,
        money: player.money,
        team: player.team.map(digimon => ({
          id: digimon.id,
          level: digimon.level,
          currentHp: digimon.currentHp,
          experience: digimon.experience,
          nextLevelExp: digimon.nextLevelExp
        })),
        inventory: player.inventory.map(item => ({
          itemId: item.item.id,
          quantity: item.quantity
        }))
      },
      timestamp: Date.now()
    };
    
    localStorage.setItem('digimonGameSave', JSON.stringify(gameData));
    return true;
  } catch (error) {
    console.error('保存游戏失败:', error);
    return false;
  }
}

// 从本地存储加载游戏数据
async function loadGameData() {
  try {
    const savedData = localStorage.getItem('digimonGameSave');
    if (!savedData) return null;
    
    const gameData = JSON.parse(savedData);
    
    // 加载数码宝贝数据
    const response = await fetch('/api/digimons');
    const digimons = await response.json();
    
    // 加载道具数据
    const itemsResponse = await fetch('/api/items');
    const items = await itemsResponse.json();
    
    return {
      playerPosition: {
        x: gameData.player.x,
        y: gameData.player.y
      },
      playerMoney: gameData.player.money,
      playerTeam: gameData.player.team.map(savedDigimon => {
        const baseDigimon = digimons.find(d => d.id === savedDigimon.id);
        if (!baseDigimon) return null;
        
        const digimon = new Digimon(baseDigimon);
        digimon.level = savedDigimon.level;
        digimon.currentHp = savedDigimon.currentHp;
        digimon.experience = savedDigimon.experience;
        digimon.nextLevelExp = savedDigimon.nextLevelExp;
        
        return digimon;
      }).filter(d => d !== null),
      playerInventory: gameData.player.inventory.map(savedItem => {
        const item = items.find(i => i.id === savedItem.itemId);
        if (!item) return null;
        
        return {
          item: item,
          quantity: savedItem.quantity
        };
      }).filter(i => i !== null)
    };
  } catch (error) {
    console.error('加载游戏失败:', error);
    return null;
  }
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}