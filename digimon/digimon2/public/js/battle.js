// 战斗系统
class Battle {
  constructor(playerDigimon, enemyDigimon) {
    this.playerDigimon = playerDigimon;
    this.enemyDigimon = enemyDigimon;
    this.turn = 0; // 回合数
    this.isPlayerTurn = playerDigimon.battleStats.speed >= enemyDigimon.battleStats.speed; // 速度高的先手
    this.battleLog = [];
    this.battleState = 'active'; // active, playerWin, enemyWin, escaped
  }
  
  // 开始战斗
  start() {
    // 重置双方战斗状态
    this.playerDigimon.resetBattleStats();
    this.enemyDigimon.resetBattleStats();
    
    // 添加战斗开始日志
    this.addLog(`野生的${this.enemyDigimon.name}出现了！`);
    this.addLog(`去吧！${this.playerDigimon.name}！`);
    
    // 决定先手
    if (this.isPlayerTurn) {
      this.addLog(`${this.playerDigimon.name}的速度更快，先手行动！`);
    } else {
      this.addLog(`${this.enemyDigimon.name}的速度更快，先手行动！`);
    }
    
    return {
      battleStarted: true,
      firstTurn: this.isPlayerTurn ? 'player' : 'enemy',
      log: this.battleLog
    };
  }
  
  // 添加战斗日志
  addLog(message) {
    this.battleLog.push(message);
    // 保持日志不超过20条
    if (this.battleLog.length > 20) {
      this.battleLog.shift();
    }
  }
  
  // 玩家回合 - 使用技能
  async playerUseSkill(skillIndex) {
    if (!this.isPlayerTurn || this.battleState !== 'active') {
      return { success: false, message: '现在不是你的回合！' };
    }
    
    // 使用技能
    const result = await this.playerDigimon.useSkill(skillIndex, this.enemyDigimon);
    
    if (!result.success) {
      this.addLog(result.message);
      return { success: false, message: result.message };
    }
    
    this.addLog(result.message);
    
    // 检查敌人是否被击败
    if (this.enemyDigimon.currentHp <= 0) {
      this.battleState = 'playerWin';
      this.addLog(`${this.enemyDigimon.name}被击败了！`);
      
      // 计算获得的经验值
      const expGained = this.enemyDigimon.level * 30;
      const expResult = this.playerDigimon.gainExperience(expGained);
      this.addLog(expResult.message);
      
      if (expResult.levelUp) {
        this.addLog(`${this.playerDigimon.name}的能力提升了！`);
      }
      
      return {
        success: true,
        battleEnd: true,
        winner: 'player',
        log: this.battleLog
      };
    }
    
    // 切换回合
    this.isPlayerTurn = false;
    this.turn++;
    
    // 自动进行敌人回合
    setTimeout(() => this.enemyTurn(), 1000);
    
    return {
      success: true,
      turnEnd: true,
      nextTurn: 'enemy',
      log: this.battleLog
    };
  }
  
  // 敌人回合
  async enemyTurn() {
    if (this.isPlayerTurn || this.battleState !== 'active') return;
    
    // 敌人随机选择技能
    const enemySkills = await this.enemyDigimon.getSkills();
    const randomSkillIndex = Math.floor(Math.random() * enemySkills.length);
    
    // 使用技能
    const result = await this.enemyDigimon.useSkill(randomSkillIndex, this.playerDigimon);
    this.addLog(result.message);
    
    // 检查玩家是否被击败
    if (this.playerDigimon.currentHp <= 0) {
      this.battleState = 'enemyWin';
      this.addLog(`${this.playerDigimon.name}被击败了！`);
      
      // 触发战斗结束事件
      const battleEndEvent = new CustomEvent('battleEnd', {
        detail: {
          winner: 'enemy',
          log: this.battleLog
        }
      });
      document.dispatchEvent(battleEndEvent);
      
      return;
    }
    
    // 切换回合
    this.isPlayerTurn = true;
    
    // 触发回合结束事件
    const turnEndEvent = new CustomEvent('turnEnd', {
      detail: {
        nextTurn: 'player',
        log: this.battleLog
      }
    });
    document.dispatchEvent(turnEndEvent);
  }
  
