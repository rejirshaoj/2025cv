document.addEventListener('DOMContentLoaded', function() {
    // 标签切换功能
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active类
            tabs.forEach(t => t.classList.remove('active'));
            // 为当前标签添加active类
            this.classList.add('active');
            
            // 获取目标面板
            const targetId = this.getAttribute('data-tab');
            
            // 隐藏所有面板
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // 显示目标面板
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // 文件上传功能
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.querySelector('.upload-btn');
    const uploadedImagesContainer = document.querySelector('.uploaded-images');
    
    // 点击上传按钮触发文件选择
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 拖放功能
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // 文件选择处理
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFiles(this.files);
        }
    });
    
    // 处理上传的文件
    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 检查是否为图片
            if (!file.type.match('image.*')) {
                alert('请上传图片文件！');
                continue;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'uploaded-image';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', function() {
                    imgContainer.remove();
                });
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                uploadedImagesContainer.appendChild(imgContainer);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // 生成按钮功能
    const generateBtn = document.querySelector('.generate-btn');
    const resultsSection = document.querySelector('.results-section');
    
    // 修改生成按钮功能部分
    generateBtn.addEventListener('click', function() {
        // 获取当前活动的标签
        const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
        
        // 根据不同的标签执行不同的操作
        if (activeTab === 'image-upload') {
            // 检查是否有上传的图片
            const uploadedImages = document.querySelectorAll('.uploaded-image');
            if (uploadedImages.length === 0) {
                alert('请先上传图片！');
                return;
            }
            
            // 收集所有图片文件
            const formData = new FormData();
            const imageFiles = document.querySelectorAll('.uploaded-image img');
            
            imageFiles.forEach((img, index) => {
                // 将Base64图片转换为Blob
                fetch(img.src)
                    .then(res => res.blob())
                    .then(blob => {
                        formData.append('images', blob, `image_${index}.jpg`);
                    });
            });
            
            // 添加其他参数
            const duration = document.getElementById('duration').value;
            const voiceStyle = document.getElementById('voice-style').value;
            const showText = document.querySelector('.switch input').checked;
            
            formData.append('duration', duration);
            formData.append('style', voiceStyle);
            formData.append('showText', showText);
            
            // 显示加载动画
            showLoading('正在处理图片并生成动画，请稍候...');
            
            // 调用API
            fetch('/api/generate', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                
                if (data.success) {
                    // 显示结果部分
                    resultsSection.style.display = 'block';
                    
                    // 设置视频源
                    document.querySelector('.result-preview video source').src = data.videoUrl;
                    document.querySelector('.result-preview video').load();
                    
                    // 滚动到结果部分
                    resultsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('生成失败：' + data.error);
                }
            })
            .catch(error => {
                hideLoading();
                alert('发生错误：' + error.message);
            });
            
        } else if (activeTab === 'text-input') {
            // 获取文本输入
            const text = document.querySelector('#text-input textarea').value.trim();
            if (!text) {
                alert('请输入科幻故事描述！');
                return;
            }
            
            // 获取其他参数
            const imageCount = document.getElementById('image-count').value;
            const textStyle = document.getElementById('style').value;
            const duration = document.getElementById('duration').value;
            const voiceStyle = document.getElementById('voice-style').value;
            const showText = document.querySelector('.switch input').checked;
            
            // 显示加载动画
            showLoading('正在根据文字生成图片和动画，请稍候...');
            
            // 调用API
            fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: 'text',
                    text: text,
                    numImages: parseInt(imageCount),
                    style: voiceStyle,
                    textStyle: textStyle,
                    duration: parseInt(duration),
                    showText: showText
                })
            })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                
                if (data.success) {
                    // 显示结果部分
                    resultsSection.style.display = 'block';
                    
                    // 设置视频源
                    document.querySelector('.result-preview video source').src = data.videoUrl;
                    document.querySelector('.result-preview video').load();
                    
                    // 滚动到结果部分
                    resultsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('生成失败：' + data.error);
                }
            })
            .catch(error => {
                hideLoading();
                alert('发生错误：' + error.message);
            });
        }
    });
    
    // 下载按钮功能
    const downloadBtn = document.querySelector('.download-btn');
    downloadBtn.addEventListener('click', function() {
        // 实际项目中应该是从后端获取视频URL
        const videoUrl = document.querySelector('.result-preview video source').src;
        
        // 创建一个临时链接来下载视频
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = '科幻动画.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    
    // 分享按钮功能
    const shareBtn = document.querySelector('.share-btn');
    shareBtn.addEventListener('click', function() {
        // 实际项目中应该实现分享功能
        alert('分享功能即将上线！');
    });
    
    // 重新生成按钮功能
    const regenerateBtn = document.querySelector('.regenerate-btn');
    regenerateBtn.addEventListener('click', function() {
        // 滚动到生成器部分
        document.querySelector('.generator-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // 示例项目点击功能
    const exampleItems = document.querySelectorAll('.example-item');
    exampleItems.forEach(item => {
        item.addEventListener('click', function() {
            // 实际项目中应该加载示例项目
            alert('示例项目功能即将上线！');
        });
    });
    
    // 加载动画功能
    function showLoading(text) {
        // 创建加载动画元素
        const loading = document.createElement('div');
        loading.className = 'loading';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = text || '加载中...';
        
        loading.appendChild(spinner);
        loading.appendChild(loadingText);
        
        document.body.appendChild(loading);
    }
    
    function hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
    
    // 连接后端API的函数（实际项目中实现）
    function callBackendAPI(data, callback) {
        // 这里应该是实际的API调用
        // 例如使用fetch或axios
        
        // 模拟API调用
        setTimeout(() => {
            callback({
                success: true,
                videoUrl: 'example_video.mp4'
            });
        }, 2000);
    }
});