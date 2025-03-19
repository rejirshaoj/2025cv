const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 游戏数据
const digimons = require('./data/digimons');
const skills = require('./data/skills');
const items = require('./data/items');

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由
app.get('/api/digimons', (req, res) => {
  res.json(digimons);
});

app.get('/api/skills', (req, res) => {
  res.json(skills);
});

app.get('/api/items', (req, res) => {
  res.json(items);
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  // 处理玩家移动
  socket.on('playerMove', (data) => {
    // 广播玩家移动信息给其他玩家
    socket.broadcast.emit('playerMoved', {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });

  // 处理战斗请求
  socket.on('battleRequest', (data) => {
    // 处理战斗逻辑
    // ...
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
    // 通知其他玩家该玩家已离开
    socket.broadcast.emit('playerDisconnected', socket.id);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});