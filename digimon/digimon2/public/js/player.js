// 玩家类
class Player {
  constructor(x, y) {
    this.x = x || 500; // 初始X坐标
    this.y = y || 500; // 初始Y坐标
    this.direction = 'down'; // 朝向：up, down, left, right
    this.isMoving = false;
    this.speed = 5; // 移动速度
    this.team = []; // 玩家的数码宝贝队伍
    this.inventory = []; // 玩家的道具背包
    this.money = 1000; // 初始金钱
    
    // 加载玩家精灵队伍
    this.loadTeam();
    // 加载玩家背包
    this.loadInventory();
  }
  
  // 加载玩家的数码宝贝队伍
  async loadTeam() {
    try {
      // 在实际游戏中，这里应该从服务器或本地存储加载玩家的队伍
      // 这里为了演示，我们直接加载第一个数码宝贝作为初始精灵
      const response = await fetch('/api/digimons');
      const digimons = await response.json();
      
      if (digimons && digimons.length > 0) {
        // 将第一个数码宝贝添加到队伍中
        const starterDigimon = new Digimon(digimons[0]);
        this.team.push(starterDigimon);
        console.log(`初始数码宝贝: ${starterDigimon.name}已添加到队伍`);
      }
    } catch (error) {
      console.error('加载队伍失败:', error);
    }
  }
  
  // 加载玩家的道具背包
  async loadInventory() {
    try {
      // 在实际游戏中，这里应该从服务器或本地存储加载玩家的背包
      // 这里为了演示，我们直接加载一些初始道具
      const response = await fetch('/api/items');
      const items = await response.json();
      
      if (items && items.length > 0) {
        // 添加一些初始道具
        this.addItemToInventory(items.find(item => item.id === 1), 5); // 5个恢复药水
        this.addItemToInventory(items.find(item => item.id === 9), 3); // 3个捕获装置
        this.addItemToInventory(items.find(item => item.id === 11), 1); // 1个逃脱绳索
      }
    } catch (error) {
      console.error('加载背包失败:', error);
    }
  }
  
  // 移动玩家
  move(direction) {
    this.direction = direction;
    this.isMoving = true;
    
    // 根据方向更新坐标
    switch (direction) {
      case 'up':
        this.y -= this.speed;
        break;
      case 'down':
        this.y += this.speed;
        break;
      case 'left':
        this.x -= this.speed;
        break;
      case 'right':
        this.x += this.speed;
        break;
    }
    
    // 边界检查
    this.x = Math.max(0, Math.min(this.x, 1950)); // 地图宽度限制
    this.y = Math.max(0, Math.min(this.y, 1950)); // 地图高度限制
    
    // 更新玩家元素的位置和朝向
    const playerElement = document.getElementById('player');
    if (playerElement) {
      playerElement.style.transform = `translate(${this.x}px, ${this.y}px)`;
      // 可以根据朝向更改玩家的图像或动画
    }
    
    // 发送移动信息到服务器（多人游戏时使用）
    this.sendMoveToServer();
    
    // 检查是否遇到野生数码宝贝
    this.checkWildDigimonEncounter();
  }
  
  // 停止移动
  stopMoving() {
    this.isMoving = false;
  }
  
  // 发送移动信息到服务器
  sendMoveToServer() {
    if (window.socket) {
      window.socket.emit('playerMove', {
        x: this.x,
        y: this.y,
        direction: this.direction
      });
    }
  }
  
  // 检查是否遇到野生数码宝贝
  checkWildDigimonEncounter() {
    // 在草地区域有几率遇到野生数码宝贝
    // 这里简化为随机几率
    if (Math.random() < 0.01) { // 1%的几率
      this.encounterWildDigimon();
    }
  }
  
