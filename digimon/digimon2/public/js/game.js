// 游戏主类
class Game {
  constructor() {
    // 初始化游戏组件
    this.ui = new GameUI();
    this.world = new GameWorld();
    this.player = null;
    
    // 初始化Socket.io连接
    this.initSocketConnection();
    
    // 初始化玩家
    this.initPlayer();
    
    // 初始化键盘控制
    this.initKeyboardControls();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.world.onResize();
    });
  }
  
  // 初始化Socket.io连接
  initSocketConnection() {
    window.socket = io();
    
    // 监听其他玩家移动
    window.socket.on('playerMoved', (data) => {
      // 在实际多人游戏中，这里应该更新其他玩家的位置
      console.log('其他玩家移动:', data);
    });
    
    // 监听玩家断开连接
    window.socket.on('playerDisconnected', (playerId) => {
      // 在实际多人游戏中，这里应该移除断开连接的玩家
      console.log('玩家断开连接:', playerId);
    });
  }
  
  // 初始化玩家
  async initPlayer() {
    // 创建玩家实例
    this.player = new Player();
    window.player = this.player; // 全局访问
    
    // 设置玩家到世界中
    this.world.setPlayer(this.player);
    
    // 等待玩家数据加载完成
    await this.waitForPlayerDataLoaded();
  }
  
  // 等待玩家数据加载完成
  async waitForPlayerDataLoaded() {
    // 简单的等待机制，确保玩家的队伍和背包已加载
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (this.player.team.length > 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // 设置超时，防止无限等待
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }
  
  // 初始化键盘控制
  initKeyboardControls() {
    // 按键状态
    const keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      w: false,
      a: false,
      s: false,
      d: false,
      ' ': false // 空格键
    };
    
    // 按键按下事件
    window.addEventListener('keydown', (e) => {
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
      }
    });
    
    // 按键释放事件
    window.addEventListener('keyup', (e) => {
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
      }
    });
    
    // 游戏循环
    setInterval(() => {
      // 只在世界地图屏幕激活时处理移动
      if (!document.getElementById('world-container').classList.contains('active')) {
        return;
      }
      
      // 处理移动
      if (keys.ArrowUp || keys.w) {
        this.player.move('up');
      } else if (keys.ArrowDown || keys.s) {
        this.player.move('down');
      } else if (keys.ArrowLeft || keys.a) {
        this.player.move('left');
      } else if (keys.ArrowRight || keys.d) {
        this.player.move('right');
      } else {
        this.player.stopMoving();
      }
      
      // 更新视口
      this.world.updateViewport();
      
      // 检查NPC交互
      if (keys[' ']) {
        const npc = this.world.checkNPCInteraction();
        if (npc) {
          console.log(`与${npc.name}交互: ${npc.message}`);
          // 这里可以实现NPC对话或战斗逻辑
        }
      }
    }, 1000 / 60); // 约60FPS
  }
}

// 当页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
  // 创建游戏实例
  window.game = new Game();
});