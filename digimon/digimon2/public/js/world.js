// 游戏世界类
class GameWorld {
  constructor() {
    this.mapElement = document.getElementById('game-map');
    this.playerElement = document.getElementById('player');
    this.npcsElement = document.getElementById('npcs');
    this.wildDigimonsElement = document.getElementById('wild-digimons');
    
    this.mapWidth = 2000;
    this.mapHeight = 2000;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    
    this.player = null;
    this.npcs = [];
    this.wildDigimons = [];
    
    // 初始化地图
    this.initMap();
  }
  
  // 初始化地图
  initMap() {
    // 创建草地和其他地形
    this.createTerrain();
    
    // 创建NPC
    this.createNPCs();
    
    // 创建野生数码宝贝区域
    this.createWildDigimonAreas();
  }
  
  // 创建地形
  createTerrain() {
    // 在实际游戏中，这里应该加载地图数据并渲染不同的地形
    // 这里简化为创建一些随机的地形元素
    
    // 创建一些树木
    for (let i = 0; i < 50; i++) {
      const tree = document.createElement('div');
      tree.className = 'terrain tree';
      tree.style.left = `${Math.random() * this.mapWidth}px`;
      tree.style.top = `${Math.random() * this.mapHeight}px`;
      this.mapElement.appendChild(tree);
    }
    
    // 创建一些水域
    for (let i = 0; i < 10; i++) {
      const water = document.createElement('div');
      water.className = 'terrain water';
      water.style.left = `${Math.random() * this.mapWidth}px`;
      water.style.top = `${Math.random() * this.mapHeight}px`;
      water.style.width = `${100 + Math.random() * 200}px`;
      water.style.height = `${100 + Math.random() * 200}px`;
      this.mapElement.appendChild(water);
    }
    
    // 创建一些高草区域（野生数码宝贝出现区域）
    for (let i = 0; i < 15; i++) {
      const grass = document.createElement('div');
      grass.className = 'terrain tall-grass';
      grass.style.left = `${Math.random() * this.mapWidth}px`;
      grass.style.top = `${Math.random() * this.mapHeight}px`;
      grass.style.width = `${150 + Math.random() * 250}px`;
      grass.style.height = `${150 + Math.random() * 250}px`;
      this.mapElement.appendChild(grass);
    }
  }
  
  // 创建NPC
  createNPCs() {
    // 在实际游戏中，这里应该加载NPC数据并创建NPC
    // 这里简化为创建一些随机的NPC
    
    // 创建一些训练师NPC
    for (let i = 0; i < 5; i++) {
      const npc = document.createElement('div');
      npc.className = 'npc trainer';
      npc.style.left = `${200 + Math.random() * (this.mapWidth - 400)}px`;
      npc.style.top = `${200 + Math.random() * (this.mapHeight - 400)}px`;
      this.npcsElement.appendChild(npc);
      
      // 添加NPC数据
      this.npcs.push({
        element: npc,
        x: parseInt(npc.style.left),
        y: parseInt(npc.style.top),
        type: 'trainer',
        name: `训练师${i + 1}`,
        message: '想要挑战我吗？',
        digimons: [] // 在实际游戏中，这里应该有NPC的数码宝贝队伍
      });
    }
    
    // 创建一些商人NPC
    for (let i = 0; i < 3; i++) {
      const npc = document.createElement('div');
      npc.className = 'npc merchant';
      npc.style.left = `${200 + Math.random() * (this.mapWidth - 400)}px`;
      npc.style.top = `${200 + Math.random() * (this.mapHeight - 400)}px`;
      this.npcsElement.appendChild(npc);
      
      // 添加NPC数据
      this.npcs.push({
        element: npc,
        x: parseInt(npc.style.left),
        y: parseInt(npc.style.top),
        type: 'merchant',
        name: `商人${i + 1}`,
        message: '有什么需要购买的吗？',
        items: [] // 在实际游戏中，这里应该有商人的商品列表
      });
    }
  }
  
  // 创建野生数码宝贝区域
  createWildDigimonAreas() {
    // 在实际游戏中，这里应该定义不同区域出现的野生数码宝贝
    // 这里简化为记录高草区域
    const grassAreas = document.querySelectorAll('.tall-grass');
    
    // 记录每个高草区域的位置和大小
    this.wildDigimonAreas = Array.from(grassAreas).map(area => {
      return {
        x: parseInt(area.style.left),
        y: parseInt(area.style.top),
        width: parseInt(area.style.width),
        height: parseInt(area.style.height),
        digimonTypes: [] // 在实际游戏中，这里应该有该区域可能出现的数码宝贝类型
      };
    });
  }
  
  // 设置玩家
  setPlayer(player) {
    this.player = player;
    
    // 初始化玩家位置
    this.playerElement.style.transform = `translate(${player.x}px, ${player.y}px)`;
    
    // 设置视口跟随玩家
    this.updateViewport();
  }
  
  // 更新视口位置（使玩家保持在视口中心）
  updateViewport() {
    if (!this.player) return;
    
    // 计算视口位置
    const viewportX = Math.max(0, Math.min(this.player.x - this.viewportWidth / 2, this.mapWidth - this.viewportWidth));
    const viewportY = Math.max(0, Math.min(this.player.y - this.viewportHeight / 2, this.mapHeight - this.viewportHeight));
    
    // 移动地图元素来实现视口移动
    this.mapElement.style.transform = `translate(${-viewportX}px, ${-viewportY}px)`;
  }
  
  // 检查玩家与NPC的交互
  checkNPCInteraction() {
    if (!this.player) return null;
    
    // 检查玩家是否靠近任何NPC
    for (const npc of this.npcs) {
      const distance = Math.sqrt(
        Math.pow(this.player.x - npc.x, 2) + 
        Math.pow(this.player.y - npc.y, 2)
      );
      
      // 如果玩家足够靠近NPC（这里设置为50像素）
      if (distance < 50) {
        return npc;
      }
    }
    
    return null;
  }
  
  // 检查玩家是否在高草区域
  isPlayerInTallGrass() {
    if (!this.player) return false;
    
    // 检查玩家是否在任何高草区域内
    for (const area of this.wildDigimonAreas) {
      if (
        this.player.x >= area.x && 
        this.player.x <= area.x + area.width && 
        this.player.y >= area.y && 
        this.player.y <= area.y + area.height
      ) {
        return true;
      }
    }
    
    return false;
  }
  
  // 调整窗口大小时更新视口尺寸
  onResize() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.updateViewport();
  }
}