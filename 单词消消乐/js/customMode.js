// 自定义模式功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化自定义模式界面
    initCustomMode();
    
    // 切换标签页
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新活动标签按钮
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // 更新活动标签内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 添加单词对按钮
    document.getElementById('addWordPair').addEventListener('click', function() {
        addWordPairInput();
    });
    
    // 添加图片对按钮
    document.getElementById('addImagePair').addEventListener('click', function() {
        addImagePairInput();
    });
    
    // 保存文本单词对按钮
    document.getElementById('saveTextPairs').addEventListener('click', function() {
        saveTextWordPairs();
    });
    
    // 保存图片单词对按钮
    document.getElementById('saveImagePairs').addEventListener('click', function() {
        saveImageWordPairs();
    });
    
    // 关闭模态框按钮
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });
});

// 初始化自定义模式界面
function initCustomMode() {
    // 加载已保存的文本单词对
    const savedWordPairs = getCustomWordPairs();
    if (savedWordPairs.length > 0) {
        const container = document.querySelector('.word-pair-container');
        container.innerHTML = ''; // 清空容器
        
        savedWordPairs.forEach(pair => {
            const wordPairDiv = document.createElement('div');
            wordPairDiv.className = 'word-pair';
            wordPairDiv.innerHTML = `
                <input type="text" placeholder="英文单词" class="english-word" value="${pair.english}">
                <input type="text" placeholder="中文意思" class="chinese-word" value="${pair.chinese}">
                <button class="remove-pair">删除</button>
            `;
            container.appendChild(wordPairDiv);
            
            // 添加删除按钮事件
            wordPairDiv.querySelector('.remove-pair').addEventListener('click', function() {
                wordPairDiv.remove();
            });
        });
    } else {
        // 添加一个空的单词对输入框
        addWordPairInput();
    }
    
    // 加载已保存的图片单词对
    const savedImagePairs = getCustomImagePairs();
    if (savedImagePairs.length > 0) {
        const container = document.querySelector('.image-upload-container');
        container.innerHTML = ''; // 清空容器
        
        savedImagePairs.forEach(pair => {
            const imagePairDiv = document.createElement('div');
            imagePairDiv.className = 'image-pair';
            imagePairDiv.innerHTML = `
                <div class="upload-box">
                    <label>英文图片</label>
                    <input type="file" accept="image/*" class="english-image">
                    <div class="preview" style="background-image: url(${pair.englishImage})"></div>
                    <input type="hidden" class="image-data" value="${pair.englishImage}">
                </div>
                <div class="upload-box">
                    <label>中文图片</label>
                    <input type="file" accept="image/*" class="chinese-image">
                    <div class="preview" style="background-image: url(${pair.chineseImage})"></div>
                    <input type="hidden" class="image-data" value="${pair.chineseImage}">
                </div>
                <button class="remove-image-pair">删除</button>
            `;
            container.appendChild(imagePairDiv);
            
            // 添加删除按钮事件
            imagePairDiv.querySelector('.remove-image-pair').addEventListener('click', function() {
                imagePairDiv.remove();
            });
            
            // 添加图片预览事件
            setupImagePreview(imagePairDiv.querySelector('.english-image'));
            setupImagePreview(imagePairDiv.querySelector('.chinese-image'));
        });
    } else {
        // 添加一个空的图片对输入框
        addImagePairInput();
    }
}

// 添加单词对输入框
function addWordPairInput() {
    const container = document.querySelector('.word-pair-container');
    const wordPairDiv = document.createElement('div');
    wordPairDiv.className = 'word-pair';
    wordPairDiv.innerHTML = `
        <input type="text" placeholder="英文单词" class="english-word">
        <input type="text" placeholder="中文意思" class="chinese-word">
        <button class="remove-pair">删除</button>
    `;
    container.appendChild(wordPairDiv);
    
    // 添加删除按钮事件
    wordPairDiv.querySelector('.remove-pair').addEventListener('click', function() {
        wordPairDiv.remove();
    });
}

// 添加图片对输入框
function addImagePairInput() {
    const container = document.querySelector('.image-upload-container');
    const imagePairDiv = document.createElement('div');
    imagePairDiv.className = 'image-pair';
    imagePairDiv.innerHTML = `
        <div class="upload-box">
            <label>英文图片</label>
            <input type="file" accept="image/*" class="english-image">
            <div class="preview"></div>
            <input type="hidden" class="image-data">
        </div>
        <div class="upload-box">
            <label>中文图片</label>
            <input type="file" accept="image/*" class="chinese-image">
            <div class="preview"></div>
            <input type="hidden" class="image-data">
        </div>
        <button class="remove-image-pair">删除</button>
    `;
    container.appendChild(imagePairDiv);
    
    // 添加删除按钮事件
    imagePairDiv.querySelector('.remove-image-pair').addEventListener('click', function() {
        imagePairDiv.remove();
    });
    
    // 添加图片预览事件
    setupImagePreview(imagePairDiv.querySelector('.english-image'));
    setupImagePreview(imagePairDiv.querySelector('.chinese-image'));
}

// 设置图片预览
function setupImagePreview(fileInput) {
    fileInput.addEventListener('change', function() {
        const preview = this.parentElement.querySelector('.preview');
        const imageDataInput = this.parentElement.querySelector('.image-data');
        
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.style.backgroundImage = `url(${e.target.result})`;
                imageDataInput.value = e.target.result;
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
}

// 保存文本单词对
function saveTextWordPairs() {
    const wordPairs = [];
    const wordPairElements = document.querySelectorAll('.word-pair');
    
    wordPairElements.forEach(element => {
        const englishWord = element.querySelector('.english-word').value.trim();
        const chineseWord = element.querySelector('.chinese-word').value.trim();
        
        if (englishWord && chineseWord) {
            wordPairs.push({
                english: englishWord,
                chinese: chineseWord
            });
        }
    });
    
    if (wordPairs.length > 0) {
        saveCustomWordPairs(wordPairs);
        alert('单词对保存成功！');
    } else {
        alert('请至少添加一个有效的单词对！');
    }
}

// 保存图片单词对
function saveImageWordPairs() {
    const imagePairs = [];
    const imagePairElements = document.querySelectorAll('.image-pair');
    
    imagePairElements.forEach(element => {
        const englishImage = element.querySelector('.upload-box:nth-child(1) .image-data').value;
        const chineseImage = element.querySelector('.upload-box:nth-child(2) .image-data').value;
        
        if (englishImage && chineseImage) {
            imagePairs.push({
                englishImage: englishImage,
                chineseImage: chineseImage
            });
        }
    });
    
    if (imagePairs.length > 0) {
        saveCustomImagePairs(imagePairs);
        alert('图片对保存成功！');
    } else {
        alert('请至少添加一个有效的图片对！');
    }
}