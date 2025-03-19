// 数码宝贝类
class Digimon {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
    this.level = data.level;
    this.hp = data.hp;
    this.currentHp = data.currentHp || data.hp;
    this.attack = data.attack;
    this.defense = data.defense;
    this.speed = data.speed;
    this.skills = data.skills || [];
    this.description = data.description;
    this.experience = data.experience || 0;
    this.nextLevelExp = data.nextLevelExp || this.level * 100;
    
    // 战斗中的临时状态
    this.battleStats = {
      attack: this.attack,
      defense: this.defense,
      speed: this.speed
    };
    
    this.statusEffects = [];
  }
  
  // 获取数码宝贝的技能
  async getSkills() {
    try {
      const response = await fetch('/api/skills');
      const allSkills = await response.json();
      return this.skills.map(skillId => allSkills.find(s => s.id === skillId));
    } catch (error) {
      console.error('获取技能失败:', error);
      return [];
    }
  }
  
  // 使用技能攻击
  async useSkill(skillIndex, target) {
    const skills = await this.getSkills();
    const skill = skills[skillIndex];
    
    if (!skill) return { success: false, message: '技能不存在！' };
    
    // 检查技能PP
    if (skill.pp <= 0) return { success: false, message: `${skill.name}没有PP了！` };
    
    // 命中判定
    const hitChance = skill.accuracy / 100;
    const hit = Math.random() <= hitChance;
    
    if (!hit) return { success: true, hit: false, message: `${this.name}的${skill.name}没有命中！` };
    
    // 计算伤害
    let damage = 0;
    
    if (skill.power > 0) {
      // 攻击技能
      const attackStat = this.battleStats.attack;
      const defenseStat = target.battleStats.defense;
      
      // 基础伤害公式
      damage = Math.floor((((2 * this.level / 5 + 2) * attackStat * skill.power / defenseStat) / 50) + 2);
      
      // 随机波动 (85%-100%)
      const randomFactor = Math.random() * 0.15 + 0.85;
      damage = Math.floor(damage * randomFactor);
      
      // 确保至少造成1点伤害
      damage = Math.max(1, damage);
      
      // 应用伤害
      target.currentHp = Math.max(0, target.currentHp - damage);
      
      return {
        success: true,
        hit: true,
        damage: damage,
        message: `${this.name}使用了${skill.name}，对${target.name}造成了${damage}点伤害！`
      };
    } else {
      // 状态技能
      if (skill.type === '防御') {
        // 提高防御力
        this.battleStats.defense += Math.floor(this.defense * 0.5);
        return {
          success: true,
          hit: true,
          statChange: true,
          message: `${this.name}使用了${skill.name}，防御力提高了！`
        };
      }
      
      // 可以添加更多状态技能的效果
      
      return {
        success: true,
        hit: true,
        message: `${this.name}使用了${skill.name}！`
      };
    }
  }
  
  // 恢复HP
  heal(amount) {
    const oldHp = this.currentHp;
    this.currentHp = Math.min(this.hp, this.currentHp + amount);
    const healed = this.currentHp - oldHp;
    
    return {
      healed: healed,
      message: `${this.name}恢复了${healed}点HP！`
    };
  }
  
  // 恢复技能PP
  async restorePP(skillIndex, amount) {
    const skills = await this.getSkills();
    const skill = skills[skillIndex];
    
    if (!skill) return { success: false, message: '技能不存在！' };
    
    const oldPP = skill.pp;
    skill.pp = Math.min(skill.maxPP || 30, skill.pp + amount);
    const restored = skill.pp - oldPP;
    
    return {
      restored: restored,
      message: `${this.name}的${skill.name}恢复了${restored}点PP！`
    };
  }
  
  // 获取经验值
  gainExperience(amount) {
    this.experience += amount;
    
    // 检查是否升级
    if (this.experience >= this.nextLevelExp) {
      this.levelUp();
      return {
        levelUp: true,
        newLevel: this.level,
        message: `${this.name}升级到了${this.level}级！`
      };
    }
    
    return {
      levelUp: false,
      message: `${this.name}获得了${amount}点经验值！`
    };
  }
  
  // 升级
  levelUp() {
    this.level += 1;
    
    // 属性提升
    this.hp = Math.floor(this.hp * 1.1);
    this.attack = Math.floor(this.attack * 1.1);
    this.defense = Math.floor(this.defense * 1.1);
    this.speed = Math.floor(this.speed * 1.1);
    
    // 完全恢复HP
    this.currentHp = this.hp;
    
    // 设置下一级所需经验
    this.nextLevelExp = this.level * 100;
    
    // 更新战斗状态
    this.battleStats = {
      attack: this.attack,
      defense: this.defense,
      speed: this.speed
    };
  }
  
  // 重置战斗状态
  resetBattleStats() {
    this.battleStats = {
      attack: this.attack,
      defense: this.defense,
      speed: this.speed
    };
    this.statusEffects = [];
  }
}