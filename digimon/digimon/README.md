# 数码宝贝冒险

一个基于Web的数码宝贝主题游戏，类似于宝可梦的回合制战斗系统，使用数码宝贝素材。

## 项目概述

数码宝贝冒险是一个网页端游戏，玩家可以收集、培养和战斗各种数码宝贝。游戏包含探索地图、战斗系统、数码宝贝收集和物品管理等核心功能。

## 功能特点

- **数码宝贝系统**：多种数码宝贝可供收集，每个数码宝贝拥有独特的属性和技能
- **回合制战斗**：与野生数码宝贝进行回合制战斗，使用技能、物品或更换数码宝贝
- **物品系统**：使用各种物品恢复生命值或提升属性
- **地图探索**：探索不同区域，遇到野生数码宝贝
- **简洁美观的界面**：直观的游戏界面，易于操作

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (原生)
- **后端**：Node.js, Express
- **数据存储**：服务器内存存储（开发阶段）
- **依赖管理**：npm

## 安装指南

### 前提条件

- Node.js (v12.0.0 或更高版本)
- npm (v6.0.0 或更高版本)

### 安装步骤

1. 克隆仓库
```
git clone [仓库URL]
cd digimon
```

2. 安装依赖
```
npm install
```

3. 启动服务器
```
npm start
```

4. 访问游戏
在浏览器中打开 `http://localhost:3000` 即可开始游戏

## 游戏指南

### 主界面

游戏主界面提供三个主要选项：
- **探索地图**：进入地图界面，可以移动探索不同区域
- **查看数码宝贝**：查看你拥有的数码宝贝及其详细信息
- **查看物品**：查看你拥有的物品及其效果

### 战斗系统

在地图探索时，有几率遇到野生数码宝贝并进入战斗。战斗界面提供以下选项：
- **技能**：使用当前数码宝贝的技能攻击对手
- **物品**：使用物品恢复生命值或提升属性
- **更换**：更换出战的数码宝贝
- **逃跑**：尝试逃离战斗（成功率基于速度差异）

### 地图探索

在地图界面，你可以使用方向按钮移动角色。不同区域有不同的遇敌率和可能遇到的数码宝贝种类。

## 开发计划

- [ ] 添加更多数码宝贝和技能
- [ ] 实现数码宝贝进化系统
- [ ] 添加训练师对战功能
- [ ] 实现持久化数据存储
- [ ] 添加音效和背景音乐

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议。请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件

## 致谢

- 数码宝贝是万代南梦宫娱乐公司的商标和版权
- 本项目仅用于学习和教育目的