  // 遇到野生数码宝贝
  async encounterWildDigimon() {
    try {
      // 获取所有数码宝贝数据
      const response = await fetch('/api/digimons');
      const digimons = await response.json();
      
      if (digimons && digimons.length > 0) {
        // 随机选择一个野生数码宝贝
        const randomIndex = Math.floor(Math.random() * digimons.length);
        const wildDigimonData = digimons[randomIndex];
        
        // 创建野生数码宝贝实例
        const wildDigimon = new Digimon(wildDigimonData);
        
        // 调整野生数码宝贝的等级，基于玩家队伍中最高等级的数码宝贝
        const playerHighestLevel = this.getHighestDigimonLevel();
        wildDigimon.level = Math.max(1, Math.floor(playerHighestLevel * (0.8 + Math.random() * 0.4))); // 80%-120%的玩家最高等级
        
        // 根据等级调整属性
        wildDigimon.hp = Math.floor(wildDigimonData.hp * (1 + (wildDigimon.level - 1) * 0.1));
        wildDigimon.attack = Math.floor(wildDigimonData.attack * (1 + (wildDigimon.level - 1) * 0.1));
        wildDigimon.defense = Math.floor(wildDigimonData.defense * (1 + (wildDigimon.level - 1) * 0.1));
        wildDigimon.speed = Math.floor(wildDigimonData.speed * (1 + (wildDigimon.level - 1) * 0.1));
        wildDigimon.currentHp = wildDigimon.hp;
        
        // 触发战斗开始事件
        const battleStartEvent = new CustomEvent('battleStart', {
          detail: {
            playerDigimon: this.team[0], // 使用队伍中的第一个数码宝贝
            wildDigimon: wildDigimon
          }
        });
        document.dispatchEvent(battleStartEvent);
      }
    } catch (error) {
      console.error('遇到野生数码宝贝时出错:', error);
    }
  }
  
  // 获取队伍中最高等级的数码宝贝等级
  getHighestDigimonLevel() {
    if (this.team.length === 0) return 1;
    
    return Math.max(...this.team.map(digimon => digimon.level));
  }
  
  // 添加数码宝贝到队伍
  addDigimonToTeam(digimon) {
    if (this.team.length < 6) { // 最多6个数码宝贝
      this.team.push(digimon);
      return true;
    }
    return false;
  }
  
  // 从队伍中移除数码宝贝
  removeDigimonFromTeam(index) {
    if (index >= 0 && index < this.team.length) {
      // 不允许移除最后一个数码宝贝
      if (this.team.length <= 1) {
        return false;
      }
      
      this.team.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // 添加道具到背包
  addItemToInventory(item, quantity = 1) {
    // 检查背包中是否已有该道具
    const existingItem = this.inventory.find(i => i.item.id === item.id);
    
    if (existingItem) {
      // 增加数量
      existingItem.quantity += quantity;
    } else {
      // 添加新道具
      this.inventory.push({
        item: item,
        quantity: quantity
      });
    }
  }
  
  // 从背包中移除道具
  removeItemFromInventory(itemId, quantity = 1) {
    const itemIndex = this.inventory.findIndex(i => i.item.id === itemId);
    
    if (itemIndex >= 0) {
      // 减少数量
      this.inventory[itemIndex].quantity -= quantity;
      
      // 如果数量为0或负数，移除该道具
      if (this.inventory[itemIndex].quantity <= 0) {
        this.inventory.splice(itemIndex, 1);
      }
      
      return true;
    }
    
    return false;
  }
  
  // 使用道具
  useItem(itemId, targetDigimon) {
    const inventoryItem = this.inventory.find(i => i.item.id === itemId);
    
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return { success: false, message: '没有该道具！' };
    }
    
    // 根据道具类型处理效果
    const item = inventoryItem.item;
    let result = { success: false, message: '无法使用该道具！' };
    
    // 这里简化处理，实际游戏中需要根据不同道具类型实现不同效果
    if (item.type === '恢复' && targetDigimon) {
      if (item.effect === 'hp') {
        const healResult = targetDigimon.heal(item.value);
        result = {
          success: true,
          message: healResult.message
        };
      }
    }
    
    // 如果使用成功，减少道具数量
    if (result.success) {
      this.removeItemFromInventory(itemId, 1);
    }
    
    return result;
  }
}