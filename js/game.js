// 游戏主逻辑

// 游戏状态
let gameState = {
    level: 1,
    wordPairs: [],
    bubbles: [],
    selectedBubble: null,
    timeLeft: 0,
    timer: null,
    gameContainer: null,
    isCustomMode: false
};

document.addEventListener('DOMContentLoaded', function() {
    // 初始化游戏
    initGame();
    
    // 开始游戏按钮
    document.getElementById('startGame').addEventListener('click', function() {
        showModal('levelSelect');
        populateLevelSelect();
    });
    
    // 自定义模式按钮
    document.getElementById('customMode').addEventListener('click', function() {
        showModal('customModeModal');
    });
    
    // 帮助按钮
    document.getElementById('help').addEventListener('click', function() {
        showModal('helpModal');
    });
    
    // 关闭模态框按钮
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });
});

// 初始化游戏
function initGame() {
    gameState.gameContainer = document.getElementById('gameContainer');
    
    // 初始化第一关
    saveGameProgress(1);
}

// 填充关卡选择界面
function populateLevelSelect() {
    const levelButtonsContainer = document.querySelector('.level-buttons');
    levelButtonsContainer.innerHTML = '';
    
    const progress = getGameProgress();
    
    for (let i = 1; i <= 10; i++) {
        const levelButton = document.createElement('button');
        levelButton.className = 'level-button';
        levelButton.textContent = `第 ${i} 关`;
        
        // 检查关卡是否解锁
        if (progress[i] && progress[i].unlocked) {
            if (progress[i].completed) {
                levelButton.classList.add('completed');
            }
            
            levelButton.addEventListener('click', function() {
                hideModal('levelSelect');
                startLevel(i);
            });
        } else {
            levelButton.classList.add('locked');
            levelButton.disabled = true;
        }
        
        levelButtonsContainer.appendChild(levelButton);
    }
    
    // 添加自定义模式按钮
    const customButton = document.createElement('button');
    customButton.className = 'level-button';
    customButton.textContent = '自定义模式';
    customButton.addEventListener('click', function() {
        hideModal('levelSelect');
        startCustomMode();
    });
    levelButtonsContainer.appendChild(customButton);
}

// 开始指定关卡
function startLevel(level) {
    gameState.level = level;
    gameState.isCustomMode = false;
    
    // 获取关卡配置
    const levelConfig = gameLevels[level - 1];
    
    // 设置时间
    gameState.timeLeft = levelConfig.timeLimit;
    
    // 获取单词对
    gameState.wordPairs = getWordPairsForLevel(level);
    
    // 开始游戏
    startGame();
}

// 开始自定义模式
function startCustomMode() {
    gameState.isCustomMode = true;
    
    // 获取自定义单词对
    const customWordPairs = getCustomWordPairs();
    const customImagePairs = getCustomImagePairs();
    
    if (customWordPairs.length === 0 && customImagePairs.length === 0) {
        alert('请先在自定义模式中添加单词对或图片对！');
        return;
    }
    
    // 设置时间（根据单词对数量）
    const totalPairs = customWordPairs.length + customImagePairs.length;
    gameState.timeLeft = Math.max(60, totalPairs * 6); // 每对至少6秒
    
    // 合并单词对和图片对
    gameState.wordPairs = [];
    
    // 添加文本单词对
    customWordPairs.forEach(pair => {
        gameState.wordPairs.push({
            english: pair.english,
            chinese: pair.chinese,
            type: 'text'
        });
    });
    
    // 添加图片单词对
    customImagePairs.forEach(pair => {
        gameState.wordPairs.push({
            englishImage: pair.englishImage,
            chineseImage: pair.chineseImage,
            type: 'image'
        });
    });
    
    // 开始游戏
    startGame();
}

// 开始游戏
function startGame() {
    // 清空游戏容器
    gameState.gameContainer.innerHTML = '';
    
    // 创建计时器和分数显示
    const infoBar = document.createElement('div');
    infoBar.className = 'info-bar';
    infoBar.innerHTML = `
        <div class="time">时间: <span id="timeDisplay">${formatTime(gameState.timeLeft)}</span></div>
        <div class="level">${gameState.isCustomMode ? '自定义模式' : `第 ${gameState.level} 关`}</div>
        <div class="pairs">剩余配对: <span id="pairsLeft">${gameState.wordPairs.length}</span></div>
    `;
    gameState.gameContainer.appendChild(infoBar);
    
    // 创建游戏区域
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';
    gameState.gameContainer.appendChild(gameArea);
    
    // 创建气泡
    createBubbles();
    
    // 开始计时器
    startTimer();
}

