// 工具函数

// 生成指定范围内的随机数
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 检查两个气泡是否重叠
function checkOverlap(bubble1, bubble2, padding = 10) {
    const dx = bubble1.x - bubble2.x;
    const dy = bubble1.y - bubble2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (bubble1.radius + bubble2.radius + padding);
}

// 检查气泡是否在容器内
function isInContainer(bubble, container) {
    return (
        bubble.x - bubble.radius >= 0 &&
        bubble.x + bubble.radius <= container.width &&
        bubble.y - bubble.radius >= 0 &&
        bubble.y + bubble.radius <= container.height
    );
}

// 格式化时间（将秒转换为分:秒格式）
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// 保存游戏进度到本地存储
function saveGameProgress(level, completed = false) {
    const progress = JSON.parse(localStorage.getItem('wordGameProgress') || '{}');
    
    if (!progress[level] || completed) {
        progress[level] = {
            unlocked: true,
            completed: completed
        };
        
        // 解锁下一关
        if (completed && level < 10) {
            progress[level + 1] = {
                unlocked: true,
                completed: false
            };
        }
        
        localStorage.setItem('wordGameProgress', JSON.stringify(progress));
    }
}

// 获取游戏进度
function getGameProgress() {
    return JSON.parse(localStorage.getItem('wordGameProgress') || '{}');
}

// 保存自定义单词对到本地存储
function saveCustomWordPairs(wordPairs) {
    localStorage.setItem('customWordPairs', JSON.stringify(wordPairs));
}

// 获取自定义单词对
function getCustomWordPairs() {
    return JSON.parse(localStorage.getItem('customWordPairs') || '[]');
}

// 保存自定义图片对到本地存储
function saveCustomImagePairs(imagePairs) {
    localStorage.setItem('customImagePairs', JSON.stringify(imagePairs));
}

// 获取自定义图片对
function getCustomImagePairs() {
    return JSON.parse(localStorage.getItem('customImagePairs') || '[]');
}

// 显示模态框
function showModal(modalId) {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById(modalId).classList.add('active');
}

// 隐藏模态框
function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 创建气泡元素
function createBubbleElement(word, type, size) {
    const bubble = document.createElement('div');
    bubble.className = `bubble ${type}`;
    bubble.textContent = word;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.fontSize = `${size / 5}px`;
    return bubble;
}

// 创建图片气泡元素
function createImageBubbleElement(imageSrc, type, size) {
    const bubble = document.createElement('div');
    bubble.className = `bubble ${type}`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.backgroundImage = `url(${imageSrc})`;
    bubble.style.backgroundSize = 'cover';
    bubble.style.backgroundPosition = 'center';
    return bubble;
}