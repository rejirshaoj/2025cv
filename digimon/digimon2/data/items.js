// 道具数据
const items = [
  {
    id: 1,
    name: "恢复药水",
    type: "恢复",
    effect: "hp",
    value: 50,
    price: 100,
    description: "恢复数码宝贝50点HP。"
  },
  {
    id: 2,
    name: "高级恢复药水",
    type: "恢复",
    effect: "hp",
    value: 100,
    price: 200,
    description: "恢复数码宝贝100点HP。"
  },
  {
    id: 3,
    name: "全满恢复药水",
    type: "恢复",
    effect: "hp",
    value: 999,
    price: 500,
    description: "完全恢复数码宝贝的HP。"
  },
  {
    id: 4,
    name: "技能点恢复剂",
    type: "恢复",
    effect: "pp",
    value: 10,
    price: 150,
    description: "恢复数码宝贝一个技能的10点PP。"
  },
  {
    id: 5,
    name: "全技能恢复剂",
    type: "恢复",
    effect: "pp_all",
    value: 10,
    price: 300,
    description: "恢复数码宝贝所有技能的10点PP。"
  },
  {
    id: 6,
    name: "攻击强化剂",
    type: "强化",
    effect: "attack",
    value: 10,
    duration: 3,
    price: 250,
    description: "在战斗中提高数码宝贝的攻击力10点，持续3回合。"
  },
  {
    id: 7,
    name: "防御强化剂",
    type: "强化",
    effect: "defense",
    value: 10,
    duration: 3,
    price: 250,
    description: "在战斗中提高数码宝贝的防御力10点，持续3回合。"
  },
  {
    id: 8,
    name: "速度强化剂",
    type: "强化",
    effect: "speed",
    value: 10,
    duration: 3,
    price: 250,
    description: "在战斗中提高数码宝贝的速度10点，持续3回合。"
  },
  {
    id: 9,
    name: "捕获装置",
    type: "捕获",
    catchRate: 30,
    price: 200,
    description: "用于捕获野生数码宝贝，成功率为30%。"
  },
  {
    id: 10,
    name: "高级捕获装置",
    type: "捕获",
    catchRate: 50,
    price: 400,
    description: "用于捕获野生数码宝贝，成功率为50%。"
  },
  {
    id: 11,
    name: "逃脱绳索",
    type: "逃脱",
    successRate: 100,
    price: 100,
    description: "100%成功从野生数码宝贝的战斗中逃脱。"
  },
  {
    id: 12,
    name: "经验值加倍器",
    type: "经验",
    multiplier: 1.5,
    duration: 10,
    price: 500,
    description: "使数码宝贝获得的经验值增加50%，持续10场战斗。"
  }
];

module.exports = items;