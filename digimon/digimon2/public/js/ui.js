// 游戏UI类
class GameUI {
  constructor() {
    // 游戏屏幕元素
    this.worldContainer = document.getElementById('world-container');
    this.battleContainer = document.getElementById('battle-container');
    this.inventoryContainer = document.getElementById('inventory-container');
    this.teamContainer = document.getElementById('team-container');
    
    // 战斗UI元素
    this.enemyDigimonElement = document.getElementById('enemy-digimon');
    this.playerDigimonElement = document.getElementById('player-digimon');
    this.battleMenu = document.getElementById('battle-menu');
    this.skillsMenu = document.getElementById('skills-menu');
    this.itemsMenu = document.getElementById('items-menu');
    this.digimonsMenu = document.getElementById('digimons-menu');
    this.battleMessage = document.getElementById('battle-message');
    
    // 按钮元素
    this.attackBtn = document.getElementById('attack-btn');
    this.itemsBtn = document.getElementById('items-btn');
    this.digimonBtn = document.getElementById('digimon-btn');
    this.runBtn = document.getElementById('run-btn');
    this.menuButton = document.getElementById('menu-button');
    this.gameMenu = document.getElementById('game-menu');
    this.inventoryBtn = document.getElementById('inventory-btn');
    this.teamBtn = document.getElementById('team-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.closeInventoryBtn = document.getElementById('close-inventory');
    this.closeTeamBtn = document.getElementById('close-team');
    
    // 背包和队伍元素
    this.inventoryItems = document.getElementById('inventory-items');
    this.teamDigimons = document.getElementById('team-digimons');
    
    // 当前活动的子菜单
    this.activeSubmenu = null;
    
    // 初始化事件监听
    this.initEventListeners();
  }
  
  // 初始化事件监听
  initEventListeners() {
    // 菜单按钮点击事件
    this.menuButton.addEventListener('click', () => {
      this.toggleGameMenu();
    });
    
    // 背包按钮点击事件
    this.inventoryBtn.addEventListener('click', () => {
      this.showInventory();
      this.hideGameMenu();
    });
    
    // 队伍按钮点击事件
    this.teamBtn.addEventListener('click', () => {
      this.showTeam();
      this.hideGameMenu();
    });
    
    // 保存按钮点击事件
    this.saveBtn.addEventListener('click', () => {
      this.saveGame();
      this.hideGameMenu();
    });
    
    // 关闭背包按钮点击事件
    this.closeInventoryBtn.addEventListener('click', () => {
      this.hideInventory();
    });
    
    // 关闭队伍按钮点击事件
    this.closeTeamBtn.addEventListener('click', () => {
      this.hideTeam();
    });
    
    // 战斗菜单按钮点击事件
    this.attackBtn.addEventListener('click', () => {
      this.showSkillsMenu();
    });
    
    this.itemsBtn.addEventListener('click', () => {
      this.showItemsMenu();
    });
    
    this.digimonBtn.addEventListener('click', () => {
      this.showDigimonsMenu();
    });
    
    this.runBtn.addEventListener('click', () => {
      this.tryEscape();
    });
    
    // 监听战斗开始事件
    document.addEventListener('battleStart', (event) => {
      this.startBattle(event.detail.playerDigimon, event.detail.wildDigimon);
    });
    
    // 监听战斗结束事件
    document.addEventListener('battleEnd', (event) => {
      this.endBattle(event.detail.winner, event.detail.log);
    });
    
    // 监听回合结束事件
    document.addEventListener('turnEnd', (event) => {
      this.updateBattleUI(event.detail.nextTurn, event.detail.log);
    });
  }
  
  // 切换游戏菜单显示/隐藏
  toggleGameMenu() {
    this.gameMenu.classList.toggle('hidden');
  }
  
  // 隐藏游戏菜单
  hideGameMenu() {
    this.gameMenu.classList.add('hidden');
  }
  
  // 显示背包
  showInventory() {
    this.hideAllScreens();
    this.inventoryContainer.classList.add('active');
    this.renderInventory();
  }
  
  // 隐藏背包
  hideInventory() {
    this.inventoryContainer.classList.remove('active');
    this.worldContainer.classList.add('active');
  }
  
  // 显示队伍
  showTeam() {
    this.hideAllScreens();
    this.teamContainer.classList.add('active');
    this.renderTeam();
  }
  
  // 隐藏队伍
  hideTeam() {
    this.teamContainer.classList.remove('active');
    this.worldContainer.classList.add('active');
  }
  
  // 隐藏所有屏幕
  hideAllScreens() {
    this.worldContainer.classList.remove('active');
    this.battleContainer.classList.remove('active');
    this.inventoryContainer.classList.remove('active');
    this.teamContainer.classList.remove('active');
  }
  
  // 渲染背包
  renderInventory() {
    // 清空背包显示
    this.inventoryItems.innerHTML = '';
    
    // 获取玩家背包数据
    const inventory = window.player.inventory;
    
    // 如果背包为空
    if (inventory.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = '背包是空的';
      this.inventoryItems.appendChild(emptyMessage);
      return;
    }
    
    // 渲染每个道具
    inventory.forEach(inventoryItem => {
      const item = inventoryItem.item;
      const quantity = inventoryItem.quantity;
      
      const itemElement = document.createElement('div');
      itemElement.className = 'inventory-item';
      
      const itemImage = document.createElement('div');
      itemImage.className = 'item-image';
      // 这里可以设置道具图片
      
      const itemName = document.createElement('div');
      itemName.className = 'item-name';
      itemName.textContent = `${item.name} x${quantity}`;
      
      const itemDescription = document.createElement('div');
      itemDescription.className = 'item-description';
      itemDescription.textContent = item.description;
      
      itemElement.appendChild(itemImage);
      itemElement.appendChild(itemName);
      itemElement.appendChild(itemDescription);
      
      // 添加点击事件
      itemElement.addEventListener('click', () => {
        this.onItemClick(item.id);
      });
      
      this.inventoryItems.appendChild(itemElement);
    });
  }
  
  // 渲染队伍
  renderTeam() {
    // 清空队伍显示
    this.teamDigimons.innerHTML = '';
    
    // 获取玩家队伍数据
    const team = window.player.team;
    
    // 如果队伍为空
    if (team.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = '队伍是空的';
      this.teamDigimons.appendChild(emptyMessage);
      return;
    }
    
    // 渲染每个数码宝贝
    team.forEach((digimon, index) => {
      const digimonElement = document.createElement('div');
      digimonElement.className = 'team-digimon';
      
      const digimonImage = document.createElement('div');
      digimonImage.className = 'team-digimon-image';
      digimonImage.style.backgroundImage = `url(${digimon.image})`;
      
      const digimonName = document.createElement('div');
      digimonName.className = 'team-digimon-name';
      digimonName.textContent = digimon.name;
      
      const digimonStats = document.createElement('div');
      digimonStats.className = 'team-digimon-stats';
      digimonStats.textContent = `Lv.${digimon.level} HP:${digimon.currentHp}/${digimon.hp}`;
      
      digimonElement.appendChild(digimonImage);
      digimonElement.appendChild(digimonName);
      digimonElement.appendChild(digimonStats);
      
      // 添加点击事件
      digimonElement.addEventListener('click', () => {
        this.onDigimonClick(index);
      });
      
      this.teamDigimons.appendChild(digimonElement);
    });
  }
  
  // 道具点击事件
  onItemClick(itemId) {
    // 在非战斗状态下使用道具
    // 这里可以实现道具使用逻辑
    console.log(`使用道具ID: ${itemId}`);
  }
  
  // 数码宝贝点击事件
  onDigimonClick(index) {
    // 在非战斗状态下查看数码宝贝详情
    // 这里可以实现数码宝贝详情显示逻辑
    console.log(`查看数码宝贝索引: ${index}`);
  }
  
  // 保存游戏
  saveGame() {
    // 这里实现保存游戏逻辑
    console.log('游戏已保存');
    // 可以使用localStorage或发送请求到服务器保存游戏数据
  }
  
  // 开始战斗
  startBattle(playerDigimon, enemyDigimon) {
    // 隐藏世界屏幕，显示战斗屏幕
    this.hideAllScreens();
    this.battleContainer.classList.add('active');
    
    // 创建战斗实例
    window.currentBattle = new Battle(playerDigimon, enemyDigimon);
    
    // 初始化战斗UI
    this.updateBattleUI('start');
    
    // 开始战斗
    const battleResult = window.currentBattle.start();
    
    // 更新战斗消息
    this.updateBattleMessage(battleResult.log);
    
    // 如果敌人先手，自动进行敌人回合
    if (battleResult.firstTurn === 'enemy') {
      setTimeout(() => {
        window.currentBattle.enemyTurn();
      }, 1000);
    }
  }
  
  // 结束战斗
  endBattle(winner, log) {
    // 更新战斗消息
    this.updateBattleMessage(log);
    
    // 延迟返回世界地图
    setTimeout(() => {
      this.hideAllScreens();
      this.worldContainer.classList.add('active');
      window.currentBattle = null;
    }, 3000);
  }
  
  // 更新战斗UI
  updateBattleUI(turnState, log) {
    // 获取当前战斗
    const battle = window.currentBattle;
    if (!battle) return;
    
    // 更新敌人数码宝贝信息
    const enemyDigimon = battle.enemyDigimon;
    const enemyNameElement = this.enemyDigimonElement.querySelector('.digimon-name');
    const enemyLevelElement = this.enemyDigimonElement.querySelector('.digimon-level');
    const enemyHpFillElement = this.enemyDigimonElement.querySelector('.hp-fill');
    const enemySpriteElement = this.enemyDigimonElement.querySelector('.digimon-sprite');
    
    enemyNameElement.textContent = enemyDigimon.name;
    enemyLevelElement.textContent = `Lv.${enemyDigimon.level}`;
    enemyHpFillElement.style.width = `${(enemyDigimon.currentHp / enemyDigimon.hp) * 100}%`;
    enemySpriteElement.style.backgroundImage = `url(${enemyDigimon.image})`;
    
    // 更新玩家数码宝贝信息
    const playerDigimon = battle.playerDigimon;
    const playerNameElement = this.playerDigimonElement.querySelector('.digimon-name');
    const playerLevelElement = this.playerDigimonElement.querySelector('.digimon-level');
    const playerHpFillElement = this.playerDigimonElement.querySelector('.hp-fill');
    const playerSpriteElement = this.playerDigimonElement.querySelector('.digimon-sprite');
    
    playerNameElement.textContent = playerDigimon.name;
    playerLevelElement.textContent = `Lv.${playerDigimon.level}`;
    playerHpFillElement.style.width = `${(playerDigimon.currentHp / playerDigimon.hp) * 100}%`;
    playerSpriteElement.style.backgroundImage = `url(${playerDigimon.image})`;
    
    // 更新战斗消息
    if (log) {
      this.updateBattleMessage(log);
    }
    
    // 根据回合状态更新UI
    if (turnState === 'player') {
      // 玩家回合，启用战斗菜单
      this.enableBattleMenu();
    } else if (turnState === 'enemy') {
      // 敌人回合，禁用战斗菜单
      this.disableBattleMenu();
    }
  }
  
  // 更新战斗消息
  updateBattleMessage(log) {
    if (!log || log.length === 0) return;
    
    // 显示最新的消息
    const latestMessage = log[log.length - 1];
    this.battleMessage.textContent = latestMessage;
  }
  
  // 启用战斗菜单
  enableBattleMenu() {
    this.attackBtn.disabled = false;
    this.itemsBtn.disabled = false;
    this.digimonBtn.disabled = false;
    this.runBtn.disabled = false;
  }
  
  // 禁用战斗菜单
  disableBattleMenu() {
    this.attackBtn.disabled = true;
    this.itemsBtn.disabled = true;
    this.digimonBtn.disabled = true;
    this.runBtn.disabled = true;
    
    // 隐藏所有子菜单
    this.hideAllSubmenus();
  }
  
  // 显示技能菜单
  async showSkillsMenu() {
    // 隐藏其他子菜单
    this.hideAllSubmenus();
    
    // 清空技能菜单
    this.skillsMenu.innerHTML = '';
    
    // 获取当前数码宝贝的技能
    const skills = await window.currentBattle.playerDigimon.getSkills();
    
    // 创建技能按钮
    skills.forEach((skill, index) => {
      const skillBtn = document.createElement('button');
      skillBtn.className = 'skill-btn';
      skillBtn.textContent = `${skill.name} (PP: ${skill.pp}/${skill.maxPP || 30})`;
      
      // 添加点击事件
      skillBtn.addEventListener('click', () => {
        this.onSkillClick(index);
      });
      
      this.skillsMenu.appendChild(skillBtn);
    });
    
    // 显示技能菜单
    this.skillsMenu.classList.add('active');
    this.activeSubmenu = this.skillsMenu;
  }
  
  // 显示道具菜单
  showItemsMenu() {
    // 隐藏其他子菜单
    this.hideAllSubmenus();
    
    // 清空道具菜单
    this.itemsMenu.innerHTML = '';
    
    // 获取玩家背包
    const inventory = window.player.inventory;
    
    // 如果背包为空
    if (inventory.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = '背包是空的';
      this.itemsMenu.appendChild(emptyMessage);
    } else {
      // 创建道具按钮
      inventory.forEach(inventoryItem => {
        const item = inventoryItem.item;
        const quantity = inventoryItem.quantity;
        
        const itemBtn = document.createElement('button');
        itemBtn.className = 'item-btn';
        itemBtn.textContent = `${item.name} x${quantity}`;
        
        // 添加点击事件
        itemBtn.addEventListener('click', () => {
          this.onBattleItemClick(item.id);
        });
        
        this.itemsMenu.appendChild(itemBtn);
      });
    }
    
    // 显示道具菜单
    this.itemsMenu.classList.add('active');
    this.activeSubmenu = this.itemsMenu;
  }
  
  // 显示数码宝贝菜单
  showDigimonsMenu() {
    // 隐藏其他子菜单
    this.hideAllSubmenus();
    
    // 清空数码宝贝菜单
    this.digimonsMenu.innerHTML = '';
    
    // 获取玩家队伍
    const team = window.player.team;
    
    // 创建数码宝贝按钮
    team.forEach((digimon, index) => {
      const digimonBtn = document.createElement('button');
      digimonBtn.className = 'digimon-btn';
      digimonBtn.textContent = `${digimon.name} Lv.${digimon.level} HP:${digimon.currentHp}/${digimon.hp}`;
      
      // 如果是当前战斗中的数码宝贝，禁用按钮
      if (digimon === window.currentBattle.playerDigimon) {
        digimonBtn.disabled = true;
        digimonBtn.textContent += ' (战斗中)';
      }
      
      // 添加点击事件
      digimonBtn.addEventListener('click', () => {
        this.onBattleDigimonClick(index);
      });
      
      this.digimonsMenu.appendChild(digimonBtn);
    });
    
    // 显示数码宝贝菜单
    this.digimonsMenu.classList.add('active');
    this.activeSubmenu = this.digimonsMenu;
  }
  
  // 隐藏所有子菜单
  hideAllSubmenus() {
    this.skillsMenu.classList.remove('active');
    this.itemsMenu.classList.remove('active');
    this.digimonsMenu.classList.remove('active');
    this.activeSubmenu = null;
  }
  
  // 技能点击事件
  async onSkillClick(skillIndex) {
    // 隐藏子菜单
    this.hideAllSubmenus();
    
    // 禁用战斗菜单
    this.disableBattleMenu();
    
    // 使用技能
    const result = await window.currentBattle.playerUseSkill(skillIndex);
    
    // 如果战斗结束
    if (result.battleEnd) {
      // 战斗结束事件会自动处理
    }
  }
  
  // 战斗中道具点击事件
  onBattleItemClick(itemId) {
    // 隐藏子菜单
    this.hideAllSubmenus();
    
    // 禁用战斗菜单
    this.disableBattleMenu();
    
    // 使用道具
    const item = window.player.inventory.find(i => i.item.id === itemId).item;
    const result = window.currentBattle.useItem(item, window.currentBattle.playerDigimon);
    
    // 如果使用成功，从背包中移除道具
    if (result.success) {
      window.player.removeItemFromInventory(itemId, 1);
    }
  }
  
  // 战斗中数码宝贝点击事件
  onBattleDigimonClick(index) {
    // 隐藏子菜单
    this.hideAllSubmenus();
    
    // 禁用战斗菜单
    this.disableBattleMenu();
    
    // 切换数码宝贝
    const newDigimon = window.player.team[index];
    window.currentBattle.switchDigimon(newDigimon);
  }
  
  // 尝试逃跑
  tryEscape() {
    // 禁用战斗菜单
    this.disableBattleMenu();
    
    // 尝试逃跑
    window.currentBattle.tryEscape();
  }
}