// 创建气泡
function createBubbles() {
    gameState.bubbles = [];
    const gameArea = document.querySelector('.game-area');
    const containerWidth = gameArea.clientWidth;
    const containerHeight = gameArea.clientHeight;
    
    // 获取关卡配置
    let bubbleSize, speed;
    if (gameState.isCustomMode) {
        bubbleSize = { min: 60, max: 80 };
        // 减慢自定义模式的速度
        speed = { min: 8, max: 15 };
    } else {
        const levelConfig = gameLevels[gameState.level - 1];
        bubbleSize = levelConfig.bubbleSize;
        // 使用关卡配置的速度，但可以在levels.js中调整
        speed = levelConfig.speed;
    }
    
    // 创建英文和中文气泡
    gameState.wordPairs.forEach((pair, index) => {
        // 英文气泡
        const englishSize = getRandomNumber(bubbleSize.min, bubbleSize.max);
        const englishBubble = {
            id: `english_${index}`,
            pairId: index,
            type: 'english',
            content: pair.type === 'image' ? pair.englishImage : pair.english,
            contentType: pair.type || 'text',
            x: getRandomNumber(englishSize, containerWidth - englishSize),
            y: getRandomNumber(englishSize, containerHeight - englishSize),
            radius: englishSize / 2,
            // 将除数从100增加到200，使气泡速度减半
            speedX: getRandomNumber(speed.min, speed.max) * (Math.random() > 0.5 ? 1 : -1) / 200,
            speedY: getRandomNumber(speed.min, speed.max) * (Math.random() > 0.5 ? 1 : -1) / 200,
            element: null
        };
        
        // 中文气泡
        const chineseSize = getRandomNumber(bubbleSize.min, bubbleSize.max);
        const chineseBubble = {
            id: `chinese_${index}`,
            pairId: index,
            type: 'chinese',
            content: pair.type === 'image' ? pair.chineseImage : pair.chinese,
            contentType: pair.type || 'text',
            x: getRandomNumber(chineseSize, containerWidth - chineseSize),
            y: getRandomNumber(chineseSize, containerHeight - chineseSize),
            radius: chineseSize / 2,
            // 将除数从100增加到200，使气泡速度减半
            speedX: getRandomNumber(speed.min, speed.max) * (Math.random() > 0.5 ? 1 : -1) / 200,
            speedY: getRandomNumber(speed.min, speed.max) * (Math.random() > 0.5 ? 1 : -1) / 200,
            element: null
        };
        
        // 确保气泡不重叠
        let attempts = 0;
        while (attempts < 50) {
            let overlap = false;
            
            for (const bubble of gameState.bubbles) {
                if (checkOverlap(englishBubble, bubble)) {
                    englishBubble.x = getRandomNumber(englishSize, containerWidth - englishSize);
                    englishBubble.y = getRandomNumber(englishSize, containerHeight - englishSize);
                    overlap = true;
                    break;
                }
                
                if (checkOverlap(chineseBubble, bubble)) {
                    chineseBubble.x = getRandomNumber(chineseSize, containerWidth - chineseSize);
                    chineseBubble.y = getRandomNumber(chineseSize, containerHeight - chineseSize);
                    overlap = true;
                    break;
                }
            }
            
            if (!overlap && !checkOverlap(englishBubble, chineseBubble)) {
                break;
            }
            
            attempts++;
        }
        
        // 创建气泡元素
        if (pair.type === 'image') {
            englishBubble.element = createImageBubbleElement(englishBubble.content, 'english', englishBubble.radius * 2);
            chineseBubble.element = createImageBubbleElement(chineseBubble.content, 'chinese', chineseBubble.radius * 2);
        } else {
            englishBubble.element = createBubbleElement(englishBubble.content, 'english', englishBubble.radius * 2);
            chineseBubble.element = createBubbleElement(chineseBubble.content, 'chinese', chineseBubble.radius * 2);
        }
        
        // 设置气泡位置
        englishBubble.element.style.left = `${englishBubble.x - englishBubble.radius}px`;
        englishBubble.element.style.top = `${englishBubble.y - englishBubble.radius}px`;
        chineseBubble.element.style.left = `${chineseBubble.x - chineseBubble.radius}px`;
        chineseBubble.element.style.top = `${chineseBubble.y - chineseBubble.radius}px`;
        
        // 添加点击事件
        englishBubble.element.addEventListener('click', () => handleBubbleClick(englishBubble));
        chineseBubble.element.addEventListener('click', () => handleBubbleClick(chineseBubble));
        
        // 添加到游戏区域
        gameArea.appendChild(englishBubble.element);
        gameArea.appendChild(chineseBubble.element);
        
        // 添加到气泡数组
        gameState.bubbles.push(englishBubble, chineseBubble);
    });
    
    // 开始气泡动画
    requestAnimationFrame(animateBubbles);
}