  // 使用道具
  useItem(item, targetDigimon) {
    if (!this.isPlayerTurn || this.battleState !== 'active') {
      return { success: false, message: '现在不是你的回合！' };
    }
    
    let result = { success: false, message: '无效的道具！' };
    
    // 处理不同类型的道具
    if (item.type === '恢复') {
      if (item.effect === 'hp') {
        // 恢复HP
        const healResult = targetDigimon.heal(item.value);
        result = {
          success: true,
          message: healResult.message
        };
      } else if (item.effect === 'pp' || item.effect === 'pp_all') {
        // 恢复PP
        // 这里需要实现PP恢复逻辑
        result = {
          success: true,
          message: `使用了${item.name}！`
        };
      }
    } else if (item.type === '强化') {
      // 处理强化道具
      if (item.effect === 'attack') {
        targetDigimon.battleStats.attack += item.value;
        result = {
          success: true,
          message: `${targetDigimon.name}的攻击力提高了！`
        };
      } else if (item.effect === 'defense') {
        targetDigimon.battleStats.defense += item.value;
        result = {
          success: true,
          message: `${targetDigimon.name}的防御力提高了！`
        };
      } else if (item.effect === 'speed') {
        targetDigimon.battleStats.speed += item.value;
        result = {
          success: true,
          message: `${targetDigimon.name}的速度提高了！`
        };
      }
    } else if (item.type === '捕获') {
      // 捕获野生数码宝贝
      // 只能捕获野生数码宝贝，不能捕获其他训练师的数码宝贝
      if (this.enemyDigimon) {
        // 计算捕获成功率
        const catchRate = item.catchRate / 100;
        const healthPercentage = this.enemyDigimon.currentHp / this.enemyDigimon.hp;
        const catchModifier = 1 - (healthPercentage * 0.7); // HP越低，捕获率越高
        
        const finalCatchRate = catchRate * catchModifier;
        const caught = Math.random() <= finalCatchRate;
        
        if (caught) {
          this.battleState = 'playerWin';
          result = {
            success: true,
            caught: true,
            message: `成功捕获了${this.enemyDigimon.name}！`
          };
        } else {
          result = {
            success: true,
            caught: false,
            message: `${this.enemyDigimon.name}挣脱了出来！`
          };
        }
      }
    } else if (item.type === '逃脱') {
      // 从战斗中逃脱
      const escapeRate = item.successRate / 100;
      const escaped = Math.random() <= escapeRate;
      
      if (escaped) {
        this.battleState = 'escaped';
        result = {
          success: true,
          escaped: true,
          message: '成功逃离了战斗！'
        };
      } else {
        result = {
          success: true,
          escaped: false,
          message: '逃跑失败！'
        };
      }
    }
    
    // 添加使用道具的日志
    this.addLog(result.message);
    
    // 如果战斗结束，返回结果
    if (this.battleState !== 'active') {
      return {
        success: true,
        battleEnd: true,
        result: result,
        log: this.battleLog
      };
    }
    
    // 如果没有结束战斗，切换回合
    this.isPlayerTurn = false;
    this.turn++;
    
    // 自动进行敌人回合
    setTimeout(() => this.enemyTurn(), 1000);
    
    return {
      success: true,
      turnEnd: true,
      nextTurn: 'enemy',
      result: result,
      log: this.battleLog
    };
  }
  
  // 尝试逃跑
  tryEscape() {
    if (!this.isPlayerTurn || this.battleState !== 'active') {
      return { success: false, message: '现在不是你的回合！' };
    }
    
    // 计算逃跑成功率
    const playerSpeed = this.playerDigimon.battleStats.speed;
    const enemySpeed = this.enemyDigimon.battleStats.speed;
    let escapeChance = 0.3 + (playerSpeed / enemySpeed) * 0.3; // 基础30%成功率，速度越快越容易逃跑
    escapeChance = Math.min(0.9, escapeChance); // 最高90%成功率
    
    const escaped = Math.random() <= escapeChance;
    
    if (escaped) {
      this.battleState = 'escaped';
      this.addLog('成功逃离了战斗！');
      
      return {
        success: true,
        escaped: true,
        battleEnd: true,
        log: this.battleLog
      };
    } else {
      this.addLog('逃跑失败！');
      
      // 切换回合
      this.isPlayerTurn = false;
      this.turn++;
      
      // 自动进行敌人回合
      setTimeout(() => this.enemyTurn(), 1000);
      
      return {
        success: true,
        escaped: false,
        turnEnd: true,
        nextTurn: 'enemy',
        log: this.battleLog
      };
    }
  }
  
  // 切换数码宝贝
  switchDigimon(newDigimon) {
    if (!this.isPlayerTurn || this.battleState !== 'active') {
      return { success: false, message: '现在不是你的回合！' };
    }
    
    // 保存当前数码宝贝的状态
    const oldDigimon = this.playerDigimon;
    
    // 切换数码宝贝
    this.playerDigimon = newDigimon;
    this.playerDigimon.resetBattleStats();
    
    this.addLog(`收回了${oldDigimon.name}！`);
    this.addLog(`去吧！${this.playerDigimon.name}！`);
    
    // 切换回合
    this.isPlayerTurn = false;
    this.turn++;
    
    // 自动进行敌人回合
    setTimeout(() => this.enemyTurn(), 1000);
    
    return {
      success: true,
      switched: true,
      turnEnd: true,
      nextTurn: 'enemy',
      log: this.battleLog
    };
  }
}