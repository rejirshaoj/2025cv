// 添加大气层效果
function addAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius + 0.15, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    return atmosphere;
}

// 添加信息标记
function addInfoMarker(lat, lon, text) {
    // 将经纬度转换为3D坐标
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -earthRadius * Math.sin(phi) * Math.cos(theta);
    const y = earthRadius * Math.cos(phi);
    const z = earthRadius * Math.sin(phi) * Math.sin(theta);
    
    // 创建标记点
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    
    marker.position.set(x, y, z);
    scene.add(marker);
    
    // 创建标签
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.position.set(x * 1.2, y * 1.2, z * 1.2);
    sprite.scale.set(2, 1, 1);
    scene.add(sprite);
    
    return { marker, sprite };
}

// 添加南极科考站标记
function addAntarcticResearchStations() {
    // 添加几个主要的南极科考站
    addInfoMarker(-90, 0, "南极点站");
    addInfoMarker(-77.85, 166.76, "麦克默多站");
    addInfoMarker(-69.01, 39.58, "中山站");
    addInfoMarker(-66.28, 110.52, "凯西站");
    addInfoMarker(-75.1, -123.35, "阿蒙森-斯科特站");
}

// 添加南极冰盖可视化
function addAntarcticIceSheet() {
    // 创建南极冰盖
    const iceSheetGeometry = new THREE.SphereGeometry(earthRadius + 0.05, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 6);
    const iceSheetMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        shininess: 100
    });
    
    const iceSheet = new THREE.Mesh(iceSheetGeometry, iceSheetMaterial);
    scene.add(iceSheet);
    
    return iceSheet;
}

// 添加南极洲信息面板
function createAntarcticaInfoPanel() {
    // 创建信息面板
    const infoPanel = document.createElement('div');
    infoPanel.className = 'antarctica-detailed-info';
    infoPanel.style.position = 'absolute';
    infoPanel.style.left = '10px';
    infoPanel.style.top = '50%';
    infoPanel.style.transform = 'translateY(-50%)';
    infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    infoPanel.style.color = 'white';
    infoPanel.style.padding = '15px';
    infoPanel.style.borderRadius = '5px';
    infoPanel.style.maxWidth = '300px';
    infoPanel.style.maxHeight = '400px';
    infoPanel.style.overflowY = 'auto';
    infoPanel.style.display = 'none';
    
    infoPanel.innerHTML = `
        <h2>南极洲详细信息</h2>
        <p><strong>面积:</strong> 约1400万平方公里</p>
        <p><strong>平均海拔:</strong> 2500米</p>
        <p><strong>最低温度记录:</strong> -89.2°C (沃斯托克站)</p>
        <p><strong>冰层厚度:</strong> 平均1.6公里，最厚处超过4.5公里</p>
        <p><strong>科考站数量:</strong> 约70个</p>
        <p><strong>主要国家科考站:</strong> 美国、俄罗斯、中国、英国、澳大利亚等</p>
        <h3>中国在南极的科考站</h3>
        <p><strong>长城站:</strong> 1985年建立，位于南设得兰群岛乔治王岛</p>
        <p><strong>中山站:</strong> 1989年建立，位于东南极拉斯曼丘陵</p>
        <p><strong>昆仑站:</strong> 2009年建立，位于南极冰盖最高点冰穹A</p>
        <p><strong>泰山站:</strong> 2014年建立，位于南极冰盖Princess Elizabeth Land</p>
        <button id="close-info-panel">关闭</button>
    `;
    
    document.body.appendChild(infoPanel);
    
    // 添加关闭按钮事件
    document.getElementById('close-info-panel').addEventListener('click', () => {
        infoPanel.style.display = 'none';
    });
    
    return infoPanel;
}

// 添加南极洲详情按钮
function addAntarcticaDetailButton() {
    const detailButton = document.createElement('button');
    detailButton.id = 'antarctica-detail-btn';
    detailButton.textContent = '南极洲详情';
    detailButton.style.position = 'absolute';
    detailButton.style.left = '10px';
    detailButton.style.bottom = '10px';
    detailButton.style.padding = '8px 12px';
    detailButton.style.backgroundColor = '#4CAF50';
    detailButton.style.color = 'white';
    detailButton.style.border = 'none';
    detailButton.style.borderRadius = '4px';
    detailButton.style.cursor = 'pointer';
    
    document.body.appendChild(detailButton);
    
    const infoPanel = createAntarcticaInfoPanel();
    
    detailButton.addEventListener('click', () => {
        if (infoPanel.style.display === 'none') {
            infoPanel.style.display = 'block';
        } else {
            infoPanel.style.display = 'none';
        }
    });
}

// 添加南极洲冰层变化动画
function addIceSheetAnimation(iceSheet) {
    let time = 0;
    let direction = 1;
    
    function animateIceSheet() {
        time += 0.01 * direction;
        
        if (time > 1) {
            direction = -1;
        } else if (time < 0) {
            direction = 1;
        }
        
        // 模拟冰层厚度变化
        iceSheet.scale.set(1, 1 - time * 0.05, 1);
        
        requestAnimationFrame(animateIceSheet);
    }
    
    animateIceSheet();
}

// 添加极光效果
function addAuroraBorealis() {
    // 创建极光几何体
    const auroraGeometry = new THREE.BufferGeometry();
    const auroraVertices = [];
    const auroraColors = [];
    
    // 生成极光点
    const radius = earthRadius + 0.5;
    const segments = 100;
    const rings = 20;
    
    for (let i = 0; i < rings; i++) {
        const phi = Math.PI / 2 - (i / rings) * Math.PI / 6; // 限制在南极区域
        const ringRadius = radius * Math.cos(phi);
        
        for (let j = 0; j < segments; j++) {
            const theta = (j / segments) * Math.PI * 2;
            
            const x = ringRadius * Math.cos(theta);
            const y = radius * Math.sin(phi);
            const z = ringRadius * Math.sin(theta);
            
            auroraVertices.push(x, y, z);
            
            // 添加颜色渐变
            const r = 0.1 + 0.2 * Math.sin(i / rings * Math.PI);
            const g = 0.4 + 0.4 * Math.sin(j / segments * Math.PI);
            const b = 0.6 + 0.4 * Math.cos(i / rings * Math.PI);
            
            auroraColors.push(r, g, b);
        }
    }
    
    auroraGeometry.setAttribute('position', new THREE.Float32BufferAttribute(auroraVertices, 3));
    auroraGeometry.setAttribute('color', new THREE.Float32BufferAttribute(auroraColors, 3));
    
    const auroraMaterial = new THREE.PointsMaterial({
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });
    
    const aurora = new THREE.Points(auroraGeometry, auroraMaterial);
    scene.add(aurora);
    
    // 添加动画
    function animateAurora() {
        const positions = aurora.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.002;
            positions[i + 1] += Math.cos(Date.now() * 0.0015 + i) * 0.001;
            positions[i + 2] += Math.sin(Date.now() * 0.001 + i) * 0.002;
        }
        
        aurora.geometry.attributes.position.needsUpdate = true;
        
        requestAnimationFrame(animateAurora);
    }
    
    animateAurora();
    
    return aurora;
}

// 导出所有功能，以便在main.js中使用
window.AntarcticaFeatures = {
    addAtmosphere,
    addInfoMarker,
    addAntarcticResearchStations,
    addAntarcticIceSheet,
    addAntarcticaDetailButton,
    addIceSheetAnimation,
    addAuroraBorealis
};