// 气泡动画
function animateBubbles(timestamp) {
    if (gameState.bubbles.length === 0) return;
    
    const gameArea = document.querySelector('.game-area');
    const containerWidth = gameArea.clientWidth;
    const containerHeight = gameArea.clientHeight;
    
    gameState.bubbles.forEach(bubble => {
        // 更新气泡位置
        bubble.x += bubble.speedX;
        bubble.y += bubble.speedY;
        
        // 检查边界碰撞
        if (bubble.x - bubble.radius <= 0 || bubble.x + bubble.radius >= containerWidth) {
            bubble.speedX = -bubble.speedX;
            bubble.x = Math.max(bubble.radius, Math.min(containerWidth - bubble.radius, bubble.x));
        }
        
        if (bubble.y - bubble.radius <= 0 || bubble.y + bubble.radius >= containerHeight) {
            bubble.speedY = -bubble.speedY;
            bubble.y = Math.max(bubble.radius, Math.min(containerHeight - bubble.radius, bubble.y));
        }
        
        // 更新气泡元素位置
        bubble.element.style.left = `${bubble.x - bubble.radius}px`;
        bubble.element.style.top = `${bubble.y - bubble.radius}px`;
    });
    
    // 继续动画
    if (gameState.bubbles.length > 0) {
        requestAnimationFrame(animateBubbles);
    }
}

// 处理气泡点击
function handleBubbleClick(bubble) {
    // 如果没有选中的气泡，则选中当前气泡
    if (!gameState.selectedBubble) {
        gameState.selectedBubble = bubble;
        bubble.element.classList.add('selected');
        return;
    }
    
    // 如果点击的是已选中的气泡，则取消选中
    if (gameState.selectedBubble.id === bubble.id) {
        gameState.selectedBubble.element.classList.remove('selected');
        gameState.selectedBubble = null;
        return;
    }
    
    // 检查是否匹配
    if (gameState.selectedBubble.pairId === bubble.pairId && 
        gameState.selectedBubble.type !== bubble.type) {
        // 匹配成功
        handleCorrectMatch(gameState.selectedBubble, bubble);
    } else {
        // 匹配失败
        handleWrongMatch(gameState.selectedBubble, bubble);
    }
    
    // 重置选中状态
    gameState.selectedBubble = null;
}

// 处理正确匹配
function handleCorrectMatch(bubble1, bubble2) {
    // 添加正确匹配动画
    bubble1.element.classList.add('correct');
    bubble2.element.classList.add('correct');
    
    // 播放正确音效
    playSound('correct');
    
    // 延迟移除气泡
    setTimeout(() => {
        // 从DOM中移除气泡
        if (bubble1.element.parentNode) {
            bubble1.element.parentNode.removeChild(bubble1.element);
        }
        if (bubble2.element.parentNode) {
            bubble2.element.parentNode.removeChild(bubble2.element);
        }
        
        // 从气泡数组中移除
        gameState.bubbles = gameState.bubbles.filter(b => b.id !== bubble1.id && b.id !== bubble2.id);
        
        // 更新剩余配对数
        const pairsLeft = Math.floor(gameState.bubbles.length / 2);
        document.getElementById('pairsLeft').textContent = pairsLeft;
        
        // 检查游戏是否结束
        if (pairsLeft === 0) {
            endGame(true);
        }
    }, 500);
}

// 处理错误匹配
function handleWrongMatch(bubble1, bubble2) {
    // 添加错误匹配动画
    bubble1.element.classList.add('wrong');
    bubble2.element.classList.add('wrong');
    
    // 播放错误音效
    playSound('wrong');
    
    // 移除选中状态
    bubble1.element.classList.remove('selected');
    bubble2.element.classList.remove('selected');
    
    // 延迟移除错误动画
    setTimeout(() => {
        bubble1.element.classList.remove('wrong');
        bubble2.element.classList.remove('wrong');
    }, 500);
}

