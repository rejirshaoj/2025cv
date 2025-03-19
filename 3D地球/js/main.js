// 初始化场景、相机和渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// 创建地球
const earthRadius = 5;
const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

// 加载地球纹理
const textureLoader = new THREE.TextureLoader();
// 地球表面纹理（使用卫星影像）
const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg', () => {});
      
// 地球凹凸纹理（用于地形）
const earthBumpMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg');
      
// 地球镜面反射纹理（用于海洋反光）
const earthSpecularMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg');
      
const earthMaterial = new THREE.MeshPhongMaterial({ 
    map: earthTexture,
    bumpMap: earthBumpMap,
    bumpScale: 0.05,
    specularMap: earthSpecularMap,
    specular: new THREE.Color(0x333333),
    shininess: 5
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// 创建南极洲高亮
const antarcticaGeometry = new THREE.SphereGeometry(earthRadius + 0.01, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 6);
const antarcticaMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
});

const antarctica = new THREE.Mesh(antarcticaGeometry, antarcticaMaterial);
scene.add(antarctica);

// 创建南极洲边界线
function createAntarcticaBoundary() {
    // 南极洲边界的大致坐标点（简化版）
    const antarcticaPoints = [];
    
    // 生成南极洲边界的点（这里使用简化的圆形边界）
    const segments = 50;
    const latitudeAngle = Math.PI / 3; // 南纬60度左右
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * Math.sin(latitudeAngle);
        const y = -Math.cos(latitudeAngle);
        const z = Math.sin(theta) * Math.sin(latitudeAngle);
        
        antarcticaPoints.push(new THREE.Vector3(x, y, z).multiplyScalar(earthRadius + 0.02));
    }
    
    const antarcticaGeometry = new THREE.BufferGeometry().setFromPoints(antarcticaPoints);
    const antarcticaMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    const antarcticaBoundary = new THREE.Line(antarcticaGeometry, antarcticaMaterial);
    
    return antarcticaBoundary;
}

const antarcticaBoundary = createAntarcticaBoundary();
scene.add(antarcticaBoundary);

// 添加云层
const cloudsGeometry = new THREE.SphereGeometry(earthRadius + 0.03, 64, 64);
const cloudsTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png');
const cloudsMaterial = new THREE.MeshPhongMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.4
});

const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
scene.add(clouds);

// 添加星空背景
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1
});

const starsVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// 设置相机位置
// 修改相机位置
camera.position.z = 15;
camera.position.y = 0; // 确保相机不是朝向地球之外的方向
camera.lookAt(scene.position); // 确保相机朝向场景中心

// 添加轨道控制器
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 6;
controls.maxDistance = 30;

// 旋转状态变量
let isRotating = true;
let rotationSpeed = 0.001;

// 处理窗口大小变化
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(newWidth, newHeight);
});

// 添加按钮功能
document.getElementById('focus-antarctica').addEventListener('click', () => {
    // 聚焦到南极洲
    gsap.to(controls.target, {
        x: 0,
        y: -earthRadius,
        z: 0,
        duration: 2
    });
    
    gsap.to(camera.position, {
        x: 0,
        y: -earthRadius - 8,
        z: 8,
        duration: 2
    });
});

document.getElementById('toggle-rotation').addEventListener('click', () => {
    isRotating = !isRotating;
});

document.getElementById('toggle-highlight').addEventListener('click', () => {
    antarctica.visible = !antarctica.visible;
    antarcticaBoundary.visible = !antarcticaBoundary.visible;
});

// 添加GSAP动画库
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js';
document.head.appendChild(script);

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (isRotating) {
        // 地球自转
        earth.rotation.y += rotationSpeed;
        clouds.rotation.y += rotationSpeed * 1.1; // 云层转动稍快
        antarctica.rotation.y += rotationSpeed;
        antarcticaBoundary.rotation.y += rotationSpeed;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 确保animate函数被调用
animate();

// 加载高级功能
document.addEventListener('DOMContentLoaded', () => {
    // 确保高级功能脚本已加载
    if (window.AntarcticaFeatures) {
        // 添加大气层
        const atmosphere = window.AntarcticaFeatures.addAtmosphere();
        
        // 添加南极科考站标记
        window.AntarcticaFeatures.addAntarcticResearchStations();
        
        // 添加南极冰盖
        const iceSheet = window.AntarcticaFeatures.addAntarcticIceSheet();
        
        // 添加冰盖动画
        window.AntarcticaFeatures.addIceSheetAnimation(iceSheet);
        
        // 添加南极洲详情按钮
        window.AntarcticaFeatures.addAntarcticaDetailButton();
        
        // 添加极光效果
        const aurora = window.AntarcticaFeatures.addAuroraBorealis();
        
        // 将新添加的元素加入动画循环
        const originalAnimate = animate;
        animate = function() {
            originalAnimate();
            
            if (isRotating) {
                atmosphere.rotation.y += rotationSpeed;
                iceSheet.rotation.y += rotationSpeed;
            }
        };
    } else {
        console.error('高级功能未加载，请检查advanced-features.js文件是否正确引入');
    }
});

// 在main.js文件开头添加
console.log('正在加载3D地球...');

// 在纹理加载后添加
earthTexture.onload = function() {
    console.log('地球纹理加载成功');
};
earthTexture.onerror = function() {
    console.error('地球纹理加载失败');
};

// 在初始化渲染器后添加
renderer.setClearColor(0x111111); // 设置深灰色背景，而不是默认的黑色