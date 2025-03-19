// 游戏配置
const CONFIG = {
  // 游戏基本设置
  GAME_TITLE: '数码宝贝冒险',
  VERSION: '1.0.0',
  
  // 地图设置
  MAP_WIDTH: 2000,
  MAP_HEIGHT: 2000,
  
  // 玩家设置
  PLAYER_SPEED: 5,
  PLAYER_START_X: 500,
  PLAYER_START_Y: 500,
  PLAYER_MAX_TEAM_SIZE: 6,
  
  // 战斗设置
  WILD_ENCOUNTER_RATE: 0.05, // 5%的几率遇到野生数码宝贝
  ESCAPE_BASE_RATE: 0.3,     // 基础逃跑成功率
  
  // 经验值设置
  EXP_MULTIPLIER: 30,        // 击败敌人获得的经验值倍数
  LEVEL_UP_EXP_BASE: 100,    // 升级所需的基础经验值
  
  // 捕获设置
  CATCH_HP_MODIFIER: 0.7,    // HP对捕获率的影响系数
  
  // 游戏难度设置
  DIFFICULTY: 'normal',      // easy, normal, hard
  
  // 调试模式
  DEBUG: false
};