// 开始计时器
function startTimer() {
    // 清除现有计时器
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    // 更新时间显示
    document.getElementById('timeDisplay').textContent = formatTime(gameState.timeLeft);
    
    // 创建新计时器
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        
        // 更新时间显示
        document.getElementById('timeDisplay').textContent = formatTime(gameState.timeLeft);
        
        // 检查时间是否用完
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// 结束游戏
function endGame(isWin) {
    // 停止计时器
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // 停止气泡动画
    gameState.bubbles.forEach(bubble => {
        bubble.speedX = 0;
        bubble.speedY = 0;
    });
    
    // 创建结果模态框
    const resultModal = document.createElement('div');
    resultModal.className = 'modal active';
    resultModal.id = 'resultModal';
    
    let resultContent;
    if (isWin) {
        // 播放胜利音效
        playSound('win');
        
        // 如果不是自定义模式，保存游戏进度
        if (!gameState.isCustomMode) {
            saveGameProgress(gameState.level, true);
        }
        
        resultContent = `
            <div class="modal-content">
                <h2>恭喜你赢了！</h2>
                <p>你成功完成了${gameState.isCustomMode ? '自定义模式' : `第 ${gameState.level} 关`}！</p>
                ${!gameState.isCustomMode && gameState.level < 10 ? `<p>已解锁第 ${gameState.level + 1} 关！</p>` : ''}
                <div class="result-buttons">
                    <button id="nextLevel">
                        ${!gameState.isCustomMode && gameState.level < 10 ? '下一关' : '返回主菜单'}
                    </button>
                    <button id="replayLevel">再玩一次</button>
                </div>
            </div>
        `;
    } else {
        // 播放失败音效
        playSound('lose');
        
        resultContent = `
            <div class="modal-content">
                <h2>时间到！</h2>
                <p>很遗憾，你没能在规定时间内完成${gameState.isCustomMode ? '自定义模式' : `第 ${gameState.level} 关`}。</p>
                <div class="result-buttons">
                    <button id="replayLevel">再试一次</button>
                    <button id="backToMenu">返回主菜单</button>
                </div>
            </div>
        `;
    }
    
    resultModal.innerHTML = resultContent;
    document.body.appendChild(resultModal);
    
    // 添加按钮事件
    if (isWin) {
        document.getElementById('nextLevel').addEventListener('click', function() {
            document.body.removeChild(resultModal);
            
            if (!gameState.isCustomMode && gameState.level < 10) {
                startLevel(gameState.level + 1);
            } else {
                resetGame();
            }
        });
        
        document.getElementById('replayLevel').addEventListener('click', function() {
            document.body.removeChild(resultModal);
            
            if (gameState.isCustomMode) {
                startCustomMode();
            } else {
                startLevel(gameState.level);
            }
        });
    } else {
        document.getElementById('replayLevel').addEventListener('click', function() {
            document.body.removeChild(resultModal);
            
            if (gameState.isCustomMode) {
                startCustomMode();
            } else {
                startLevel(gameState.level);
            }
        });
        
        document.getElementById('backToMenu').addEventListener('click', function() {
            document.body.removeChild(resultModal);
            resetGame();
        });
    }
}

// 重置游戏
function resetGame() {
    // 停止计时器
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // 清空游戏容器
    gameState.gameContainer.innerHTML = '';
    
    // 重置游戏状态
    gameState.wordPairs = [];
    gameState.bubbles = [];
    gameState.selectedBubble = null;
    gameState.timeLeft = 0;
    gameState.isCustomMode = false;
    
    // 显示欢迎信息
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.innerHTML = `
        <h2>欢迎来到单词消消乐！</h2>
        <p>点击"开始游戏"选择关卡，或者点击"自定义模式"创建自己的单词对。</p>
        <p>点击"帮助"查看游戏规则。</p>
    `;
    gameState.gameContainer.appendChild(welcomeMessage);
}

// 播放音效
function playSound(type) {
    // 创建音频元素
    const audio = new Audio();
    
    // 设置音频源
    switch (type) {
        case 'correct':
            audio.src = 'assets/sounds/correct.mp3';
            break;
        case 'wrong':
            audio.src = 'assets/sounds/wrong.mp3';
            break;
        case 'win':
            audio.src = 'assets/sounds/win.mp3';
            break;
        case 'lose':
            audio.src = 'assets/sounds/lose.mp3';
            break;
    }
    
    // 播放音频
    audio.play().catch(error => {
        console.log('音频播放失败:', error);
    });
}

// 初始化欢迎信息
resetGame();
