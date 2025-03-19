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

// 在main.js中调用此函数并添加到场景中